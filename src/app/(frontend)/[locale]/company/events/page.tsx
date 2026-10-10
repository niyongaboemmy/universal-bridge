import { CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CoverArt } from "@/components/brand/CoverArt";
import { Badge } from "@/components/ui/Badge";
import { Media } from "@/components/ui/Media";
import { localizePath, type Locale } from "@/i18n/routing";
import { getEvents } from "@/lib/cms/content";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Event } from "@/payload-types";
import { eventDate } from "@/features/events/format";
import { nowMs } from "@/lib/time/office-hours";

// Upcoming/past and registration state are time-based: re-render hourly.
export const revalidate = 3600;

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "s5.events" });
  return pageMetadata({
    locale,
    path: "/company/events",
    title: t("title"),
    description: t("lead"),
  });
}

async function EventRow({ e, locale }: { e: Event; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "s5.events" });
  return (
    <article className="group relative grid gap-5 rounded-xl border border-subtle bg-surface p-5 shadow-1 sm:grid-cols-[220px_1fr]">
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-sunken">
        {e.cover && typeof e.cover === "object" ? (
          <Media media={e.cover} sizes="220px" className="absolute inset-0" />
        ) : (
          <CoverArt seed={e.slug} />
        )}
      </div>
      <div>
        <Badge tone="spark">{t(`kinds.${e.kind}`)}</Badge>
        <h3 className="mt-3 font-display text-heading-md">
          <a
            href={localizePath(`/company/events/${e.slug}`, locale)}
            className="after:absolute after:inset-0"
          >
            {e.title}
          </a>
        </h3>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-fg-secondary">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-4" />
            <time dateTime={e.startAt}>{eventDate(e.startAt, locale)}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden className="size-4" />
            {e.venue?.online ? t("online") : (e.venue?.name ?? "Kigali")}
          </span>
        </p>
        <p className="mt-2 text-fg-secondary">{e.summary}</p>
      </div>
    </article>
  );
}

// FR-EVT-01: upcoming and past events.
export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [events, t, n] = await Promise.all([
    getEvents(locale),
    getTranslations({ locale, namespace: "s5.events" }),
    getTranslations({ locale, namespace: "nav" }),
  ]);
  const now = nowMs();
  const upcoming = events.filter((e) => new Date(e.endAt ?? e.startAt).getTime() >= now);
  const past = events.filter((e) => new Date(e.endAt ?? e.startAt).getTime() < now).reverse();
  return (
    <div className="section pt-8">
      <div className="container-page">
        <Breadcrumbs
          locale={locale}
          items={[
            { label: n("company"), href: "/company/about" },
            { label: t("title"), href: "/company/events" },
          ]}
        />
        <h1 className="mt-10 text-display-xl">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-fg-secondary">{t("lead")}</p>
        <h2 className="mt-14 font-display text-heading-lg">{t("upcoming")}</h2>
        {upcoming.length ? (
          <ul className="mt-6 space-y-4">
            {upcoming.map((e) => (
              <li key={e.id}>
                <EventRow e={e} locale={locale} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl border border-dashed border-strong p-8 text-fg-secondary">
            {t("none")}
          </p>
        )}
        {past.length > 0 && (
          <>
            <h2 className="mt-14 font-display text-heading-lg">{t("past")}</h2>
            <ul className="mt-6 space-y-4">
              {past.map((e) => (
                <li key={e.id}>
                  <EventRow e={e} locale={locale} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
