import { ArrowRight } from "lucide-react";
import { CircuitArt } from "@/components/brand/CircuitArt";
import { CircuitField } from "@/components/motion/CircuitField";
import { Monogram } from "@/components/brand/Monogram";
import { AccentText } from "@/components/ui/AccentText";
import { Button } from "@/components/ui/Button";
import { Media } from "@/components/ui/Media";
import type { Media as MediaDoc } from "@/payload-types";
import { HeroShowcase } from "./HeroShowcase";
import { localizePath } from "@/i18n/routing";
import { editable } from "@/lib/live-edit/attrs";
import { cn } from "@/lib/utils";
import type { BlockProps } from "./types";

/**
 * FR-HOME-01 hero. Complete without JavaScript (UI/UX §16): text, CTAs and
 * art are server-rendered; motion layers on later.
 */
export function HeroBlock({ block, locale, first, edit }: BlockProps<"hero">) {
  const night = block.mood !== "day";
  const Heading = first ? "h1" : "h2";
  const showcase = block.visual === "showcase";
  const hasMedia = Boolean(block.media && typeof block.media === "object");
  return (
    <section
      data-hero={first && night ? "night" : undefined}
      className={cn("relative isolate overflow-hidden", night && "night")}
      id={block.anchor ?? undefined}
    >
      {night && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 right-[-10%] size-[640px] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]" />
          <CircuitArt className="circuit-static absolute inset-0 h-full w-full opacity-70 [mask-image:linear-gradient(90deg,transparent_40%,#000_80%)] max-lg:[mask-image:linear-gradient(180deg,#000,transparent_45%)]" />
          {/* Living circuit (UI/UX §10.2) replaces the static art on capable desktops. */}
          {first && (
            <CircuitField className="circuit-live absolute inset-0 hidden h-full w-full [mask-image:linear-gradient(90deg,transparent_22%,#000_62%)] lg:block" />
          )}
        </div>
      )}
      <div className="container-page grid items-center gap-12 pt-10 pb-16 lg:min-h-[min(88svh,860px)] grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:py-28 short:lg:min-h-0 short:lg:py-14">
        <div className="relative">
          {block.eyebrow && (
            <p className="eyebrow" {...editable(edit, "eyebrow", "text", block.eyebrow)}>
              {block.eyebrow}
            </p>
          )}
          <Heading
            className={cn("mt-5", first ? "text-display-2xl" : "text-display-xl")}
            {...editable(edit, "title", "accent", block.title)}
          >
            <AccentText text={block.title} />
          </Heading>
          {block.lead && (
            <p
              className="mt-6 max-w-xl text-body-lg text-fg-secondary"
              {...editable(edit, "lead", "textarea", block.lead)}
            >
              {block.lead}
            </p>
          )}
          <div className="mt-9 flex flex-wrap gap-3">
            {block.primary?.label && block.primary.href && (
              <Button asChild size="lg" variant={night ? "spark" : "primary"}>
                <a href={localizePath(block.primary.href, locale)}>
                  <span {...editable(edit, "primary.label", "text", block.primary.label)}>
                    {block.primary.label}
                  </span>
                  <ArrowRight aria-hidden data-arrow />
                </a>
              </Button>
            )}
            {block.secondary?.label && block.secondary.href && (
              <Button
                asChild
                size="lg"
                variant="secondary"
                className={night ? "bg-transparent" : undefined}
              >
                <a href={localizePath(block.secondary.href, locale)}>
                  <span {...editable(edit, "secondary.label", "text", block.secondary.label)}>
                    {block.secondary.label}
                  </span>
                </a>
              </Button>
            )}
          </div>
        </div>
        {/* One image for every breakpoint: beside the text on desktop, below the buttons on
            phones. It is often the LCP element, so the first hero loads it eagerly (P1-1). */}
        <div
          className={cn(
            "relative lg:aspect-[5/6] short:lg:mx-auto short:lg:aspect-square short:lg:w-[min(100%,70svh)]",
            showcase ? "aspect-square" : hasMedia ? "aspect-[4/3]" : "hidden lg:block",
          )}
        >
          {showcase ? (
            <HeroShowcase locale={locale} />
          ) : hasMedia ? (
            <>
              <Media
                media={block.media as MediaDoc}
                editAttrs={editable(edit, "media", "image", (block.media as MediaDoc).id)}
                priority={first}
                sizes="(min-width: 1280px) 520px, (min-width: 1024px) 40vw, 100vw"
                className="bridge-mask absolute inset-0 rounded-xl border border-subtle shadow-4"
                imgClassName="scale-[1.02]"
                conceptPosition="right"
              />
              <div
                aria-hidden
                className="bridge-mask pointer-events-none absolute inset-0 rounded-xl bg-[linear-gradient(180deg,transparent_55%,rgb(6_13_32/0.75))]"
              />
            </>
          ) : (
            <div className="bridge-mask absolute inset-0 grid place-items-center rounded-xl border border-subtle bg-[linear-gradient(160deg,var(--accent-primary-soft),transparent_70%)]">
              <Monogram
                title={null}
                className="ub-hero-mark w-1/2 text-[var(--logo-blue)] drop-shadow-[0_0_40px_var(--glow)]"
              />
            </div>
          )}
          {block.chip && !showcase && (
            <p className="glass absolute bottom-8 left-0 max-lg:hidden -translate-x-6 rounded-full border border-subtle px-4 py-2 text-body-sm font-medium text-fg shadow-3">
              <span
                aria-hidden
                className="mr-2 inline-block size-2 rounded-full bg-spark align-middle"
              />
              {block.chip}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
