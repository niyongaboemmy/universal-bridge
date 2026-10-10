import { NextResponse, type NextRequest } from "next/server";
import type { PayloadRequest } from "payload";
import { audit } from "@/lib/audit";
import { payload } from "@/lib/cms/payload";
import { createStaffSession, finishSignIn, provider } from "@/lib/auth/sso";

export const dynamic = "force-dynamic";

function fail(request: NextRequest, reason: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("sso", reason);
  return NextResponse.redirect(url);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const p = provider((await params).provider);
  if (!p) return NextResponse.json({ error: "Unknown or disabled provider" }, { status: 404 });
  const q = request.nextUrl.searchParams;
  const raw = request.cookies.get(`ub-sso-${p.id}`)?.value;
  let saved: { state: string; nonce: string; verifier: string } | null = null;
  try {
    saved = raw ? JSON.parse(raw) : null;
  } catch {
    saved = null;
  }
  if (q.get("error")) return fail(request, "cancelled");
  if (!saved || !q.get("code") || q.get("state") !== saved.state) return fail(request, "expired");

  const cms = await payload();
  let email: string;
  try {
    email = await finishSignIn(p, q.get("code")!, saved);
  } catch (error) {
    cms.logger.warn({ msg: "SSO sign-in rejected", provider: p.id, error: String(error) });
    return fail(request, "rejected");
  }
  const session = await createStaffSession(email);
  const req = {
    payload: cms,
    user: session ? { ...session.user, collection: "users" } : null,
    context: {},
  } as unknown as PayloadRequest;
  if (!session) {
    await audit(req, {
      action: "auth.sso-unknown",
      entity: "users",
      meta: { provider: p.id, domain: email.split("@")[1] },
    });
    return fail(request, "no-account");
  }
  await audit(req, {
    action: "auth.login",
    entity: "users",
    entityId: session.user.id,
    meta: { method: `sso:${p.id}` },
  });
  const res = NextResponse.redirect(new URL("/admin", request.url));
  res.cookies.set("payload-token", session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: session.secure,
    path: "/",
    maxAge: session.maxAge,
  });
  res.cookies.delete({ name: `ub-sso-${p.id}`, path: `/api/sso/${p.id}` });
  return res;
}
