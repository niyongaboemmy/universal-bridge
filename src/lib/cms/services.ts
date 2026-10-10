import "server-only";
import type { Locale } from "@/i18n/routing";
import { getServices } from "./content";

/** Service chips for the inquiry form. */
export async function getServiceOptions(
  locale: Locale,
): Promise<{ value: string; label: string }[]> {
  return (await getServices(locale)).map((s) => ({ value: s.slug, label: s.title }));
}
