import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InsightsListing } from "@/features/insights/Listing";
import { routing, type Locale } from "@/i18n/routing";
import { getCategories } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const cats = await getCategories("en");
  return routing.locales.flatMap((locale) => cats.map((c) => ({ locale, slug: c.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const cat = (await getCategories(locale)).find((c) => c.slug === slug);
  return cat ? pageMetadata({ locale, path: `/insights/category/${slug}`, title: cat.title }) : {};
}

export default async function CategoryPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [cats, t] = await Promise.all([
    getCategories(locale),
    getTranslations({ locale, namespace: "s5.insights" }),
  ]);
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();
  return (
    <InsightsListing
      locale={locale}
      category={slug}
      crumbs={[
        { label: t("title"), href: "/insights" },
        { label: cat.title, href: `/insights/category/${slug}` },
      ]}
    />
  );
}
