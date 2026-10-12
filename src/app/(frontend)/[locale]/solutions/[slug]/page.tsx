import { ArrowRight } from "lucide-react";
import { docRef } from "@/lib/live-edit/session";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { ServiceCard } from "@/components/cards/ServiceCard";
import { DetailHero } from "@/components/layout/DetailHero";
import { BridgeCompare } from "@/components/patterns/Inner";
import { DetailCta } from "@/components/patterns/DetailCta";
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
  const d = await getTranslations({ locale, namespace: "templates.detail" });
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
        icon={i.icon ?? null}
        chips={(i.solutions ?? []).map((x) => x.title)}
        facts={[
          { icon: "badge-check", label: d("privacy") },
          { icon: "compass", label: d("timezone") },
          { icon: "users", label: d("languages") },
        ]}
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="spark">
            <a href={localizePath("/contact?topic=sales", locale)}>
              {n("letsTalk")} <ArrowRight aria-hidden data-arrow />
            </a>
          </Button>
          <Button asChild size="lg" variant="secondary" className="bg-transparent">
            <a href={localizePath("/book", locale)}>{d("ctaSecondary")}</a>
          </Button>
        </div>
      </DetailHero>
      {(!!i.challenges?.length || !!i.solutions?.length) && (
        <section className="section">
          <div className="container-page">
            <BridgeCompare
              problemsTitle={t("industry.challenges")}
              problems={i.challenges ?? []}
              answersTitle={t("industry.solutions")}
              answers={i.solutions ?? []}
            />
          </div>
        </section>
      )}
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
      <DetailCta
        locale={locale}
        eyebrow={d("ctaEyebrow")}
        title={d("ctaTitle")}
        lead={d("ctaLead")}
        primary={{ label: d("ctaPrimary"), href: "/contact?topic=sales" }}
        secondary={{ label: d("ctaSecondary"), href: "/book" }}
      />
    </>
  );
}
