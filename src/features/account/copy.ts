import "server-only";
import { getMessages, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

/** Flat copy for the account forms (client components get plain strings). */
export async function accountCopy(locale: Locale): Promise<Record<string, string>> {
  const [messages, f] = await Promise.all([
    getMessages({ locale }),
    getTranslations({ locale, namespace: "form" }),
  ]);
  const raw = (messages as Record<string, Record<string, unknown>>).account ?? {};
  const flat = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;
  return { ...flat, errName: f("errors.tooShort", { min: 2 }), errEmail: f("errors.email") };
}
