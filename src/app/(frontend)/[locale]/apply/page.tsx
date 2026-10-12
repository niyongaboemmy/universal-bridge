import { ArrowRight, CalendarClock, MapPin, Users } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DetailHero } from "@/components/layout/DetailHero";
import { APPLICATION_TYPES } from "@/collections/Applications";
import { getPublicOpenings, isAccepting } from "@/features/openings/data";
import { localizePath, type Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo/metadata";
import { nowMs } from "@/lib/time/office-hours";
import type { Opening } from "@/payload-types";
import { buttonVariants } from "@/components/ui/button-variants";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "openings" });
  return pageMetadata({ locale, path: "/apply", title: t("title"), description: t("lead") });
}

const DAY = 86_400_000;

/** Everything open for applications, grouped by kind. */
export default async function ApplyIndex({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, openings] = await Promise.all([
    getTranslations({ locale, namespace: "openings" }),
    getPublicOpenings(locale),
  ]);
  const now = nowMs();
  const live = openings.filter((o) => isAccepting(o, now));
  const kinds = APPLICATION_TYPES.filter((k) => live.some((o) => o.kind === k));
  const deadline = (o: Opening) => {
    if (!o.closesAt) return t("noDeadline");
    const days = Math.max(0, Math.floor((new Date(o.closesAt).getTime() + DAY - now) / DAY) - 1);
    return t("closesIn", { days });
  };

  return (
    <>
      <DetailHero
        locale={locale}
        crumbs={[{ label: t("title"), href: "/apply" }]}
        title={t("title")}
        lead={t("lead")}
        icon="rocket"
        chips={kinds.map((k) => t(`kinds.${k}`))}
      />
      <div className="section pt-12">
        <div className="container-page">
          {kinds.length > 1 && (
            <nav className="flex flex-wrap gap-2" aria-label={t("title")}>
              {kinds.map((k) => (
                <a
                  key={k}
                  href={`#${k}`}
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  {t(`kinds.${k}`)}
                  <span className="ml-1.5 text-fg-muted">
                    {live.filter((o) => o.kind === k).length}
                  </span>
                </a>
              ))}
            </nav>
          )}
          {!live.length ? (
            <p className="mt-12 rounded-xl border border-dashed border-strong p-10 text-center text-body-lg text-fg-secondary">
              {t("empty")}
            </p>
          ) : (
            kinds.map((k) => (
              <section key={k} id={k} className="mt-12 scroll-mt-28">
                <h2 className="font-display text-heading-lg">{t(`kinds.${k}`)}</h2>
                <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {live
                    .filter((o) => o.kind === k)
                    .map((o) => (
                      <li key={o.id}>
                        <a
                          href={localizePath(`/apply/${o.slug}`, locale)}
                          className="group flex h-full flex-col rounded-xl border border-subtle bg-surface p-6 shadow-1 transition-[translate,box-shadow,border-color] hover:-translate-y-1 hover:border-strong hover:shadow-2"
                        >
                          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--accent-spark)_14%,transparent)] px-2.5 py-0.5 text-[0.75rem] font-semibold text-[var(--accent-spark-text)]">
                            <CalendarClock className="size-3.5" aria-hidden />
                            {deadline(o)}
                          </span>
                          <span className="mt-4 font-display text-heading-md group-hover:text-accent">
                            {o.title}
                          </span>
                          {o.summary && (
                            <span className="mt-2 line-clamp-3 text-body-sm text-fg-secondary">
                              {o.summary}
                            </span>
                          )}
                          <span className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-5 text-[0.8125rem] text-fg-muted">
                            {(o.location || o.mode) && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="size-3.5" aria-hidden />
                                {[o.location, o.mode ? t(`modes.${o.mode}`) : null]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                            )}
                            {o.seats ? (
                              <span className="inline-flex items-center gap-1">
                                <Users className="size-3.5" aria-hidden />
                                {t("seats", { count: o.seats })}
                              </span>
                            ) : null}
                            <ArrowRight
                              className="ml-auto size-4 text-accent transition-transform group-hover:translate-x-1"
                              aria-hidden
                            />
                          </span>
                        </a>
                      </li>
                    ))}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </>
  );
}
