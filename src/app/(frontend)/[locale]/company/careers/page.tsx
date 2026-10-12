import { ArrowRight, Briefcase, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FormSection } from "@/components/forms/FormSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { JobApplicationForm } from "@/features/careers/forms";
import { localizePath, type Locale } from "@/i18n/routing";
import { getJobs } from "@/lib/cms/content";
import { CmsPage, cmsPageMetadata } from "@/lib/cms/page";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata("careers", locale, "/company/careers");
}

// FR-CAR-01/03: culture (CMS blocks), open roles, open application.
export default async function CareersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [jobs, t] = await Promise.all([
    getJobs(locale),
    getTranslations({ locale, namespace: "careersPages" }),
  ]);
  const open = jobs.filter((j) => new Date(j.validThrough) >= new Date(new Date().toDateString()));
  return (
    <CmsPage slug="careers" locale={locale}>
      <section id="roles" className="section">
        <div className="container-page">
          <SectionHeader title={t("openRoles")} />
          {open.length ? (
            <ul className="mt-10 grid gap-3">
              {open.map((j) => (
                <li
                  key={j.id}
                  className="reveal spotlight group relative flex flex-col gap-4 rounded-2xl border border-subtle bg-surface p-6 transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--accent-spark)_45%,var(--border-subtle))] hover:shadow-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span
                    aria-hidden
                    className="hidden size-12 shrink-0 items-center justify-center rounded-xl border border-subtle text-accent transition-[background-color,color,rotate] duration-300 group-hover:-rotate-6 group-hover:bg-spark group-hover:text-on-spark sm:flex"
                  >
                    <Briefcase className="size-5" />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-heading-md">
                      <a
                        href={localizePath(`/company/careers/${j.slug}`, locale)}
                        className="after:absolute after:inset-0"
                      >
                        {j.title}
                      </a>
                    </h3>
                    <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-fg-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase aria-hidden className="size-4" />
                        {t(`departments.${j.department}`)} · {t(`types.${j.employmentType}`)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin aria-hidden className="size-4" />
                        {j.location} · {t(`remote.${j.remotePolicy}`)}
                      </span>
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="flex size-11 shrink-0 items-center justify-center rounded-full border border-subtle text-accent transition-[background-color,color,translate] duration-300 group-hover:translate-x-1 group-hover:border-transparent group-hover:bg-spark group-hover:text-on-spark"
                  >
                    <ArrowRight className="size-5" />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 rounded-xl border border-dashed border-strong p-8 text-body-lg text-fg-secondary">
              {t("noRoles")}
            </p>
          )}
        </div>
      </section>
      <FormSection
        id="open-application"
        title={t("openApplication")}
        lead={t("openApplicationLead")}
      >
        <JobApplicationForm locale={locale} />
      </FormSection>
    </CmsPage>
  );
}
