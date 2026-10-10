import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FormSection } from "@/components/forms/FormSection";
import { PartnerForm } from "@/features/partners/forms";
import type { Locale } from "@/i18n/routing";
import { CmsPage, cmsPageMetadata } from "@/lib/cms/page";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return cmsPageMetadata("partners", locale, "/company/partners");
}

// FR-PRT-01: partners & agent programme (CMS blocks) + application. /agents 301s here.
export default async function PartnersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "partnersPages" });
  return (
    <CmsPage slug="partners" locale={locale}>
      <FormSection
        id="apply"
        title={t("applyTitle")}
        lead={t("applyLead")}
        aside={<p className="mt-6 text-body-sm text-fg-muted">{t("commissionOnRequest")}</p>}
      >
        <PartnerForm locale={locale} />
      </FormSection>
    </CmsPage>
  );
}
