import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FormSection } from "@/components/forms/FormSection";
import { InternshipForm } from "@/features/academy/forms";
import type { Locale } from "@/i18n/routing";
import { CmsPage, cmsPageMetadata } from "@/lib/cms/page";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata("internships", locale, "/academy/internships");
}

// FR-ACA-04: internship page (CMS) + application with CV (fixes G-5: /internship was a 404).
export default async function InternshipsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "academyPages" });
  return (
    <CmsPage slug="internships" locale={locale}>
      <FormSection id="apply" title={t("internshipTitle")} lead={t("internshipLead")}>
        <InternshipForm locale={locale} />
      </FormSection>
    </CmsPage>
  );
}
