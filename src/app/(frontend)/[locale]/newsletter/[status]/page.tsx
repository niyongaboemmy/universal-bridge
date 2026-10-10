import { CircleAlert, MailCheck, MailX } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/link";
import { routing, type Locale } from "@/i18n/routing";

const STATUSES = ["confirmed", "invalid", "unsubscribed"] as const;
type Props = { params: Promise<{ locale: Locale; status: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => STATUSES.map((status) => ({ locale, status })));
}

export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false } };
}

export default async function NewsletterStatusPage({ params }: Props) {
  const { locale, status } = await params;
  if (!(STATUSES as readonly string[]).includes(status)) notFound();
  setRequestLocale(locale);
  const [t, n] = await Promise.all([
    getTranslations({ locale, namespace: "newsletter" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const I = status === "confirmed" ? MailCheck : status === "unsubscribed" ? MailX : CircleAlert;
  return (
    <section className="section">
      <div className="container-reading text-center">
        <I aria-hidden className="mx-auto size-12 text-accent" strokeWidth={1.5} />
        <h1 className="mt-6 text-display-lg">{t(`${status}Title` as "confirmedTitle")}</h1>
        <p className="mt-4 text-body-lg text-fg-secondary">
          {t(`${status}Body` as "confirmedBody")}
        </p>
        <Link
          href="/"
          locale={locale}
          className="mt-8 inline-block font-semibold text-accent underline-offset-4 hover:underline"
        >
          {n("home")} →
        </Link>
      </div>
    </section>
  );
}
