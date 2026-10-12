import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DetailHero } from "@/components/layout/DetailHero";
import { AcademyApplyForm } from "@/features/academy/forms";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academyPages" });
  return pageMetadata({
    locale,
    path: "/academy/apply",
    title: t("applyTitle"),
    description: t("applyLead"),
  });
}

// FR-ACA-05: server-rendered, works without JavaScript — no "Loading…" dead ends (G-6).
export default async function ApplyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, n] = await Promise.all([
    getTranslations({ locale, namespace: "academyPages" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[
          { label: n("academy"), href: "/academy" },
          { label: n("apply"), href: "/academy/apply" },
        ]}
        eyebrow="UB ACADEMY"
        title={t("applyTitle")}
        lead={t("applyLead")}
        icon="graduation-cap"
      />
      <div className="section pt-12">
        <div className="container-page max-w-4xl">
          <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-2 sm:p-10">
            <AcademyApplyForm locale={locale} />
          </div>
        </div>
      </div>
    </>
  );
}
