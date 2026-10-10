import { BadgeCheck } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { QrScanner } from "@/features/certificates/QrScanner";
import { localizePath, type Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "certificates" });
  return pageMetadata({
    locale,
    path: "/academy/verify",
    title: t("title"),
    description: t("lead"),
  });
}

// FR-CERT-01: enter a code or scan the QR code.
export default async function VerifyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, n] = await Promise.all([
    getTranslations({ locale, namespace: "certificates" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  return (
    <div className="section pt-8">
      <div className="container-reading">
        <Breadcrumbs
          locale={locale}
          items={[
            { label: n("academy"), href: "/academy" },
            { label: t("title"), href: "/academy/verify" },
          ]}
        />
        <div className="mt-10 flex size-14 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <BadgeCheck aria-hidden className="size-7" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 text-display-lg">{t("title")}</h1>
        <p className="mt-4 text-body-lg text-fg-secondary">{t("lead")}</p>
        <form
          method="get"
          action={localizePath("/academy/verify/check", locale)}
          className="mt-10 rounded-xl border border-subtle bg-surface p-6 shadow-2 sm:p-8"
        >
          <label htmlFor="cert-code" className="text-body-sm font-medium">
            {t("codeLabel")}
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="cert-code"
              name="code"
              required
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-describedby="cert-code-hint"
              placeholder="UB-2026-"
              className="h-13 w-full rounded-sm border border-strong bg-surface px-4 font-mono text-[1.0625rem] tracking-wider uppercase focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-primary-soft)] focus:outline-none"
            />
            <Button type="submit" size="lg" className="sm:w-auto">
              {t("check")}
            </Button>
          </div>
          <p id="cert-code-hint" className="mt-2 text-body-sm text-fg-secondary">
            {t("codeHint")}
          </p>
          <QrScanner
            copy={{
              scan: t("scan"),
              scanning: t("scanning"),
              stop: t("stopScan"),
              denied: t("cameraDenied"),
            }}
          />
        </form>
      </div>
    </div>
  );
}
