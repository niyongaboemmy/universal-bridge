import type { Metadata } from "next";
import { docRef } from "@/lib/live-edit/session";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildFields, engineCopy } from "@/components/forms/engine-copy";
import { FormEngine } from "@/components/forms/FormEngine";
import { FormSection } from "@/components/forms/FormSection";
import { DetailHero } from "@/components/layout/DetailHero";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { registerForEvent } from "@/features/events/actions";
import { routing, type Locale } from "@/i18n/routing";
import { getEvent, publishedSlugs } from "@/lib/cms/content";
import { callingCodes } from "@/lib/forms/phone";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/utils";
import type { Media as MediaDoc } from "@/payload-types";
import { eventDate } from "@/features/events/format";
import { nowMs } from "@/lib/time/office-hours";

// Upcoming/past and registration state are time-based: re-render hourly.
export const revalidate = 3600;

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const slugs = await publishedSlugs("events");
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const e = await getEvent(slug, locale);
  if (!e) return {};
  return pageMetadata({
    locale,
    path: `/company/events/${slug}`,
    title: e.seo?.title || e.title,
    description: e.seo?.description || e.summary,
  });
}

// FR-EVT-01: event detail, agenda, gallery, registration; Event JSON-LD.
export default async function EventPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [e, t] = await Promise.all([
    getEvent(slug, locale),
    getTranslations({ locale, namespace: "s5.events" }),
  ]);
  if (!e) notFound();
  const upcoming = new Date(e.startAt).getTime() > nowMs();
  const open = upcoming && e.registration?.open;
  const gallery = (e.gallery ?? []).filter((g): g is MediaDoc => typeof g === "object");
  const [copy, fields] = await Promise.all([
    engineCopy(locale),
    buildFields(locale, [
      { name: "name", type: "text", required: true, autoComplete: "name" },
      { name: "email", type: "email", required: true, autoComplete: "email" },
      { name: "phone", type: "phone" },
      { name: "organisation", type: "text", autoComplete: "organization" },
      ...(e.registration?.teams ? [{ name: "teamName", type: "text" as const }] : []),
    ]),
  ]);
  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[
          { label: t("title"), href: "/company/events" },
          { label: e.title, href: `/company/events/${slug}` },
        ]}
        eyebrow={t(`kinds.${e.kind}`)}
        title={e.title}
        edit={{ ref: await docRef("events", e, locale), title: "title", lead: "summary" }}
        lead={e.summary}
        aside={
          e.cover && typeof e.cover === "object" ? (
            <Media
              media={e.cover}
              priority
              sizes="(min-width:1024px) 400px, 100vw"
              className="aspect-[4/3] rounded-xl shadow-3"
            />
          ) : undefined
        }
      >
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-body-sm text-fg-muted">{t("when")}</dt>
            <dd className="font-semibold">
              <time dateTime={e.startAt}>{eventDate(e.startAt, locale)}</time>
            </dd>
          </div>
          <div>
            <dt className="text-body-sm text-fg-muted">{t("where")}</dt>
            <dd className="font-semibold">
              {e.venue?.online
                ? t("online")
                : [e.venue?.name, e.venue?.address].filter(Boolean).join(", ") || "Kigali"}
            </dd>
          </div>
        </dl>
      </DetailHero>
      <div className="section">
        <div className="container-page grid gap-12 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div>{e.body ? <RichText data={e.body} /> : null}</div>
          {!!e.agenda?.length && (
            <div>
              <h2 className="font-display text-heading-lg">{t("agenda")}</h2>
              <ol className="mt-5 space-y-4 border-l border-strong pl-6">
                {e.agenda.map((a, i) => (
                  <li key={a.id ?? i} className="relative">
                    <span
                      aria-hidden
                      className="absolute top-1.5 -left-[31px] size-3 rounded-full border-2 border-accent bg-canvas"
                    />
                    <p className="font-mono text-body-sm text-spark-text">{a.time}</p>
                    <p className="font-semibold">{a.title}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
      {gallery.length > 0 && (
        <div className="container-page grid grid-cols-2 gap-3 pb-16 md:grid-cols-3">
          {gallery.map((g) => (
            <Media key={g.id} media={g} sizes="33vw" className="aspect-[4/3] rounded-lg" />
          ))}
        </div>
      )}
      {upcoming && (
        <FormSection
          id="register"
          title={t("register")}
          lead={open ? t("registerLead") : t("closed")}
        >
          {open ? (
            <FormEngine
              schemaKey="event"
              action={registerForEvent}
              idPrefix="event"
              locale={locale}
              copy={copy}
              fields={fields}
              hidden={{ event: String(e.id) }}
              callingCodes={callingCodes()}
              submitLabel={t("register")}
              turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined}
            />
          ) : (
            <p className="text-fg-secondary">{t("closed")}</p>
          )}
        </FormSection>
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: e.title,
          description: e.summary,
          startDate: e.startAt,
          endDate: e.endAt ?? undefined,
          eventAttendanceMode: e.venue?.online
            ? "https://schema.org/OnlineEventAttendanceMode"
            : "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: e.venue?.online
            ? { "@type": "VirtualLocation", url: siteUrl(`/company/events/${slug}`) }
            : {
                "@type": "Place",
                name: e.venue?.name ?? "Universal Bridge",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: e.venue?.address ?? undefined,
                  addressLocality: "Kigali",
                  addressCountry: "RW",
                },
              },
          organizer: { "@id": siteUrl("/#organization") },
          ...(open
            ? {
                offers: {
                  "@type": "Offer",
                  price: 0,
                  priceCurrency: "RWF",
                  availability: "https://schema.org/InStock",
                  url: siteUrl(`/company/events/${slug}#register`),
                },
              }
            : {}),
        }}
      />
    </>
  );
}
