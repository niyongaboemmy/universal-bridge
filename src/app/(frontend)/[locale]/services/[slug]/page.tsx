import { Check } from "lucide-react";
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
      >
        <Button asChild size="lg" variant="spark" className="mt-9">
          <a href={localizePath("/contact?topic=sales", locale)}>
            {t("service.cta", { service: s.title })}
          </a>
        </Button>
      </DetailHero>

      {(s.problem || s.deliverables?.length) && (
        <section className="section">
          <div className="container-page grid gap-12 lg:grid-cols-2">
            {s.problem && (
              <div>
                <p className="eyebrow">{t("service.problem")}</p>
                <p className="mt-4 font-display text-heading-lg">{s.problem}</p>
              </div>
            )}
            {!!s.deliverables?.length && (
              <div>
                <h2 className="font-display text-heading-lg">{t("service.deliverables")}</h2>
                <ul className="mt-6 space-y-4">
                  {s.deliverables.map((d, i) => (
                    <li key={d.id ?? i} className="reveal flex gap-3">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                        <Check aria-hidden className="size-4" />
                      </span>
                      <span>
                        <strong className="block">{d.title}</strong>
                        {d.body && <span className="text-fg-secondary">{d.body}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {!!s.process?.length && (
        <section className="section bg-sunken">
          <div className="container-page">
            <SectionHeader title={t("service.process")} />
            <ol className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {s.process.map((p, i) => (
                <li key={p.id ?? i} className="rounded-xl border border-subtle bg-surface p-6">
                  <p className="font-mono text-body-sm text-spark-text">
                    {t("service.step", { n: i + 1 })}
                  </p>
                  <h3 className="mt-2 font-display text-heading-md">{p.title}</h3>
                  {p.body && <p className="mt-2 text-fg-secondary">{p.body}</p>}
                </li>
              ))}
            </ol>
          </div>
        </section>
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
                      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-subtle bg-surface px-4 text-body-sm font-medium"
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
                    <li key={m} className="rounded-lg border border-subtle p-4 font-medium">
                      <a
                        href={localizePath("/services#engagement", locale)}
                        className="hover:text-accent"
                      >
                        {t(`engagement.${m}`)}
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
