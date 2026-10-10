import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ContactForm } from "@/features/contact/ContactForm";
import { CopyButton, HoursOverlap, KigaliClock } from "@/features/contact/ContactWidgets";
import { contactFormCopy } from "@/features/contact/copy";
import { OfficeMap } from "@/features/contact/OfficeMap";
import { localizePath, type Locale } from "@/i18n/routing";
import { getServiceOptions } from "@/lib/cms/services";
import { getSiteSettings } from "@/lib/cms/settings";
import { countryOptions } from "@/lib/forms/options";
import { callingCodes } from "@/lib/forms/phone";
import { formatPhone } from "@/lib/format";
import { icuPluralForms } from "@/lib/i18n-plural";
import { pageMetadata } from "@/lib/seo/metadata";
import { DEFAULT_OFFICE_HOURS } from "@/lib/time/office-hours";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({ locale, path: "/contact", title: t("title"), description: t("lead") });
}

// FR-CON-01/02 contact page with department routing (?topic=academy preselects,
// read on the client so the page stays static).
export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, c, n, settings, copy, services] = await Promise.all([
    getTranslations({ locale, namespace: "contact" }),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "nav" }),
    getSiteSettings(locale),
    contactFormCopy(locale),
    getServiceOptions(locale),
  ]);
  const hours = settings.officeHours
    ? {
        openHour: settings.officeHours.openHour ?? 8,
        closeHour: settings.officeHours.closeHour ?? 17,
        days: (settings.officeHours.days ?? []).map(Number),
      }
    : DEFAULT_OFFICE_HOURS;
  const phone = settings.phones?.[0]?.number;
  const whatsapp = settings.whatsapp?.enabled ? settings.whatsapp.number : null;
  const overlap = icuPluralForms(t.raw("overlapSummary") as string);

  const options = [
    { icon: Mail, label: t("email"), value: settings.email, href: `mailto:${settings.email}` },
    phone && {
      icon: Phone,
      label: t("phone"),
      value: formatPhone(phone),
      href: `tel:${phone}`,
      copy: phone,
    },
    whatsapp && {
      icon: MessageCircle,
      label: t("whatsapp"),
      value: formatPhone(whatsapp),
      href: `https://wa.me/${whatsapp.replace("+", "")}`,
      copy: whatsapp,
    },
  ].filter(Boolean) as {
    icon: typeof Mail;
    label: string;
    value: string;
    href: string;
    copy?: string;
  }[];

  return (
    <div className="section pt-10">
      <div className="container-page">
        <Breadcrumbs locale={locale} items={[{ label: t("title"), href: "/contact" }]} />
        <div className="mt-8 grid gap-12 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div className="space-y-10">
            <header>
              <p className="eyebrow">{t("eyebrow")}</p>
              <h1 className="mt-3 text-display-xl">{t("title")}</h1>
              <p className="mt-4 max-w-md text-body-lg text-fg-secondary">{t("lead")}</p>
            </header>

            <section aria-labelledby="contact-options">
              <h2 id="contact-options" className="sr-only">
                {t("options")}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {options.map(({ icon: IconC, ...o }) => (
                  <li
                    key={o.label}
                    className="flex items-center gap-3 rounded-lg border border-subtle bg-surface p-4 shadow-1"
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                      <IconC aria-hidden className="size-5" strokeWidth={1.5} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-sm text-fg-secondary">{o.label}</span>
                      <a
                        href={o.href}
                        className="block font-semibold [overflow-wrap:anywhere] hover:text-accent"
                        {...(o.href.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {o.value}
                      </a>
                    </span>
                    <CopyButton
                      value={o.copy ?? o.value}
                      label={c("copy")}
                      copiedLabel={c("copied")}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section
              aria-labelledby="visit"
              className="overflow-hidden rounded-xl border border-subtle bg-surface shadow-1"
            >
              <a
                href={settings.address?.mapsUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-[20/11]"
              >
                <OfficeMap label={t("mapAlt")} />
              </a>
              <div className="space-y-3 p-5">
                <h2 id="visit" className="flex items-center gap-2 font-display text-heading-md">
                  <MapPin aria-hidden className="size-5 text-accent" />
                  {t("visit")}
                </h2>
                <address className="text-fg-secondary not-italic">
                  {settings.address?.building}, {settings.address?.street}
                  <br />
                  {settings.address?.district}, {settings.address?.city},{" "}
                  {settings.address?.country}
                  {settings.address?.landmark && (
                    <>
                      <br />
                      <span className="text-body-sm">{settings.address.landmark}</span>
                    </>
                  )}
                </address>
                <KigaliClock
                  hours={hours}
                  copy={{
                    open: c("openNow"),
                    closed: c("closedNow"),
                    time: c.raw("kigaliTime") as string,
                  }}
                />
                {settings.address?.mapsUrl && (
                  <p>
                    <a
                      href={settings.address.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-accent underline-offset-4 hover:underline"
                    >
                      {t("directions")} →
                    </a>
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-subtle bg-surface p-5 shadow-1">
              <HoursOverlap
                hours={hours}
                copy={{
                  title: t("overlapTitle"),
                  you: t.raw("overlapYou") as string,
                  kigali: t("overlapKigali"),
                  summary: {
                    zero: overlap.zero ?? overlap.other,
                    one: overlap.one,
                    other: overlap.other,
                  },
                }}
              />
            </section>
          </div>

          <section
            aria-labelledby="form-title"
            className="rounded-xl border border-subtle bg-surface p-6 shadow-2 sm:p-8 lg:p-10"
          >
            <h2 id="form-title" className="mb-6 font-display text-heading-lg">
              {t("formTitle")}
            </h2>
            <ContactForm
              copy={copy}
              locale={locale}
              countries={countryOptions(locale)}
              callingCodes={callingCodes()}
              services={services}
              turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined}
            />
            <p className="mt-8 border-t border-subtle pt-6 text-body-sm text-fg-secondary">
              <strong className="text-fg">{t("bookTitle")}</strong> {t("bookLead")}{" "}
              <a
                href={localizePath("/book", locale)}
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                {n("book")} →
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
