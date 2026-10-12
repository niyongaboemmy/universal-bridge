import { CtaBandBlock } from "@/blocks/Sections";
import type { BlockOf } from "@/blocks/types";
import type { Locale } from "@/i18n/routing";

/** The home page's closing CTA band, for templates that aren't CMS pages. */
export function DetailCta({
  locale,
  eyebrow,
  title,
  lead,
  primary,
  secondary,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  lead?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  const block = {
    blockType: "ctaBand",
    eyebrow,
    title,
    lead,
    primary,
    secondary,
  } as BlockOf<"ctaBand">;
  return <CtaBandBlock block={block} locale={locale} />;
}
