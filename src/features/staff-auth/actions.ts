"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { can, type UserLike } from "@/access/roles";
import { audit } from "@/lib/audit";
import { MFA_COOKIE, mfaMode } from "@/lib/auth/mfa-proof";
import { passwordProblem } from "@/lib/auth/password";
import { endSession, staffSession } from "@/lib/auth/staff-session";
import { payload } from "@/lib/cms/payload";
import { settings } from "@/lib/settings";
import { secureCookies } from "@/lib/auth/secure-cookies";
import { isLockedAuth } from "@/lib/auth/payload-errors";

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
    if (status === 429) return { error: (err as Error).message, email };
    if (isLockedAuth(err))
      return { error: "This account is locked for 15 minutes after too many attempts.", email };
    return { error: "That email and password don't match an account.", email };
  }
  if (!result.token) return { error: "Sign-in failed. Try again.", email };
  const auth = p.collections.users.config.auth;
  (await cookies()).set(`${p.config.cookiePrefix}-token`, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies(),
    path: "/",
    expires: new Date(Date.now() + auth.tokenExpiration * 1000),
  });
  const to = (result.user as { mustChangePassword?: boolean }).mustChangePassword
    ? "/office/profile?first=1"
    : await landing(result.user as never, form.get("next"));
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

export type ResetState = { error?: string; expired?: boolean } | null;

/**
 * Sets a staff password from an emailed link (forgot password or invitation).
 * The link works once; Payload ends every other session of the account. On
 * success the person is signed in and lands in the office (MFA first if on).
 */
export async function setStaffPassword(_prev: ResetState, form: FormData): Promise<ResetState> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (!token) return { error: "This link is incomplete. Ask for a new one.", expired: true };
  const p = await payload();
  // The account behind the link, so the policy can reject passwords made of the person's details.
  const owner = (await p.db.findOne({
    collection: "users",
    where: {
      resetPasswordToken: { equals: token },
      resetPasswordExpiration: { greater_than: new Date().toISOString() },
    },
  })) as { id: number; email: string; name?: string } | null;
  if (!owner) return { error: "This link has expired or was already used.", expired: true };
  const problem = passwordProblem(password, { email: owner.email, name: owner.name });
  if (problem) return { error: problem };
  if (password !== confirm) return { error: "The two passwords don't match." };

  let result: Awaited<ReturnType<typeof p.resetPassword<"users">>>;
  const h = await headers();
  try {
    result = await p.resetPassword({
      collection: "users",
      data: { token, password },
      overrideAccess: true,
      req: { headers: h } as never,
    });
  } catch {
    return { error: "This link has expired or was already used.", expired: true };
  }
  const user = result.user as unknown as UserLike & {
    id: number;
    mustChangePassword?: boolean;
    landing?: string | null;
  };
  // A password chosen from the link is the person's own: no forced change at first sign-in.
  if (user.mustChangePassword)
    await p.update({
      collection: "users",
      id: user.id,
      data: { mustChangePassword: false } as never,
      overrideAccess: true,
      context: { passwordSet: true },
    });
  await audit(
    { payload: p, user: { ...user, collection: "users" }, headers: h, context: {} } as never,
    {
      action: "auth.password-reset",
      entity: "users",
      entityId: user.id,
      meta: { via: form.get("invite") ? "invitation" : "reset-link" },
    },
  );
  if (!result.token) redirect("/login?reset=1");
  const auth = p.collections.users.config.auth;
  (await cookies()).set(`${p.config.cookiePrefix}-token`, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies(),
    path: "/",
    expires: new Date(Date.now() + auth.tokenExpiration * 1000),
  });
  const to = await landing(user, null);
  if (mfaMode() !== "off") redirect(`/staff/mfa?next=${encodeURIComponent(to)}`);
  redirect(to);
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
