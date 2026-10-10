import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { CmsPage, cmsPageMetadata } from "@/lib/cms/page";
import { LegacyHashRedirect } from "@/components/layout/LegacyHashRedirect";

// The Academy teaser lists open intakes (deadlines pass): re-render hourly.
export const revalidate = 3600;

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = await cmsPageMetadata("home", locale, "/");
  // The home page uses the default title (no "· Universal Bridge Ltd" suffix twice).
  return { ...meta, title: { absolute: String(meta.title ?? "Universal Bridge Ltd") } };
}

// FR-HOME-01…13: the home page is CMS blocks (CMS-04), editable without a developer.
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <CmsPage slug="home" locale={locale} />
      <LegacyHashRedirect />
    </>
  );
}
