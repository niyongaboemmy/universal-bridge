import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InsightsListing, tagSlug } from "@/features/insights/Listing";
import { routing, type Locale } from "@/i18n/routing";
import { getPosts } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale; tag: string }> };

async function tags(locale: Locale) {
  const map = new Map<string, string>();
  for (const p of await getPosts(locale)) for (const t of p.tags ?? []) map.set(tagSlug(t), t);
  return map;
}

export async function generateStaticParams() {
  const all = await tags("en");
  return routing.locales.flatMap((locale) => [...all.keys()].map((tag) => ({ locale, tag })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, tag } = await params;
  const label = (await tags(locale)).get(tag);
  const t = await getTranslations({ locale, namespace: "s5.insights" });
  return label
    ? pageMetadata({
        locale,
        path: `/insights/tag/${tag}`,
        title: t("tag", { tag: label }),
        noindex: true,
      })
    : {};
}

export default async function TagPage({ params }: Props) {
  const { locale, tag } = await params;
  setRequestLocale(locale);
  const label = (await tags(locale)).get(tag);
  if (!label) notFound();
  const t = await getTranslations({ locale, namespace: "s5.insights" });
  return (
    <InsightsListing
      locale={locale}
      tag={tag}
      crumbs={[
        { label: t("title"), href: "/insights" },
        { label: t("tag", { tag: label }), href: `/insights/tag/${tag}` },
      ]}
    />
  );
}
