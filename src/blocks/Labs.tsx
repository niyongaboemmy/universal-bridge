import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Media } from "@/components/ui/Media";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { localizePath } from "@/i18n/routing";
import { getHubs } from "@/lib/cms/content";
import { RAIL } from "@/lib/grid";
import { cn } from "@/lib/utils";
import type { Hub } from "@/payload-types";
import { Section } from "./Section";
import type { BlockProps } from "./types";

const STATUS_DOT: Record<string, string> = {
  live: "bg-success",
  pilot: "bg-spark",
  prototype: "bg-accent",
  exploring: "bg-[var(--text-muted)]",
};

/**
 * FR-HOME-08 Labs: image-led cards that invite a visit. Each shows what the lab
 * is building right now (from the Hubs collection), its focus areas and a live
 * status; a light scan sweeps the photo on hover. A summary line (labs, active
 * projects, open to partners worldwide) and a partner link sit under the title.
 * Theme tokens only, so it reads on white paper and on navy.
 */
export async function LabsBlock({ block, locale, edit }: BlockProps<"labs">) {
  const [t, s, hubs] = await Promise.all([
    getTranslations({ locale, namespace: "templates.home" }),
    getTranslations({ locale, namespace: "s5.labs.status" }),
    getHubs(locale),
  ]);
  const bySlug = new Map(hubs.map((h: Hub) => [h.slug, h]));
  const cards = (block.hubs ?? []).map((card) => {
    const hub = card.href ? bySlug.get(card.href.split("/").pop() ?? "") : undefined;
    const project = hub?.projects?.find((p) => p.status !== "exploring") ?? hub?.projects?.[0];
    return { card, project, focus: (hub?.focusAreas ?? []).slice(0, 3).map((f) => f.title) };
  });
  const active = hubs.reduce(
    (n, h) => n + (h.projects?.filter((p) => p.status !== "exploring").length ?? 0),
    0,
  );

  return (
    <Section id={block.anchor} night className="overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
      />
      <SectionHeader
        eyebrow={block.eyebrow}
        edit={edit}
        title={block.title}
        lead={block.lead}
        action={
          <a
            href={localizePath("/contact?topic=partnerships", locale)}
            className="group/link inline-flex min-h-11 shrink-0 items-center gap-1.5 font-medium text-accent"
          >
            {t("labsPartner")}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover/link:translate-x-1"
            />
          </a>
        }
      />
      <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.75rem] tracking-[0.14em] text-fg-secondary uppercase">
        <span>{t("labsHubs", { n: cards.length })}</span>
        <span aria-hidden className="size-1 rounded-full bg-[var(--border-strong)]" />
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          {t("labsProjects", { n: active })}
        </span>
        <span aria-hidden className="size-1 rounded-full bg-[var(--border-strong)]" />
        <span>{t("labsOpen")}</span>
      </p>

      <ul className={cn("relative mt-10 gap-6 sm:grid md:grid-cols-3", RAIL)}>
        {cards.map(({ card, project, focus }, i) => (
          <li
            key={card.id ?? i}
            className="lab-card group relative flex shrink-0 snap-start flex-col max-sm:w-[84%]"
            style={{ "--i": i } as React.CSSProperties}
          >
            {/* Frameless: the photo is the card. */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-[var(--border-subtle)] transition-shadow duration-500 group-hover:shadow-3">
              {card.media && typeof card.media === "object" ? (
                <Media
                  media={card.media}
                  sizes="(min-width: 768px) 33vw, 85vw"
                  className="absolute inset-0"
                  imgClassName="transition-transform duration-[1200ms] ease-standard group-hover:scale-[1.07]"
                  conceptPosition="right"
                />
              ) : (
                <div className="absolute inset-0 bg-sunken" />
              )}
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgb(6_13_32/0.45))]"
              />
              <span
                aria-hidden
                className="lab-scan pointer-events-none absolute inset-x-0 top-0 h-1/3"
              />
              <span className="absolute top-3 left-3 rounded-full bg-black/45 px-2.5 py-1 font-mono text-[0.66rem] tracking-[0.16em] text-white uppercase backdrop-blur-sm">
                {t("labsLab")} {String(i + 1).padStart(2, "0")}
              </span>
              {project && (
                <p className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full bg-black/45 py-1 pr-3 pl-2.5 text-[0.75rem] text-white backdrop-blur-sm">
                  <span
                    className={cn(
                      "lab-live size-1.5 shrink-0 rounded-full",
                      STATUS_DOT[project.status ?? ""] ?? "bg-accent",
                    )}
                  />
                  <span className="sr-only">{t("labsNow")}:</span>
                  <span className="truncate">{project.title}</span>
                  {project.status && (
                    <span className="shrink-0 text-white/65">· {s(project.status)}</span>
                  )}
                </p>
              )}
            </div>

            <div className="pt-5">
              <h3 className="flex items-center gap-2 font-display text-heading-md font-semibold tracking-tight">
                {card.href ? (
                  <a
                    href={localizePath(card.href, locale)}
                    className="outline-none transition-colors duration-300 group-hover:text-accent after:absolute after:inset-0 after:rounded-3xl focus-visible:after:outline-2 focus-visible:after:outline-focus"
                  >
                    {card.title}
                  </a>
                ) : (
                  card.title
                )}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 text-fg-muted transition-[translate,color] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                />
              </h3>
              {card.body && <p className="mt-1.5 text-fg-secondary">{card.body}</p>}
              {focus.length > 0 && (
                <p className="mt-3 font-mono text-[0.7rem] tracking-[0.12em] text-fg-muted uppercase">
                  {focus.join(" · ")}
                </p>
              )}
              {/* Hairline that draws across on hover. */}
              <span
                aria-hidden
                className="mt-5 block h-px origin-left scale-x-[0.12] bg-[var(--accent-spark)] transition-transform duration-700 ease-standard group-hover:scale-x-100"
              />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
