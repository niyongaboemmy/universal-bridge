import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { MFA_COOKIE, MFA_HEADER, mfaMode, verifyMfaProof } from "./mfa-proof";
import { passwordProblem } from "./password";

/**
 * ADM-01 / NFR-SEC-05, enforced in the proxy for every admin page and API call:
 * a staff token (cookie or Authorization header) only works once its session
 * has passed MFA. Password-only sessions are sent to /staff/mfa (pages) or get
 * 401 MFA_REQUIRED (API). Payload's own sign-in, sign-out and reset endpoints
 * stay open, and new passwords are checked against the policy here.
 */
const OPEN = [
  /^\/admin\/(login|logout|forgot|reset|create-first-user|unauthorized)(\/|$)/,
  /^\/api\/users\/(login|logout|forgot-password|reset-password|first-register|refresh-token|init|me)\/?$/,
  /^\/api\/(health|cron|revalidate|newsletter|search-index|sso)(\/|$)/,
];
const PASSWORD_SET = /^\/api\/users\/(reset-password|first-register)\/?$/;

let secretKey: Promise<Uint8Array> | null = null;
// Payload signs with sha256(PAYLOAD_SECRET) as hex, first 32 characters.
function payloadKey() {
  secretKey ??= crypto.subtle
    .digest("SHA-256", new TextEncoder().encode(process.env.PAYLOAD_SECRET ?? ""))
    .then((d) =>
      new TextEncoder().encode(
        [...new Uint8Array(d)]
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .slice(0, 32),
      ),
    );
  return secretKey;
}

type StaffClaims = {
  id?: string | number;
  collection?: string;
  sid?: string;
  mfaEnabled?: boolean;
};

export async function readStaffToken(request: NextRequest): Promise<StaffClaims | null> {
  const auth = request.headers.get("authorization");
  const token =
    request.cookies.get("payload-token")?.value ??
    (auth?.match(/^(?:JWT|Bearer) (.+)$/)?.[1] || undefined);
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await payloadKey());
    const claims = payload as StaffClaims;
    return claims.collection === "users" && claims.id !== undefined ? claims : null;
  } catch {
    return null; // expired or forged: Payload treats the request as anonymous
  }
}

async function checkNewPassword(request: NextRequest): Promise<NextResponse | null> {
  let password: unknown;
  let email: unknown;
  try {
    const type = request.headers.get("content-type") ?? "";
    if (type.includes("application/json")) {
      ({ password, email } = (await request.clone().json()) as {
        password?: unknown;
        email?: unknown;
      });
    } else if (type.includes("form")) {
      const form = await request.clone().formData();
      const raw = form.get("_payload");
      ({ password, email } = (raw ? JSON.parse(String(raw)) : Object.fromEntries(form)) as {
        password?: unknown;
        email?: unknown;
      });
    }
  } catch {
    return null;
  }
  if (password === undefined) return null;
  const problem = passwordProblem(password, { email: typeof email === "string" ? email : null });
  return problem
    ? NextResponse.json({ errors: [{ message: problem, field: "password" }] }, { status: 400 })
    : null;
}

export async function adminGate(request: NextRequest): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl;
  if (request.method === "POST" && PASSWORD_SET.test(pathname)) return checkNewPassword(request);
  if (mfaMode() === "off") return null; // normal email + password sign-in
  if (OPEN.some((re) => re.test(pathname))) return null;

  const claims = await readStaffToken(request);
  if (!claims) return null;
  const proof = request.cookies.get(MFA_COOKIE)?.value ?? request.headers.get(MFA_HEADER);
  if (await verifyMfaProof(proof, claims.id!, claims.sid)) return null;
  if (!claims.mfaEnabled && mfaMode() !== "required") return null;

  if (pathname.startsWith("/api")) {
    return NextResponse.json(
      { errors: [{ message: "Two-step verification required.", code: "MFA_REQUIRED" }] },
      { status: 401 },
    );
  }
  const url = new URL("/staff/mfa", request.url);
  url.searchParams.set("next", pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}
