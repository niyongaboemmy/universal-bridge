import type { Locale } from "@/i18n/routing";

export const eventDate = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "rw" ? "en-GB" : locale, {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Kigali",
  }).format(new Date(iso));
