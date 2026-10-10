import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InsightsListing } from "@/features/insights/Listing";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "s5.insights" });
  return {
    ...pageMetadata({ locale, path: "/insights", title: t("title"), description: t("lead") }),
    alternates: {
      ...pageMetadata({ locale, path: "/insights", title: t("title") }).alternates,
      types: { "application/rss+xml": "/feed.xml" },
    },
  };
}

export default async function InsightsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "s5.insights" });
  return <InsightsListing locale={locale} crumbs={[{ label: t("title"), href: "/insights" }]} />;
}
