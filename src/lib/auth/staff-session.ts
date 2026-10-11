import "server-only";
import { cookies, headers } from "next/headers";
import type { PayloadRequest } from "payload";
import { payload } from "@/lib/cms/payload";
import { MFA_COOKIE, signMfaProof, verifyMfaProof } from "./mfa-proof";
import { secureCookies } from "@/lib/auth/secure-cookies";

export type StaffDoc = {
  id: number | string;
  email: string;
  name?: string;
  roles?: string[];
  mfaEnabled?: boolean;
  mfaSecret?: string | null;
  mfaPendingSecret?: string | null;
  mfaRecoveryCodes?: string[] | null;
  mfaLastStep?: number | null;
  mfaEnrolledSid?: string | null;
  mfaEnrolledAt?: string | null;
  sessions?: { id: string; createdAt?: string; expiresAt: string }[];
};

/** The signed-in staff member and their session id, read straight from the database. */
export async function staffSession() {
  const p = await payload();
  // Next already checks a server action's Origin against the host; without the Origin
  // header Payload falls back to Sec-Fetch-Site (same-origin), so this also works when
  // the site is reached on another host name than NEXT_PUBLIC_SITE_URL (www vs apex).
  const h = new Headers(await headers());
  h.delete("origin");
  const { user } = await p.auth({ headers: h });
  if (!user || user.collection !== "users") return null;
  const sid = (user as { _sid?: string })._sid;
  if (!sid) return null;
  const doc = (await p.findByID({
    collection: "users",
    id: user.id,
    overrideAccess: true,
    showHiddenFields: true,
    depth: 0,
  })) as unknown as StaffDoc;
  const proof = (await cookies()).get(MFA_COOKIE)?.value;
  return { p, user: doc, sid, verified: await verifyMfaProof(proof, doc.id, sid) };
}

export async function setMfaCookie(userId: StaffDoc["id"], sid: string) {
  (await cookies()).set(MFA_COOKIE, await signMfaProof(userId, sid), {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies(),
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

/** End this session everywhere (too many wrong codes): remove it and clear the cookies. */
export async function endSession(user: StaffDoc, sid: string) {
  const p = await payload();
  await p.db.updateOne({
    collection: "users",
    id: user.id,
    data: { sessions: (user.sessions ?? []).filter((s) => s.id !== sid) },
    returning: false,
  } as Parameters<typeof p.db.updateOne>[0]);
  const jar = await cookies();
  jar.delete("payload-token");
  jar.delete(MFA_COOKIE);
}

/** Write to the audit log as this staff member. */
export function staffReq(p: Awaited<ReturnType<typeof payload>>, user: StaffDoc) {
  return {
    payload: p,
    user: { ...user, collection: "users" },
    context: {},
  } as unknown as PayloadRequest;
}

/** Only same-site admin/staff paths are valid targets after verification. */
export function safeNext(next: unknown): string {
  const n = typeof next === "string" ? next : "";
  return /^\/(admin|staff|api\/certificate-tools)(\/|$|\?)/.test(n) && !n.startsWith("//")
    ? n
    : "/admin";
}
