import { ArrowRight } from "lucide-react";
import { docRef } from "@/lib/live-edit/session";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { DetailHero } from "@/components/layout/DetailHero";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeatureGrid, InnerSection, StepTrack } from "@/components/patterns/Inner";
import { DetailCta } from "@/components/patterns/DetailCta";
import { localizePath, routing, type Locale } from "@/i18n/routing";
import { getCaseStudies, getService, publishedSlugs } from "@/lib/cms/content";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqLd, serviceLd } from "@/lib/seo/schema";
import { mediaSrc } from "@/lib/cms/media-src";
import { siteUrl } from "@/lib/utils";
import type { Faq, Technology } from "@/payload-types";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const slugs = await publishedSlugs("services");
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const s = await getService(slug, locale);
  if (!s) return {};
  return pageMetadata({
    locale,
    path: `/services/${slug}`,
    title: s.seo?.title || s.title,
    description: s.seo?.description || s.summary,
    noindex: s.seo?.noindex ?? false,
  });
}

// FR-SRV-02 service detail template.
export default async function ServicePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [s, t, n, all] = await Promise.all([
    getService(slug, locale),
    getTranslations({ locale, namespace: "templates" }),
    getTranslations({ locale, namespace: "nav" }),
    getCaseStudies(locale),
  ]);
  if (!s) notFound();
  const related = all
    .filter((cs) => cs.services?.some((x) => (typeof x === "object" ? x.id : x) === s.id))
    .slice(0, 3);
  const faqs = (s.faqs ?? []).filter((f): f is Faq => typeof f === "object");
  const techs = (s.technologies ?? []).filter((x): x is Technology => typeof x === "object");

  const d = await getTranslations({ locale, namespace: "templates.detail" });
  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[
          { label: n("services"), href: "/services" },
          { label: s.title, href: `/services/${slug}` },
        ]}
        eyebrow={t(`pillars.${s.pillar}`)}
        title={s.title}
        edit={{
          ref: await docRef("services", s, locale),
          title: "title",
          lead: s.outcome ? "outcome" : "summary",
        }}
        lead={s.outcome || s.summary}
        icon={s.icon ?? null}
        chips={(s.deliverables ?? []).map((x) => x.title)}
        facts={[
          { icon: "rocket", label: d("sprints") },
          { icon: "compass", label: d("timezone") },
          { icon: "users", label: d("reply") },
        ]}
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild size="lg" variant="spark">
            <a href={localizePath("/contact?topic=sales", locale)}>
              {t("service.cta", { service: s.title })} <ArrowRight aria-hidden data-arrow />
            </a>
          </Button>
          <Button asChild size="lg" variant="secondary" className="bg-transparent">
            <a href={localizePath("/book", locale)}>{d("ctaSecondary")}</a>
          </Button>
        </div>
      </DetailHero>

      {s.problem && (
        <section className="section pb-0">
          <div className="container-page grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
            <p className="eyebrow pt-2">{t("service.problem")}</p>
            <p className="reveal font-display text-heading-lg text-balance lg:text-[2rem] lg:leading-tight">
              {s.problem}
            </p>
          </div>
        </section>
      )}

      {!!s.deliverables?.length && (
        <InnerSection title={t("service.deliverables")}>
          <FeatureGrid
            items={s.deliverables.map((x) => ({ id: x.id, title: x.title, body: x.body }))}
          />
        </InnerSection>
      )}

      {!!s.process?.length && (
        <InnerSection title={t("service.process")} sunken>
          <StepTrack steps={s.process} stepLabel={(i) => t("service.step", { n: i })} />
        </InnerSection>
      )}

      {(techs.length > 0 || !!s.engagementModels?.length) && (
        <section className="section">
          <div className="container-page grid gap-12 lg:grid-cols-2">
            {techs.length > 0 && (
              <div>
                <h2 className="font-display text-heading-lg">{t("service.stack")}</h2>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {techs.map((tech) => (
                    <li
                      key={tech.id}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-subtle bg-surface px-4 text-body-sm font-medium transition-[border-color,translate] duration-300 hover:-translate-y-0.5 hover:border-accent"
                    >
                      {typeof tech.logo === "object" && tech.logo?.url && (
                        <Image src={mediaSrc(tech.logo.url)} alt="" width={18} height={18} />
                      )}
                      {tech.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {!!s.engagementModels?.length && (
              <div>
                <h2 className="font-display text-heading-lg">{t("service.models")}</h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {s.engagementModels.map((m) => (
                    <li key={m}>
                      <a
                        href={localizePath("/services#engagement", locale)}
                        className="group flex items-center justify-between gap-3 rounded-xl border border-subtle bg-surface p-4 font-medium transition-[border-color,translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-accent hover:shadow-2"
                      >
                        {t(`engagement.${m}`)}
                        <ArrowRight
                          aria-hidden
                          className="size-4 text-fg-muted transition-[translate,color] group-hover:translate-x-0.5 group-hover:text-accent"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section bg-sunken">
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

      {faqs.length > 0 && (
        <section className="section">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr]">
            <h2 className="text-display-lg">{t("service.faq")}</h2>
            <Accordion
              items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
            />
          </div>
          <JsonLd data={faqLd(faqs)} />
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
      <JsonLd
        data={serviceLd({
          name: s.title,
          description: s.summary,
          url: siteUrl(localizePath(`/services/${slug}`, locale)),
        })}
      />
    </>
  );
}
