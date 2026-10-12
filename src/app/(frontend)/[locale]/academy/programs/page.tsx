import type { Metadata } from "next";
import { balancedCols } from "@/lib/grid";
import { cn } from "@/lib/utils";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { DetailHero } from "@/components/layout/DetailHero";
import { FacetFilters, type Facet } from "@/components/patterns/FacetFilters";
import { PROGRAM_CATEGORIES, PROGRAM_LEVELS, PROGRAM_MODES } from "@/collections/Academy";
import type { Locale } from "@/i18n/routing";
import { openIntakes } from "@/lib/cms/academy";
import { getPrograms } from "@/lib/cms/content";
import { icuPluralForms } from "@/lib/i18n-plural";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academyPages" });
  return pageMetadata({
    locale,
    path: "/academy/programs",
    title: t("programsTitle"),
    description: t("programsLead"),
  });
}

// FR-ACA-02: programs with filters for mode, level and category (?mode=online from legacy URLs).
export default async function ProgramsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [programs, intakes, t, n, c] = await Promise.all([
    getPrograms(locale),
    openIntakes(locale),
    getTranslations({ locale, namespace: "academyPages" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  // FR-ACA-02 duration filter, in buckets people think in.
  const durationOf = (weeks: number) => (weeks <= 4 ? "short" : weeks <= 13 ? "medium" : "long");
  const DURATIONS = ["short", "medium", "long"] as const;
  const facets: Facet[] = programs.map((p) => ({
    id: String(p.id),
    values: {
      mode: [p.mode],
      level: [p.level],
      category: [p.category],
      duration: [durationOf(p.durationWeeks)],
    },
  }));
  const present = <T extends string>(all: readonly T[], key: "mode" | "level" | "category") =>
    all.filter((v) => programs.some((p) => p[key] === v));
  const results = icuPluralForms(c.raw("results") as string);
  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[
          { label: n("academy"), href: "/academy" },
          { label: t("programsTitle"), href: "/academy/programs" },
        ]}
        eyebrow="UB ACADEMY"
        title={t("programsTitle")}
        lead={t("programsLead")}
        icon="book-open"
        chips={programs.slice(0, 3).map((p) => p.title)}
      />
      <div className="section pt-12">
        <div className="container-page">
          <FacetFilters
            facets={facets}
            attr="program"
            keys={["mode", "level", "category", "duration"]}
            dimensions={[
              {
                key: "mode",
                label: t("mode"),
                options: PROGRAM_MODES.map((v) => ({ value: v, label: t(`modes.${v}`) })),
              },
              {
                key: "level",
                label: t("level"),
                options: present(PROGRAM_LEVELS, "level").map((v) => ({
                  value: v,
                  label: t(`levels.${v}`),
                })),
              },
              {
                key: "category",
                label: t("category"),
                options: present(PROGRAM_CATEGORIES, "category").map((v) => ({
                  value: v,
                  label: t(`categories.${v}`),
                })),
              },
              {
                key: "duration",
                label: t("duration"),
                options: DURATIONS.filter((d) =>
                  programs.some((p) => durationOf(p.durationWeeks) === d),
                ).map((v) => ({
                  value: v,
                  label: t(`durations.${v}`),
                })),
              },
            ]}
            copy={{
              title: t("programsTitle"),
              any: t("any"),
              clear: c("clearFilters"),
              results: {
                zero: results.zero ?? results.other,
                one: results.one,
                other: results.other,
              },
              emptyTitle: t("noProgramsMatch"),
              emptyBody: t("noIntake"),
            }}
          />
          <ul className={cn("mt-8 grid gap-6 md:grid-cols-2", balancedCols(programs.length))}>
            {programs.map((p) => (
              <li key={p.id} data-program={p.id}>
                <ProgramCard
                  program={p}
                  intake={intakes.find(
                    (i) => typeof i.program === "object" && i.program.id === p.id,
                  )}
                  locale={locale}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
