import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InsightsListing, PAGE_SIZE } from "@/features/insights/Listing";
import { routing, type Locale } from "@/i18n/routing";
import { getPosts } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale; n: string }> };

// FR-BLOG-01 pagination: page 2 onwards (page 1 is /insights; the featured post sits there).
async function pageCount(locale: Locale) {
  const posts = await getPosts(locale);
  return Math.max(1, Math.ceil(Math.max(0, posts.length - 1) / PAGE_SIZE));
}

export async function generateStaticParams() {
  const count = await pageCount("en");
  return routing.locales.flatMap((locale) =>
    Array.from({ length: count - 1 }, (_, i) => ({ locale, n: String(i + 2) })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, n } = await params;
  const t = await getTranslations({ locale, namespace: "s5.insights" });
  return pageMetadata({
    locale,
    path: `/insights/page/${n}`,
    title: `${t("title")} — ${t("page", { n })}`,
  });
}

export default async function InsightsPage({ params }: Props) {
  const { locale, n } = await params;
  setRequestLocale(locale);
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2 || page > (await pageCount(locale))) notFound();
  const t = await getTranslations({ locale, namespace: "s5.insights" });
  return (
    <InsightsListing
      locale={locale}
      page={page}
      crumbs={[
        { label: t("title"), href: "/insights" },
        { label: t("page", { n: page }), href: `/insights/page/${page}` },
      ]}
    />
  );
}
