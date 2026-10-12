import { CircuitArt } from "@/components/brand/CircuitArt";
import { FactChips, HeroStage } from "@/components/patterns/Inner";
import { AccentText } from "@/components/ui/AccentText";
import { Media } from "@/components/ui/Media";
import type { Locale } from "@/i18n/routing";
import { editable, type EditRef } from "@/lib/live-edit/attrs";
import { cn } from "@/lib/utils";
import type { Media as MediaDoc } from "@/payload-types";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

/**
 * Night opener for detail pages (UI/UX §12.3/§12.5), in the home hero's style:
 * the text rises in, and the right column shows the page's photo (bridge
 * mask, Concept label) or, without one, stage art built from its icon and a
 * few labels. `aside` (e.g. an apply card) takes precedence over both.
 */
export function DetailHero({
  locale,
  crumbs,
  eyebrow,
  title,
  lead,
  children,
  aside,
  media,
  icon,
  chips,
  facts,
  edit,
}: {
  locale: Locale;
  crumbs: Crumb[];
  eyebrow?: string | null;
  title: string;
  lead?: string | null;
  children?: React.ReactNode;
  aside?: React.ReactNode;
  /** A photo for the right column. */
  media?: MediaDoc | number | null;
  /** Without a photo: the icon for the stage art (null = the UB mark). */
  icon?: string | null;
  /** Floating labels around the stage art (first three are shown). */
  chips?: string[];
  /** Small facts under the text. */
  facts?: { icon?: string; label: string }[];
  /** Live editing: the document and the field names behind the title and lead. */
  edit?: { ref?: EditRef; title: string; lead?: string };
}) {
  const photo = media && typeof media === "object" && media.url ? media : null;
  const stage = icon !== undefined || !!chips?.length;
  const right = aside ? (
    aside
  ) : photo ? (
    <div className="inner-media relative aspect-[4/3] lg:aspect-[5/6]">
      <Media
        media={photo}
        priority
        sizes="(min-width: 1280px) 460px, (min-width: 1024px) 36vw, 100vw"
        className="bridge-mask absolute inset-0 rounded-xl border border-subtle shadow-4"
        imgClassName="scale-[1.02]"
        conceptPosition="right"
      />
      <div
        aria-hidden
        className="bridge-mask pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(180deg,transparent_55%,rgb(6_13_32/0.7))]"
      />
    </div>
  ) : stage ? (
    <div className="inner-media max-lg:hidden">
      <HeroStage icon={icon} chips={chips} />
    </div>
  ) : null;
  return (
    <section data-hero="night" className="night relative isolate overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 right-[-15%] size-[620px] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
        <div className="absolute -bottom-64 left-[-10%] size-[520px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--accent-spark)_14%,transparent),transparent)]" />
        <CircuitArt className="absolute inset-0 h-full w-full opacity-50 [mask-image:linear-gradient(90deg,transparent_45%,#000_85%)]" />
      </div>
      <div className="container-page pt-8 pb-20 lg:pb-28">
        <Breadcrumbs locale={locale} items={crumbs} />
        <div
          className={cn(
            "mt-12 grid grid-cols-[minmax(0,1fr)] gap-10",
            right
              ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center"
              : "lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-end",
          )}
        >
          <div>
            {eyebrow && (
              <p className="inner-rise eyebrow" style={{ "--i": 0 } as React.CSSProperties}>
                {eyebrow}
              </p>
            )}
            <h1
              className="inner-rise mt-4 text-display-xl"
              style={{ "--i": 1 } as React.CSSProperties}
              {...editable(edit?.ref, edit?.title ?? "", "accent", title)}
            >
              <AccentText text={title} />
            </h1>
            {lead && (
              <p
                className="inner-rise mt-6 max-w-2xl text-body-lg text-fg-secondary"
                style={{ "--i": 2 } as React.CSSProperties}
                {...(edit?.lead ? editable(edit.ref, edit.lead, "textarea", lead) : {})}
              >
                {lead}
              </p>
            )}
            {children && (
              <div className="inner-rise" style={{ "--i": 3 } as React.CSSProperties}>
                {children}
              </div>
            )}
            {facts && <FactChips facts={facts} />}
          </div>
          {right}
        </div>
      </div>
    </section>
  );
}
