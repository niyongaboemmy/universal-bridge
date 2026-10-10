import type { Metadata } from "next";
import { docRef } from "@/lib/live-edit/session";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DetailHero } from "@/components/layout/DetailHero";
import { FormSection } from "@/components/forms/FormSection";
import { Button } from "@/components/ui/Button";
import { JobApplicationForm } from "@/features/careers/forms";
import { dateFmt } from "@/features/academy/format";
import { routing, type Locale } from "@/i18n/routing";
import { getJob, publishedSlugs } from "@/lib/cms/content";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const slugs = await publishedSlugs("jobs");
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const j = await getJob(slug, locale);
  if (!j) return {};
  return pageMetadata({
    locale,
    path: `/company/careers/${slug}`,
    title: j.seo?.title || j.title,
    description: j.seo?.description || j.summary,
  });
}

// FR-CAR-02: job detail with JobPosting JSON-LD and an application form with CV.
export default async function JobPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [j, t, n] = await Promise.all([
    getJob(slug, locale),
    getTranslations({ locale, namespace: "careersPages" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  if (!j) notFound();
  const lists = [
    ["responsibilities", j.responsibilities],
    ["requirements", j.requirements],
    ["niceToHave", j.niceToHave],
  ] as const;
  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[
          { label: n("careers"), href: "/company/careers" },
          { label: j.title, href: `/company/careers/${slug}` },
        ]}
        eyebrow={`${t(`departments.${j.department}`)} · ${t(`types.${j.employmentType}`)} · ${j.location} · ${t(`remote.${j.remotePolicy}`)}`}
        title={j.title}
        edit={{ ref: await docRef("jobs", j, locale), title: "title", lead: "summary" }}
        lead={j.summary}
      >
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Button asChild variant="spark" size="lg">
            <a href="#apply">{t("apply")}</a>
          </Button>
          <span className="text-body-sm text-fg-secondary">
            {t("validThrough", { date: dateFmt(j.validThrough, locale) })}
          </span>
        </div>
      </DetailHero>
      <section className="section">
        <div className="container-reading space-y-10">
          {lists.map(([key, items]) =>
            items?.length ? (
              <div key={key}>
                <h2 className="font-display text-heading-lg">{t(key)}</h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-body-lg text-fg-secondary">
                  {items.map((x, i) => (
                    <li key={x.id ?? i}>{x.text}</li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
          {j.salary?.min ? (
            <p className="font-medium">
              {t("salary")}:{" "}
              {new Intl.NumberFormat(locale === "rw" ? "en" : locale, {
                style: "currency",
                currency: j.salary.currency ?? "RWF",
                maximumFractionDigits: 0,
              }).format(j.salary.min)}
              {j.salary.max
                ? ` – ${new Intl.NumberFormat(locale === "rw" ? "en" : locale, { maximumFractionDigits: 0 }).format(j.salary.max)}`
                : ""}
            </p>
          ) : null}
        </div>
      </section>
      <FormSection id="apply" title={t("apply")} lead={t("applyLead")}>
        <JobApplicationForm locale={locale} jobId={j.id} />
      </FormSection>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "JobPosting",
          title: j.title,
          description: [
            j.summary,
            ...(j.responsibilities ?? []).map((x) => x.text),
            ...(j.requirements ?? []).map((x) => x.text),
          ].join("\n"),
          datePosted: j.createdAt.slice(0, 10),
          validThrough: j.validThrough,
          employmentType: j.employmentType,
          hiringOrganization: {
            "@type": "Organization",
            name: "Universal Bridge Ltd",
            sameAs: siteUrl("/"),
            logo: siteUrl("/brand/ub-mark.svg"),
          },
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: j.location.split(",")[0],
              addressCountry: "RW",
            },
          },
          ...(j.remotePolicy === "remote"
            ? {
                jobLocationType: "TELECOMMUTE",
                applicantLocationRequirements: { "@type": "Country", name: "Rwanda" },
              }
            : {}),
          ...(j.salary?.min
            ? {
                baseSalary: {
                  "@type": "MonetaryAmount",
                  currency: j.salary.currency,
                  value: {
                    "@type": "QuantitativeValue",
                    minValue: j.salary.min,
                    maxValue: j.salary.max ?? j.salary.min,
                    unitText: j.salary.period,
                  },
                },
              }
            : {}),
          directApply: true,
        }}
      />
    </>
  );
}
