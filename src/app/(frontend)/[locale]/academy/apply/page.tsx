import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
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
    <div className="section pt-8">
      <div className="container-page max-w-4xl">
        <Breadcrumbs
          locale={locale}
          items={[
            { label: n("academy"), href: "/academy" },
            { label: n("apply"), href: "/academy/apply" },
          ]}
        />
        <h1 className="mt-10 text-display-lg">{t("applyTitle")}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-fg-secondary">{t("applyLead")}</p>
        <div className="mt-10 rounded-xl border border-subtle bg-surface p-6 shadow-2 sm:p-10">
          <AcademyApplyForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
