import { Mail, MessageCircle, PhoneCall } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DetailHero } from "@/components/layout/DetailHero";
import { HoursOverlap } from "@/features/contact/ContactWidgets";
import { getSiteSettings } from "@/lib/cms/settings";
import { getPublicSystem } from "@/lib/cms/system";
import { icuPluralForms } from "@/lib/i18n-plural";
import { pageMetadata } from "@/lib/seo/metadata";
import { DEFAULT_OFFICE_HOURS } from "@/lib/time/office-hours";
import { CalEmbed } from "@/features/book/CalEmbed";
import { calLinkStatus } from "@/features/book/cal-status";
import { Button } from "@/components/ui/Button";
import { localizePath, type Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "templates.book" });
  return pageMetadata({ locale, path: "/book", title: t("title"), description: t("lead") });
}

// The Cal.com check is cached for an hour (see cal-status.ts).
export const revalidate = 3600;

// FR-BOOK-01: Cal.com in the visitor's time zone, loaded only on this page and only on
// request. If the event doesn't exist, visitors get a working fallback instead (P0-2).
export default async function BookPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, ct, settings] = await Promise.all([
    getTranslations({ locale, namespace: "templates.book" }),
    getTranslations({ locale, namespace: "contact" }),
    getSiteSettings(locale),
  ]);
  const overlap = icuPluralForms(ct.raw("overlapSummary") as string);
  const calLink = (await getPublicSystem()).calLink ?? undefined;
  const status = await calLinkStatus(calLink);
  const showCalendar = Boolean(calLink) && status !== "missing";
  const whatsapp = settings.whatsapp?.enabled ? settings.whatsapp.number : null;
  const [before = "", after = ""] = (t.raw("fallback") as string).split("{email}");
  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[{ label: t("title"), href: "/book" }]}
        title={t("title")}
        lead={t("lead")}
        icon="calendar"
        chips={["30 min", "Kigali · UTC+2", "EN · FR · RW"]}
      />
      <div className="section">
        <div className="container-page">
          <div className="grid gap-12 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
            <div className="space-y-8">
              <div className="rounded-xl border border-subtle bg-surface p-5">
                <HoursOverlap
                  hours={DEFAULT_OFFICE_HOURS}
                  copy={{
                    title: ct("overlapTitle"),
                    you: ct.raw("overlapYou") as string,
                    kigali: ct("overlapKigali"),
                    summary: {
                      zero: overlap.zero ?? overlap.other,
                      one: overlap.one,
                      other: overlap.other,
                    },
                  }}
                />
              </div>
              {showCalendar && (
                <p className="text-body-sm text-fg-secondary">
                  {before}
                  <a
                    href={`mailto:${settings.email}`}
                    className="font-semibold text-accent underline underline-offset-4"
                  >
                    {settings.email}
                  </a>
                  {after}
                </p>
              )}
            </div>
            {showCalendar ? (
              <CalEmbed
                calLink={calLink!}
                title={t("title")}
                copy={{ loading: t("loading"), show: t("showTimes"), note: t("calNote") }}
              />
            ) : (
              <section
                aria-labelledby="book-fallback"
                className="self-start rounded-xl border border-subtle bg-surface p-8 shadow-1 sm:p-10"
              >
                <h2 id="book-fallback" className="font-display text-heading-lg">
                  {t("unavailableTitle")}
                </h2>
                <p className="mt-3 max-w-xl text-body-lg text-fg-secondary">
                  {t("unavailableBody")}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <a href={localizePath("/contact?topic=sales", locale)}>
                      <PhoneCall aria-hidden />
                      {t("requestCall")}
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <a href={`mailto:${settings.email}`}>
                      <Mail aria-hidden />
                      {t("emailUs")}
                    </a>
                  </Button>
                  {whatsapp && (
                    <Button asChild size="lg" variant="secondary">
                      <a
                        href={`https://wa.me/${whatsapp.replace("+", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle aria-hidden />
                        {t("whatsapp")}
                      </a>
                    </Button>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
