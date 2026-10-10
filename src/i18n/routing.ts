import { defineRouting } from "next-intl/routing";

// I18N-01/02/03: English is the default and has no prefix; French and
// Kinyarwanda live under /fr and /rw. The choice is remembered in a cookie.
export const routing = defineRouting({
  locales: ["en", "fr", "rw"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeCookie: { name: "UB_LOCALE", maxAge: 60 * 60 * 24 * 365 },
});

export type Locale = (typeof routing.locales)[number];

export const localeLabels: Record<Locale, { short: string; native: string }> = {
  en: { short: "EN", native: "English" },
  fr: { short: "FR", native: "Français" },
  rw: { short: "RW", native: "Ikinyarwanda" },
};

export function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

/** Strip any locale prefix: "/fr/services" → "/services", "/fr" → "/". */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  if (first && isLocale(first)) return `/${rest.join("/")}`;
  return pathname || "/";
}

/** Build a path for `locale` with the `as-needed` prefix rule (EN has none). */
export function localizePath(path: string, locale: Locale): string {
  const clean = stripLocale(path);
  if (locale === routing.defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}
