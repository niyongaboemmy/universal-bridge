import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CaseStudyCard } from "@/components/cards/CaseStudyCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FacetFilters, type Facet } from "@/components/patterns/FacetFilters";
import { ProofOfWork } from "@/features/work/ProofOfWork";
import { localizePath, type Locale } from "@/i18n/routing";
import { getCaseStudies, getPage } from "@/lib/cms/content";
import { cmsPageMetadata } from "@/lib/cms/page";
import { icuPluralForms } from "@/lib/i18n-plural";
import { pageMetadata } from "@/lib/seo/metadata";
import { REGIONS } from "@/collections/CaseStudies";
import type { Industry, Service, Technology } from "@/payload-types";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = await cmsPageMetadata("work", locale, "/work");
  if (meta.title) return meta;
  const t = await getTranslations({ locale, namespace: "templates.work" });
  return pageMetadata({ locale, path: "/work", title: t("title") });
}

const uniq = <T extends { id: number }>(items: T[]) => [
  ...new Map(items.map((i) => [i.id, i])).values(),
];

// FR-WORK-01 listing with shareable filters.
export default async function WorkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [cases, page, t, c] = await Promise.all([
    getCaseStudies(locale),
    getPage("work", locale),
    getTranslations({ locale, namespace: "templates" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const hero = page?.layout?.find((b) => b.blockType === "hero");
  const industries = uniq(
    cases.map((x) => x.industry).filter((x): x is Industry => typeof x === "object" && !!x),
  );
  const services = uniq(
    cases.flatMap((x) => x.services ?? []).filter((x): x is Service => typeof x === "object"),
  );
  const techs = uniq(
    cases
      .flatMap((x) => x.technologies ?? [])
      .filter((x): x is Technology => typeof x === "object"),
  );
  const regions = REGIONS.filter((r) => cases.some((x) => x.region === r));

  const facets: Facet[] = cases.map((x) => ({
    id: String(x.id),
    values: {
      industry: typeof x.industry === "object" && x.industry ? [x.industry.slug] : [],
      service: (x.services ?? []).map((s) => (typeof s === "object" ? s.slug : "")),
      technology: (x.technologies ?? []).map((s) => (typeof s === "object" ? s.slug : "")),
      region: x.region ? [x.region] : [],
    },
  }));
  const results = icuPluralForms(c.raw("results") as string);

  if (!cases.length)
    return (
      <div className="section pt-8">
        <div className="container-page">
          <Breadcrumbs locale={locale} items={[{ label: t("work.title"), href: "/work" }]} />
          <ProofOfWork locale={locale} />
        </div>
      </div>
    );

  return (
    <div className="section pt-8">
      <div className="container-page">
        <Breadcrumbs locale={locale} items={[{ label: t("work.title"), href: "/work" }]} />
        <SectionHeader
          as="h1"
          className="mt-10"
          eyebrow={hero && "eyebrow" in hero ? hero.eyebrow : undefined}
          title={(hero && "title" in hero ? hero.title : null) ?? t("work.title")}
          lead={hero && "lead" in hero ? hero.lead : undefined}
        />
        {
          <FacetFilters
            facets={facets}
            attr="case"
            keys={["industry", "service", "technology", "region"]}
            dimensions={[
              {
                key: "industry",
                label: t("work.industry"),
                options: industries.map((i) => ({ value: i.slug, label: i.title })),
              },
              {
                key: "service",
                label: t("work.service"),
                options: services.map((s) => ({ value: s.slug, label: s.title })),
              },
              {
                key: "technology",
                label: t("work.technology"),
                options: techs.map((s) => ({ value: s.slug, label: s.name })),
              },
              {
                key: "region",
                label: t("work.region"),
                options: regions.map((r) => ({ value: r, label: t(`regions.${r}`) })),
              },
            ].filter((d) => d.options.length > 1)}
            copy={{
              title: t("work.filters"),
              any: t("work.any"),
              clear: c("clearFilters"),
              results: {
                zero: results.zero ?? results.other,
                one: results.one,
                other: results.other,
              },
              emptyTitle: t("work.emptyTitle"),
              emptyBody: t("work.emptyBody"),
            }}
          />
        }
        <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((cs, i) => (
            <li
              key={cs.id}
              data-case={cs.id}
              className={i === 0 ? "md:col-span-2" : undefined}
              style={{ viewTransitionName: `case-${cs.id}` }}
            >
              <CaseStudyCard
                cs={cs}
                href={localizePath(`/work/${cs.slug}`, locale)}
                industry={typeof cs.industry === "object" ? cs.industry?.title : undefined}
                large={i === 0}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
