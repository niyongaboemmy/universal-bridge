import "server-only";
import { getCountries } from "libphonenumber-js/min";
import type { Locale } from "@/i18n/routing";

/** Country options in the visitor's language, Rwanda and neighbours first. */
export function countryOptions(locale: Locale): { value: string; label: string }[] {
  const names = new Intl.DisplayNames([locale === "rw" ? "en" : locale], { type: "region" });
  const all = getCountries()
    .map((code) => ({ value: code, label: names.of(code) ?? code }))
    .sort((a, b) => a.label.localeCompare(b.label, locale));
  const first = ["RW", "KE", "UG", "TZ", "BI", "CD"];
  return [
    ...first.map((c) => all.find((o) => o.value === c)!).filter(Boolean),
    ...all.filter((o) => !first.includes(o.value)),
  ];
}
