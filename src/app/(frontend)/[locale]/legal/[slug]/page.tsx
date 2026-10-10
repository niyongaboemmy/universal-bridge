import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { RichText } from "@/components/ui/RichText";
import { dateFmt } from "@/features/academy/format";
import { routing, type Locale } from "@/i18n/routing";
import { getPage } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo/metadata";

const LEGAL = ["privacy", "cookies", "terms", "accessibility", "academy-terms"] as const;
type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => LEGAL.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await getPage(`legal-${slug}`, locale);
  return page ? pageMetadata({ locale, path: `/legal/${slug}`, title: page.title }) : {};
}

// SRS §13.4 legal pages: CMS pages "legal-<slug>" with rich text.
export default async function LegalPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!(LEGAL as readonly string[]).includes(slug)) notFound();
  setRequestLocale(locale);
  const page = await getPage(`legal-${slug}`, locale);
  if (!page) notFound();
  const body = page.layout?.find((b) => b.blockType === "richText");
  return (
    <article className="section pt-8">
      <div className="container-reading">
        <Breadcrumbs locale={locale} items={[{ label: page.title, href: `/legal/${slug}` }]} />
        <h1 className="mt-10 text-display-lg">{page.title}</h1>
        <p className="mt-3 text-body-sm text-fg-muted">
          <time dateTime={page.updatedAt}>{dateFmt(page.updatedAt, locale)}</time>
        </p>
        <div className="mt-10">
          {body && "content" in body ? <RichText data={body.content} /> : null}
        </div>
      </div>
    </article>
  );
}
