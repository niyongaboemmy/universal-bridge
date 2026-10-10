import { ArrowRight } from "lucide-react";
import { docRef } from "@/lib/live-edit/session";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { DetailHero } from "@/components/layout/DetailHero";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { localizePath, routing, type Locale } from "@/i18n/routing";
import { getCaseStudies, getIndustry, publishedSlugs } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Service } from "@/payload-types";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const slugs = await publishedSlugs("industries");
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const i = await getIndustry(slug, locale);
  if (!i) return {};
  return pageMetadata({
    locale,
    path: `/solutions/${slug}`,
    title: i.seo?.title || i.title,
    description: i.seo?.description || i.summary,
  });
}

// FR-SOL-01 industry template.
export default async function IndustryPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [i, t, n, c, all] = await Promise.all([
    getIndustry(slug, locale),
    getTranslations({ locale, namespace: "templates" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
    getCaseStudies(locale),
  ]);
  if (!i) notFound();
  const services = (i.services ?? []).filter((s): s is Service => typeof s === "object");
  const related = all
    .filter((cs) => (typeof cs.industry === "object" ? cs.industry?.id : cs.industry) === i.id)
    .slice(0, 3);
  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[
          { label: n("solutions"), href: "/solutions" },
          { label: i.title, href: `/solutions/${slug}` },
        ]}
        title={i.title}
        edit={{ ref: await docRef("industries", i, locale), title: "title", lead: "summary" }}
        lead={i.summary}
      >
        <Button asChild size="lg" variant="spark" className="mt-9">
          <a href={localizePath("/contact?topic=sales", locale)}>
            {n("letsTalk")} <ArrowRight aria-hidden data-arrow />
          </a>
        </Button>
      </DetailHero>
      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          {!!i.challenges?.length && (
            <div>
              <h2 className="font-display text-heading-lg">{t("industry.challenges")}</h2>
              <ul className="mt-6 space-y-3">
                {i.challenges.map((ch, k) => (
                  <li key={ch.id ?? k} className="rounded-lg border border-subtle bg-surface p-4">
                    {ch.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {!!i.solutions?.length && (
            <div>
              <h2 className="font-display text-heading-lg">{t("industry.solutions")}</h2>
              <ul className="mt-6 space-y-5">
                {i.solutions.map((so, k) => (
                  <li key={so.id ?? k}>
                    <h3 className="font-semibold">{so.title}</h3>
                    {so.body && <p className="mt-1 text-fg-secondary">{so.body}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
      {services.length > 0 && (
        <section className="section bg-sunken">
          <div className="container-page">
            <SectionHeader title={t("industry.services")} />
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((s) => (
                <li key={s.id}>
                  <ServiceCard
                    title={s.title}
                    summary={s.summary}
                    icon={s.icon}
                    href={localizePath(`/services/${s.slug}`, locale)}
                    cta={c("explore")}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section className="section">
          <div className="container-page">
            <SectionHeader title={t("service.related")} />
            <ul className="mt-10 grid gap-6 lg:grid-cols-3">
              {related.map((cs) => (
                <li key={cs.id}>
                  <CaseStudyCard cs={cs} href={localizePath(`/work/${cs.slug}`, locale)} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
