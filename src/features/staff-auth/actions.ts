"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { can, type UserLike } from "@/access/roles";
import { MFA_COOKIE, mfaMode } from "@/lib/auth/mfa-proof";
import { endSession, staffSession } from "@/lib/auth/staff-session";
import { payload } from "@/lib/cms/payload";
import { settings } from "@/lib/settings";

export type SignInState = { error?: string; sent?: boolean; email?: string } | null;

/** Same-site staff destinations only (no open redirects). */
export async function staffNext(next: unknown): Promise<string | null> {
  const n = typeof next === "string" ? next : "";
  return /^\/(office|admin|staff|api\/certificate-tools|api\/live-edit\/enable)(\/|$|\?)/.test(n) &&
    !n.startsWith("//") &&
    !n.startsWith("/admin/login") &&
    !n.startsWith("/admin/logout")
    ? n
    : null;
}

/** Where a staff member lands: the page they asked for, else their choice, else the system default. */
async function landing(user: UserLike & { landing?: string | null }, next: unknown) {
  const asked = await staffNext(next);
  if (asked) return asked;
  const choice = user?.landing ?? (await settings()).staffLanding;
  return choice === "cms" && can(user, "cms.access") ? "/admin" : "/office";
}

export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", email };
  const p = await payload();
  let result: Awaited<ReturnType<typeof p.login<"users">>>;
  try {
    result = await p.login({
      collection: "users",
      data: { email, password },
      req: { headers: await headers() } as never,
      depth: 1,
    });
  } catch (err) {
    const status = (err as { status?: number }).status;
    const name = (err as { name?: string }).name;
    if (status === 429) return { error: (err as Error).message, email };
    if (name === "LockedAuth")
      return { error: "This account is locked for 15 minutes after too many attempts.", email };
    return { error: "That email and password don't match an account.", email };
  }
  if (!result.token) return { error: "Sign-in failed. Try again.", email };
  const auth = p.collections.users.config.auth;
  (await cookies()).set(`${p.config.cookiePrefix}-token`, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(Date.now() + auth.tokenExpiration * 1000),
  });
  const to = await landing(result.user as never, form.get("next"));
  // With two-step verification on, the proxy sends the session through /staff/mfa first.
  if (mfaMode() !== "off") redirect(`/staff/mfa?next=${encodeURIComponent(to)}`);
  redirect(to);
}

export async function requestReset(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email.includes("@")) return { error: "Enter the email of your staff account.", email };
  const p = await payload();
  try {
    await p.forgotPassword({
      collection: "users",
      data: { email },
      req: { headers: await headers() } as never,
    });
  } catch (err) {
    if ((err as { status?: number }).status === 429)
      return { error: (err as Error).message, email };
    // Unknown emails get the same answer (no account enumeration).
  }
  return { sent: true, email };
}

export async function signOut() {
  const session = await staffSession().catch(() => null);
  if (session) await endSession(session.user, session.sid);
  else {
    const jar = await cookies();
    jar.delete("payload-token");
    jar.delete(MFA_COOKIE);
  }
  redirect("/login?signedOut=1");
}
