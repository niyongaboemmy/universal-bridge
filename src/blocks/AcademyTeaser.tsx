import { ArrowRight, ArrowUpRight, BadgeCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { AccentText } from "@/components/ui/AccentText";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import { intakeLabels } from "@/features/academy/format";
import { localizePath } from "@/i18n/routing";
import { openIntakes } from "@/lib/cms/academy";
import { getPrograms } from "@/lib/cms/content";
import { editable } from "@/lib/live-edit/attrs";
import { cn } from "@/lib/utils";
import { nowMs } from "@/lib/time/office-hours";
import type { Program } from "@/payload-types";
import { Section } from "./Section";
import type { BlockProps } from "./types";

/**
 * FR-HOME-10 Academy teaser — minimal: headline, a hairline list of the next
 * open intakes (or the programs when none is open), one action, and the photo.
 * System colours only; it reads the same on white paper and on navy.
 */
export async function AcademyTeaserBlock({ block, locale, edit }: BlockProps<"academyTeaser">) {
  const [t, intakes, programs] = await Promise.all([
    getTranslations({ locale, namespace: "academyTeaser" }),
    openIntakes(locale, new Date(nowMs())),
    getPrograms(locale),
  ]);
  const rows = intakes.length
    ? await Promise.all(
        intakes.slice(0, 3).map(async (i) => {
          const program = i.program as Program;
          const labels = await intakeLabels(i, locale);
          const taken = i.capacity
            ? Math.round(((i.capacity - i.seatsLeft) / i.capacity) * 100)
            : 0;
          return {
            id: i.id,
            slug: program.slug,
            title: program.title,
            meta: labels.starts,
            seats: labels.seats,
            full: i.full,
            low: !i.full && i.seatsLeft <= 5,
            taken,
          };
        }),
      )
    : programs.slice(0, 4).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        meta: null,
        seats: null,
        full: false,
        low: false,
        taken: null as number | null,
      }));

  return (
    <Section id={block.anchor}>
      {/* Text and photo share one height on desktop, so their edges line up. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-stretch lg:gap-16">
        <div className="flex flex-col">
          {block.eyebrow && (
            <p className="eyebrow" {...editable(edit, "eyebrow", "text", block.eyebrow)}>
              {block.eyebrow}
            </p>
          )}
          <h2 className="mt-3 text-display-lg" {...editable(edit, "title", "accent", block.title)}>
            <AccentText text={block.title} />
          </h2>
          {block.lead && (
            <p
              className="mt-4 max-w-lg text-body-lg text-fg-secondary"
              {...editable(edit, "lead", "textarea", block.lead)}
            >
              {block.lead}
            </p>
          )}

          <p className="mt-10 font-mono text-[0.72rem] tracking-[0.18em] text-fg-muted uppercase">
            {intakes.length ? t("nextIntakes") : t("programs")}
          </p>
          <ul className="mt-3 border-t border-subtle">
            {rows.map((r, n) => (
              <li
                key={r.id}
                className="academy-row border-b border-subtle"
                style={{ "--i": n } as React.CSSProperties}
              >
                <a
                  href={localizePath(`/academy/programs/${r.slug}`, locale)}
                  className="group/row relative flex items-center gap-4 py-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  {/* Accent bar slides in from the left on hover. */}
                  <span
                    aria-hidden
                    className="absolute top-3 bottom-3 left-0 w-0.5 origin-top scale-y-0 rounded-full bg-spark transition-transform duration-300 group-hover/row:scale-y-100"
                  />
                  <span
                    aria-hidden
                    className="w-6 shrink-0 font-mono text-[0.72rem] text-fg-muted transition-[translate,color] duration-300 group-hover/row:translate-x-2 group-hover/row:text-spark-text"
                  >
                    {String(n + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1 transition-transform duration-300 group-hover/row:translate-x-2">
                    <span className="block truncate font-medium text-fg">{r.title}</span>
                    {r.meta && (
                      <span className="mt-0.5 block text-body-sm text-fg-secondary">
                        {r.meta}
                        {r.seats && (
                          <span className={cn("sm:hidden", (r.full || r.low) && "text-spark-text")}>
                            {" "}
                            · {r.seats}
                          </span>
                        )}
                      </span>
                    )}
                  </span>
                  {r.seats && (
                    <span className="hidden w-40 shrink-0 sm:block">
                      <span
                        className={cn(
                          "flex items-center justify-end gap-1.5 text-[0.75rem] font-medium",
                          r.full || r.low ? "text-spark-text" : "text-fg-secondary",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            r.full || r.low ? "bg-spark" : "bg-success",
                          )}
                        />
                        {r.seats}
                      </span>
                      {r.taken != null && (
                        <span
                          aria-hidden
                          className="mt-1.5 block h-1 overflow-hidden rounded-full bg-sunken"
                        >
                          <span
                            className={cn(
                              "seat-fill block h-full rounded-full",
                              r.full || r.low ? "bg-spark" : "bg-accent",
                            )}
                            style={{ "--fill": `${r.taken}%` } as React.CSSProperties}
                          />
                        </span>
                      )}
                    </span>
                  )}
                  <span
                    aria-hidden
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-subtle text-fg-muted transition-[background-color,color,border-color] duration-300 group-hover/row:border-transparent group-hover/row:bg-spark group-hover/row:text-on-spark"
                  >
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover/row:rotate-45" />
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-auto lg:pt-8">
            {block.cta?.label && block.cta.href && (
              <Button asChild size="lg">
                <a href={localizePath(block.cta.href, locale)}>
                  <span {...editable(edit, "cta.label", "text", block.cta.label)}>
                    {block.cta.label}
                  </span>{" "}
                  <ArrowRight aria-hidden data-arrow />
                </a>
              </Button>
            )}
            <a
              href={localizePath("/academy/verify", locale)}
              className="group/link inline-flex min-h-11 items-center gap-1.5 font-medium text-accent"
            >
              {t("verify")}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform group-hover/link:translate-x-1"
              />
            </a>
          </div>
        </div>

        {block.media && typeof block.media === "object" && (
          <div className="academy-photo group/media relative aspect-[4/3] lg:aspect-auto lg:min-h-[28rem]">
            <Media
              media={block.media}
              editAttrs={editable(edit, "media", "image", block.media.id)}
              sizes="(min-width:1024px) 40vw, 100vw"
              className="absolute inset-0 rounded-3xl border border-subtle shadow-3"
              imgClassName="transition-transform duration-[1200ms] ease-standard group-hover/media:scale-[1.05]"
              conceptPosition="right"
            />
            <p className="academy-badge glass absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-subtle py-1.5 pr-3.5 pl-1.5 text-body-sm font-medium text-fg shadow-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-spark text-on-spark">
                <BadgeCheck aria-hidden className="size-4" />
              </span>
              {t("badgeTitle")}
            </p>
          </div>
        )}
      </div>
    </Section>
  );
}
