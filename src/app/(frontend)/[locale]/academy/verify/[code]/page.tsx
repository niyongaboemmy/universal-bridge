import { BadgeCheck, CircleAlert, CircleX, ShieldCheck } from "lucide-react";
import { SocialIcon } from "@/components/layout/SocialIcon";
import { PrintButton } from "@/features/certificates/PrintButton";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Monogram } from "@/components/brand/Monogram";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { localizePath, type Locale } from "@/i18n/routing";
import { linkedInAddUrl, verifyCertificate } from "@/lib/certificates/lookup";
import { requestContext } from "@/lib/forms/request-context";
import { siteUrl } from "@/lib/utils";

// SRS §10.2: verification results are dynamic, uncached and rate-limited.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: Locale; code: string }>;
  searchParams: Promise<{ s?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "certificates" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

const fmt = (iso: string | null | undefined, locale: string) =>
  iso
    ? new Intl.DateTimeFormat(locale === "rw" ? "en-GB" : locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Africa/Kigali",
      }).format(new Date(iso))
    : "—";

export default async function VerifyResultPage({ params, searchParams }: Props) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  await headers();
  const [{ s }, ctx, t, n] = await Promise.all([
    searchParams,
    requestContext(),
    getTranslations({ locale, namespace: "certificates" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const result = await verifyCertificate(decodeURIComponent(code), ctx.ip, s);

  const crumbs = [
    { label: n("academy"), href: "/academy" },
    { label: t("title"), href: "/academy/verify" },
  ];
  const back = (
    <Button asChild variant="secondary" className="mt-8">
      <a href={localizePath("/academy/verify", locale)}>{t("another")}</a>
    </Button>
  );

  if (result.state === "rate-limited" || result.state === "not-found") {
    const title = result.state === "rate-limited" ? t("rateLimitedTitle") : t("notFoundTitle");
    const lead = result.state === "rate-limited" ? t("rateLimitedLead") : t("notFoundLead");
    return (
      <div className="section pt-8">
        <div className="container-reading">
          <Breadcrumbs locale={locale} items={crumbs} />
          <div
            role="status"
            className="mt-10 rounded-xl border border-subtle bg-surface p-8 shadow-1"
          >
            <CircleAlert aria-hidden className="size-8 text-warning" />
            <h1 className="mt-4 font-display text-heading-lg">{title}</h1>
            <p className="mt-2 text-fg-secondary">{lead}</p>
            {result.state === "not-found" && (
              <p className="mt-4 font-mono text-body-sm text-fg-muted">{result.code}</p>
            )}
            {back}
          </div>
        </div>
      </div>
    );
  }

  const c = result.certificate;
  const valid = result.state === "valid" && result.signature !== "mismatch";
  const verifyUrl = siteUrl(localizePath(`/academy/verify/${c.code}`, "en"));
  const heading =
    result.signature === "mismatch"
      ? t("tamperedTitle")
      : valid
        ? t("validTitle")
        : t("revokedTitle");
  const lead =
    result.signature === "mismatch" ? t("tamperedLead") : valid ? t("validLead") : t("revokedLead");
  const Icon = valid ? BadgeCheck : result.signature === "mismatch" ? CircleAlert : CircleX;

  return (
    <div className="section pt-8">
      <div className="container-page max-w-4xl">
        <Breadcrumbs locale={locale} items={crumbs} />
        <div role="status" className="mt-10 flex items-start gap-4">
          <span className={valid ? "text-success" : "text-warning"}>
            <Icon aria-hidden className="size-10" strokeWidth={1.75} />
          </span>
          <div>
            <h1 className="font-display text-heading-lg">{heading}</h1>
            <p className="mt-1 text-fg-secondary">{lead}</p>
            {result.signature === "ok" && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-body-sm font-medium text-success">
                <ShieldCheck aria-hidden className="size-4" />
                {t("signatureOk")}
              </p>
            )}
          </div>
        </div>

        {/* Styled like the printed certificate (UI/UX §12.11). */}
        <article className="cert-card relative mt-8 overflow-hidden rounded-xl border border-subtle bg-surface p-8 shadow-3 sm:p-12">
          <span aria-hidden className="absolute -top-10 -right-10 size-40 rotate-45 bg-accent" />
          <span aria-hidden className="absolute -right-4 -bottom-16 size-32 rotate-45 bg-spark" />
          <div data-logo className="relative flex items-center gap-3">
            <Monogram title={null} className="h-9 w-auto text-[var(--logo-blue)]" />
            <span className="font-display font-extrabold text-[var(--logo-blue)]">
              Universal Bridge <span className="text-ub-orange-500">Ltd</span>
            </span>
          </div>
          <dl className="relative mt-10 grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="eyebrow">{t("holder")}</dt>
              <dd className="mt-1 font-display text-display-lg">{c.holderName}</dd>
            </div>
            <div>
              <dt className="text-body-sm text-fg-muted">{t("program")}</dt>
              <dd className="font-semibold">{c.programTitle}</dd>
            </div>
            {c.role && (
              <div>
                <dt className="text-body-sm text-fg-muted">{t("role")}</dt>
                <dd className="font-semibold">{c.role}</dd>
              </div>
            )}
            <div>
              <dt className="text-body-sm text-fg-muted">{t("period")}</dt>
              <dd className="font-semibold">
                {fmt(c.startDate, locale)} – {fmt(c.endDate, locale)}
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-fg-muted">{t("issued")}</dt>
              <dd className="font-semibold">{fmt(c.issuedAt, locale)}</dd>
            </div>
            <div>
              <dt className="text-body-sm text-fg-muted">{t("signatory")}</dt>
              <dd className="font-semibold">
                {c.signatoryName}, {c.signatoryTitle}
              </dd>
            </div>
            <div>
              <dt className="text-body-sm text-fg-muted">{t("status")}</dt>
              <dd className="font-semibold">
                {c.status === "valid" ? t("statusValid") : t("statusRevoked")}
                {c.status === "revoked" && c.revokedReason
                  ? ` — ${t("reason")}: ${c.revokedReason}`
                  : ""}
              </dd>
            </div>
          </dl>
          <p className="relative mt-10 font-mono text-body-sm text-fg-muted">{c.code}</p>
          {valid && (
            <span
              aria-hidden
              className="cert-seal absolute right-10 bottom-10 hidden size-24 items-center justify-center rounded-full border-4 border-success text-success sm:flex"
            >
              <BadgeCheck className="size-10" />
            </span>
          )}
        </article>

        <div data-no-print className="mt-8 flex flex-wrap gap-3">
          {valid && (
            <Button asChild>
              <a href={linkedInAddUrl(c, verifyUrl)} target="_blank" rel="noopener noreferrer">
                <SocialIcon network="linkedin" />
                {t("addLinkedIn")}
              </a>
            </Button>
          )}
          <PrintButton label={t("print")} />
          <Button asChild variant="ghost">
            <a href={localizePath("/academy/verify", locale)}>{t("another")}</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
