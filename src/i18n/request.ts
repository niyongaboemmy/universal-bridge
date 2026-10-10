import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import en from "./messages/en.json";

type Messages = typeof en;

// Deep-merge so a key missing from fr/rw falls back to English (I18N-05).
function withFallback(base: Messages, override: unknown): Messages {
  if (typeof override !== "object" || override === null) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const baseValue = (base as Record<string, unknown>)[key];
    out[key] =
      typeof value === "object" && value !== null && typeof baseValue === "object"
        ? withFallback(baseValue as Messages, value)
        : value;
  }
  return out as Messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const messages =
    locale === "en" ? en : withFallback(en, (await import(`./messages/${locale}.json`)).default);
  return { locale, messages, timeZone: "Africa/Kigali" };
});
