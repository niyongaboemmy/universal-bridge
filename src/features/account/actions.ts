"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale, localizePath, type Locale } from "@/i18n/routing";
import { audit } from "@/lib/audit";
import { passwordProblem } from "@/lib/auth/password";
import { payload } from "@/lib/cms/payload";
import { settings } from "@/lib/settings";
import { currentMember } from "./session";
import { secureCookies } from "@/lib/auth/secure-cookies";

export type AccountState = {
  error?: string;
  ok?: boolean;
  email?: string;
  values?: Record<string, string>;
} | null;

const loc = (form: FormData): Locale => {
  const l = String(form.get("locale") ?? "en");
  return isLocale(l) ? l : "en";
};

/** Only same-site, non-staff pages after sign-in. */
function safeNext(next: unknown, locale: Locale) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") && !/^\/(admin|office|api|staff|login)/.test(n)
    ? n
    : localizePath("/account", locale);
}

async function setToken(token: string) {
  const p = await payload();
  const auth = p.collections.members.config.auth;
  (await cookies()).set(`${p.config.cookiePrefix}-token`, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies(),
    path: "/",
    expires: new Date(Date.now() + auth.tokenExpiration * 1000),
  });
}

/** Error messages are i18n keys of the "account" namespace (translated in the form). */
export async function memberLogin(_: AccountState, form: FormData): Promise<AccountState> {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") ?? "");
  const locale = loc(form);
  if (!email || !password) return { error: "wrong", email };
  const p = await payload();
  try {
    const r = await p.login({
      collection: "members",
      data: { email, password },
      req: { headers: await headers() } as never,
    });
    if (!r.token) return { error: "wrong", email };
    await setToken(r.token);
  } catch (err) {
    const name = (err as { name?: string }).name;
    return {
      error:
        name === "LockedAuth" || (err as { status?: number }).status === 429 ? "locked" : "wrong",
      email,
    };
  }
  redirect(safeNext(form.get("next"), locale));
}

export async function memberRegister(_: AccountState, form: FormData): Promise<AccountState> {
  const locale = loc(form);
  const values = {
    name: String(form.get("name") ?? "").trim(),
    email: String(form.get("email") ?? "")
      .trim()
      .toLowerCase(),
    phone: String(form.get("phone") ?? "").trim(),
  };
  if (!(await settings()).registrationOpen) return { error: "registrationClosed", values };
  if (String(form.get("website") ?? "")) redirect(localizePath("/account", locale)); // honeypot
  if (values.name.length < 2) return { error: "errName", values };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) return { error: "errEmail", values };
  const password = String(form.get("password") ?? "");
  const problem = passwordProblem(password, { email: values.email, name: values.name });
  if (problem) return { error: `password:${problem}`, values };

  const { rateLimit } = await import("@/lib/security/rate-limit");
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  if (!(await rateLimit("member-register", ip, { limit: 5, windowSec: 3600 })).success)
    return { error: "locked", values };

  const p = await payload();
  const exists = await p.count({
    collection: "members",
    where: { email: { equals: values.email } },
    overrideAccess: true,
  });
  if (exists.totalDocs) return { error: "exists", values };
  const doc = await p.create({
    collection: "members",
    overrideAccess: true,
    data: {
      ...values,
      phone: values.phone || undefined,
      password,
      locale,
      newsletter: form.get("newsletter") === "on",
    } as never,
  });
  const r = await p.login({ collection: "members", data: { email: values.email, password } });
  if (r.token) await setToken(r.token);
  await audit(
    { payload: p, user: { ...doc, collection: "members" }, headers: h, context: {} } as never,
    {
      action: "member.register",
      entity: "members",
      entityId: doc.id,
    },
  );
  redirect(safeNext(form.get("next"), locale));
}

export async function memberLogout(form: FormData) {
  const p = await payload();
  (await cookies()).delete(`${p.config.cookiePrefix}-token`);
  redirect(localizePath("/account/login", loc(form)));
}

export async function memberForgot(_: AccountState, form: FormData): Promise<AccountState> {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email.includes("@")) return { error: "errEmail", email };
  const p = await payload();
  try {
    await p.forgotPassword({
      collection: "members",
      data: { email },
      req: { headers: await headers() } as never,
    });
  } catch {
    // Same answer whether or not the account exists.
  }
  return { ok: true, email };
}

export async function memberReset(_: AccountState, form: FormData): Promise<AccountState> {
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  const problem = passwordProblem(password);
  if (problem) return { error: `password:${problem}` };
  const p = await payload();
  try {
    const r = await p.resetPassword({
      collection: "members",
      data: { token, password },
      overrideAccess: true,
    });
    if (r.token) await setToken(r.token);
  } catch {
    return { error: "resetInvalid" };
  }
  redirect(`${localizePath("/account", loc(form))}?reset=1`);
}

export async function saveMemberProfile(_: AccountState, form: FormData): Promise<AccountState> {
  const member = await currentMember();
  if (!member) return { error: "wrong" };
  const name = String(form.get("name") ?? "").trim();
  if (name.length < 2) return { error: "errName" };
  const locale = String(form.get("emailLocale") ?? "en");
  const p = await payload();
  await p.update({
    collection: "members",
    id: member.id,
    data: {
      name,
      phone: String(form.get("phone") ?? "").trim() || null,
      country: String(form.get("country") ?? "").trim() || null,
      locale: isLocale(locale) ? locale : "en",
      newsletter: form.get("newsletter") === "on",
    },
    user: { ...member, collection: "members" } as never,
    overrideAccess: false,
  });
  return { ok: true };
}
