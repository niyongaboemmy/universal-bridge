import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ServiceVisual } from "@/components/cards/ServiceVisual";
import { Icon } from "@/components/ui/Icon";
import { localizePath, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { Service } from "@/payload-types";
import { buttonVariants } from "@/components/ui/button-variants";

const PILLARS = ["engineering", "technology", "innovation", "consulting"] as const;

/**
 * Home services as a pillar carousel: one slide per pillar, each holding its
 * services side by side (2 per pillar today). Tabs jump to a pillar; an
 * underline follows the horizontal scroll (CSS scroll timeline). Swipe on
 * phones, snap everywhere. Every service appears once: live diagram, title,
 * one line, View and Send request. Works without JavaScript; lib/fx/carousel
 * adds auto-advance (with pause), arrows, the counter and the active state.
 */
export async function ServicePairs({ services, locale }: { services: Service[]; locale: Locale }) {
  const [t, ask] = await Promise.all([
    getTranslations({ locale, namespace: "templates" }),
    getTranslations({ locale, namespace: "servicesCta" }),
  ]);
  const slides = PILLARS.map((p) => ({
    pillar: p,
    items: services.filter((s) => s.pillar === p),
  })).filter((s) => s.items.length);
  return (
    <div className="svc-pairs mt-12 flex flex-col short:mt-8" data-fx="carousel">
      {/* Pillar tabs with a scroll-linked underline */}
      <nav
        aria-label={t("pillars.all")}
        className="relative grid border-b border-subtle"
        style={{ gridTemplateColumns: `repeat(${slides.length}, minmax(0, 1fr))` }}
      >
        {slides.map((s) => (
          <a
            key={s.pillar}
            href={`#svc-${s.pillar}`}
            aria-controls={`svc-${s.pillar}`}
            className="flex min-h-12 items-center justify-center px-2 pb-3 text-center text-body-sm font-medium text-fg-muted transition-colors duration-300 hover:text-fg aria-[current=true]:text-fg sm:text-body-md"
          >
            {t(`pillars.${s.pillar}`)}
          </a>
        ))}
        <span
          aria-hidden
          className="svc-pairs__ink absolute bottom-[-1px] left-0 h-0.5 rounded-full bg-spark"
          style={
            {
              width: `${100 / slides.length}%`,
              "--svc-steps": slides.length - 1,
            } as React.CSSProperties
          }
        />
      </nav>

      {/* Padded so a lifted card's border and shadow are not clipped by the scroller. */}
      <div className="svc-pairs__track relative order-3 -mx-3 mt-2 flex md:order-2 md:mt-4 scroll-px-3 snap-x snap-mandatory gap-6 overflow-x-auto overscroll-x-contain px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {slides.map((slide) => (
          <section
            key={slide.pillar}
            id={`svc-${slide.pillar}`}
            aria-label={t(`pillars.${slide.pillar}`)}
            className="grid w-full shrink-0 snap-start snap-always scroll-mt-32 grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2"
          >
            {slide.items.map((s, i) => (
              <article
                key={s.slug}
                style={{ "--i": i } as React.CSSProperties}
                className="group flex flex-col overflow-hidden rounded-3xl border border-subtle bg-surface transition-[translate,box-shadow,border-color] duration-300 ease-standard hover:-translate-y-1 hover:border-strong hover:shadow-3"
              >
                <div className="bg-[radial-gradient(90%_90%_at_100%_0%,color-mix(in_oklab,var(--accent-primary)_9%,transparent),transparent)] px-6 pt-7 sm:px-8 sm:pt-9 short:pt-7">
                  <ServiceVisual
                    icon={s.icon}
                    feature={s.icon === "code"}
                    className={cn(
                      "mx-auto h-28 sm:h-40 short:h-32",
                      s.icon === "code" ? "max-w-md" : "max-w-xs",
                    )}
                  />
                </div>
                <div className="flex flex-1 flex-col px-6 pt-5 pb-6 sm:px-8 sm:pb-8 short:pb-7">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-subtle text-accent transition-colors duration-300 group-hover:border-transparent group-hover:bg-spark group-hover:text-on-spark [&_svg]:size-[1.125rem]">
                      <Icon name={s.icon} />
                    </span>
                    <h3 className="font-display text-heading-md font-semibold tracking-tight">
                      {s.title}
                    </h3>
                  </div>
                  <p className="mt-3 text-fg-secondary">{s.summary}</p>
                  <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5 sm:pt-6">
                    <a
                      href={localizePath(`/contact?topic=sales&service=${s.slug}`, locale)}
                      className={buttonVariants()}
                    >
                      {ask("requestThis")}
                      <ArrowRight aria-hidden data-arrow />
                    </a>
                    <a
                      href={localizePath(`/services/${s.slug}`, locale)}
                      aria-label={`${ask("view")}: ${s.title}`}
                      className="group/view inline-flex min-h-11 items-center gap-1.5 font-medium text-accent"
                    >
                      {ask("view")}
                      <ArrowUpRight
                        aria-hidden
                        className="size-4 transition-transform group-hover/view:translate-x-0.5 group-hover/view:-translate-y-0.5"
                      />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ))}
      </div>

      {/* Controls: auto-advance ring (pause/play), counter, arrows. Shown once the script runs.
          Phones: right under the tabs, so they are seen before the stacked pair. */}
      <div className="svc-pairs__controls order-2 mt-4 flex md:order-3 md:mt-2 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-toggle
            data-label-pause={ask("pause")}
            data-label-play={ask("play")}
            aria-label={ask("pause")}
            className="relative grid size-10 place-items-center rounded-full text-fg-secondary transition-colors hover:text-fg [&_svg.lucide]:size-3.5"
          >
            <svg aria-hidden viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                strokeWidth="1.5"
                className="stroke-[var(--border-subtle)]"
              />
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
                pathLength={100}
                className="svc-pairs__ring stroke-spark"
              />
            </svg>
            <Pause aria-hidden data-icon="pause" className="fill-current" />
            <Play aria-hidden data-icon="play" className="translate-x-px fill-current" />
          </button>
          <p
            aria-hidden
            className="font-mono text-label-sm tracking-wider text-fg-muted tabular-nums"
          >
            <span data-count className="text-fg">
              01
            </span>{" "}
            / {String(slides.length).padStart(2, "0")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["prev", "next"] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              data-dir={dir}
              aria-label={ask(dir)}
              className="grid size-11 place-items-center rounded-md border border-subtle text-fg transition-[background-color,border-color,color,scale] duration-300 ease-standard hover:border-transparent hover:bg-spark hover:text-on-spark active:scale-95 [&_svg]:size-5"
            >
              {dir === "prev" ? <ChevronLeft aria-hidden /> : <ChevronRight aria-hidden />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
