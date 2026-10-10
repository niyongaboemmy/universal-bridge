import { createTranslator } from "next-intl";
import en from "@/i18n/messages/en.json";
import fr from "@/i18n/messages/fr.json";
import rw from "@/i18n/messages/rw.json";
import type { Locale } from "@/i18n/routing";

const MESSAGES = { en, fr, rw } as const;

/** Translator that works outside a request (outbox worker, tests). */
export function emailTranslator(locale: Locale) {
  return createTranslator({ locale, messages: MESSAGES[locale] ?? en, namespace: "emails" });
}

export function formTranslator(locale: Locale) {
  return createTranslator({ locale, messages: MESSAGES[locale] ?? en, namespace: "form" });
}
