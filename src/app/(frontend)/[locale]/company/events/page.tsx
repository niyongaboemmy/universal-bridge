import { CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DetailHero } from "@/components/layout/DetailHero";
import { DetailCta } from "@/components/patterns/DetailCta";
import { InnerSection } from "@/components/patterns/Inner";
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
  const start = new Date(e.startAt);
  return (
    <article className="spotlight group relative flex h-full flex-col overflow-hidden rounded-2xl border border-subtle bg-surface shadow-1 transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--accent-spark)_45%,var(--border-subtle))] hover:shadow-3">
      <div className="relative aspect-[16/9] overflow-hidden bg-sunken">
        {e.cover && typeof e.cover === "object" ? (
          <Media
            media={e.cover}
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="absolute inset-0"
            imgClassName="transition-transform duration-700 group-hover:scale-[1.05]"
          />
        ) : (
          <CoverArt seed={e.slug} />
        )}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(6_13_32/0.65))]"
        />
        <time
          dateTime={e.startAt}
          className="glass absolute bottom-3 left-3 flex flex-col items-center rounded-xl border border-subtle px-3 py-1.5 text-center leading-none text-fg shadow-3"
        >
          <span className="font-display text-heading-md font-bold">
            {start.toLocaleDateString(locale, { day: "2-digit", timeZone: "Africa/Kigali" })}
          </span>
          <span className="mt-1 font-mono text-[0.65rem] tracking-[0.14em] uppercase">
            {start.toLocaleDateString(locale, {
              month: "short",
              year: "numeric",
              timeZone: "Africa/Kigali",
            })}
          </span>
        </time>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Badge tone="spark">{t(`kinds.${e.kind}`)}</Badge>
        <h3 className="mt-3 font-display text-heading-md">
          <a
            href={localizePath(`/company/events/${e.slug}`, locale)}
            className="outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-focus"
          >
            {e.title}
          </a>
        </h3>
        <p className="mt-2 line-clamp-3 text-fg-secondary">{e.summary}</p>
        <p className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-5 text-body-sm text-fg-secondary">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-4 text-accent" />
            {eventDate(e.startAt, locale)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden className="size-4 text-accent" />
            {e.venue?.online ? t("online") : (e.venue?.name ?? "Kigali")}
          </span>
        </p>
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
  const cover = events.find((e) => e.cover && typeof e.cover === "object")?.cover;
  const d = await getTranslations({ locale, namespace: "templates.detail" });
  const grid = (list: Event[]) => (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((e) => (
        <li key={e.id} className="reveal">
          <EventRow e={e} locale={locale} />
        </li>
      ))}
    </ul>
  );
  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[
          { label: n("company"), href: "/company/about" },
          { label: t("title"), href: "/company/events" },
        ]}
        eyebrow={n("company")}
        title={t("title")}
        lead={t("lead")}
        media={cover}
        icon={cover ? undefined : "calendar"}
      />
      <InnerSection title={t("upcoming")}>
        {upcoming.length ? (
          grid(upcoming)
        ) : (
          <p className="flex items-center gap-3 rounded-2xl border border-dashed border-strong p-8 text-fg-secondary">
            <CalendarDays aria-hidden className="size-5 text-accent" />
            {t("none")}
          </p>
        )}
      </InnerSection>
      {past.length > 0 && (
        <InnerSection title={t("past")} sunken>
          {grid(past)}
        </InnerSection>
      )}
      <DetailCta
        locale={locale}
        eyebrow={d("ctaEyebrow")}
        title={d("labCtaTitle")}
        lead={d("labCtaLead")}
        primary={{ label: n("letsTalk"), href: "/contact?topic=partnerships" }}
        secondary={{ label: n("labs"), href: "/labs" }}
      />
    </>
  );
}
