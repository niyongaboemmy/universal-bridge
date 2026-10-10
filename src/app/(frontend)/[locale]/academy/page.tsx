import { BadgeCheck } from "lucide-react";
import type { Metadata } from "next";
import { balancedCols } from "@/lib/grid";
import { cn } from "@/lib/utils";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { localizePath, type Locale } from "@/i18n/routing";
import { openIntakes } from "@/lib/cms/academy";
import { getPrograms } from "@/lib/cms/content";
import { CmsPage, cmsPageMetadata } from "@/lib/cms/page";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata("academy", locale, "/academy");
}

// FR-ACA-01: Academy landing (CMS blocks) + programs with upcoming intakes + verify teaser.
export default async function AcademyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [programs, intakes, t] = await Promise.all([
    getPrograms(locale),
    openIntakes(locale),
    getTranslations({ locale, namespace: "academyPages" }),
  ]);
  const nextFor = (id: number) =>
    intakes.find((i) => typeof i.program === "object" && i.program.id === id);
  return (
    <CmsPage slug="academy" locale={locale}>
      {programs.length > 0 && (
        <section className="section">
          <div className="container-page">
            <SectionHeader
              eyebrow="UB ACADEMY"
              title={t("programsTitle")}
              lead={t("programsLead")}
              action={
                <Button asChild variant="secondary">
                  <a href={localizePath("/academy/programs", locale)}>{t("programsTitle")} →</a>
                </Button>
              }
            />
            <ul
              className={cn(
                "mt-12 grid gap-6 md:grid-cols-2",
                balancedCols(Math.min(programs.length, 6)),
              )}
            >
              {programs.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <ProgramCard program={p} intake={nextFor(p.id)} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <section className="section pt-0">
        <div className="container-page">
          <div className="flex flex-col items-start gap-5 rounded-xl border border-subtle bg-surface p-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-3 font-display text-heading-md">
              <BadgeCheck aria-hidden className="size-8 shrink-0 text-accent" strokeWidth={1.5} />
              {t("verifyTeaser")}
            </p>
            <Button asChild variant="secondary">
              <a href={localizePath("/academy/verify", locale)}>{t("verifyCta")}</a>
            </Button>
          </div>
        </div>
      </section>
    </CmsPage>
  );
}
