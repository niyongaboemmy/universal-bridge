import { ArrowRight, Check, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Monogram } from "@/components/brand/Monogram";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/*
 * Shared building blocks for inner pages (services, sectors, labs, products,
 * programs, company pages), so every page carries the home page's language:
 * stage art in the opener, spotlight cards, a traced process and the CTA band.
 * Server components; motion is CSS only (globals.css "inner-*") and stops for
 * reduced motion, Lite mode and phones.
 */

/**
 * Opener art when a page has no photo: the page's icon on a glowing tile,
 * orbited by circuit rings and a few floating labels (what this page offers).
 */
export function HeroStage({ icon, chips = [] }: { icon?: string | null; chips?: string[] }) {
  const shown = chips.filter(Boolean).slice(0, 3);
  return (
    <div aria-hidden className="inner-stage relative mx-auto aspect-square w-full max-w-[440px]">
      <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)] opacity-80" />
      {[0, 1, 2].map((r) => (
        <div
          key={r}
          className={cn(
            "inner-stage__ring absolute rounded-full border border-dashed border-[color-mix(in_oklab,var(--accent-primary)_40%,transparent)]",
            r === 1 && "inner-stage__ring--rev",
          )}
          style={{ inset: `${8 + r * 13}%`, "--r": r } as React.CSSProperties}
        >
          <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full border-2 border-[var(--accent-primary)] bg-canvas" />
          {r === 1 && (
            <span className="absolute top-1/2 -right-1.5 size-3 -translate-y-1/2 rounded-full bg-spark shadow-[0_0_14px_var(--accent-spark)]" />
          )}
        </div>
      ))}
      <div className="absolute inset-[34%] grid place-items-center rounded-[28%] border border-[color-mix(in_oklab,var(--accent-primary)_55%,transparent)] bg-[linear-gradient(150deg,var(--ub-blue-600,#0145b8),var(--ub-navy-900,#0a1633))] text-white shadow-[0_24px_60px_-20px_var(--glow)]">
        {icon ? (
          <Icon name={icon} strokeWidth={1.4} className="size-[42%]" />
        ) : (
          <Monogram title={null} className="w-[56%] text-white" />
        )}
      </div>
      {shown.map((c, i) => (
        <span
          key={c}
          className={cn(
            "inner-stage__chip glass absolute flex max-w-[60%] items-center gap-2 rounded-full border border-subtle px-3.5 py-2 text-body-sm font-medium text-fg shadow-3",
            i === 0 && "top-[10%] left-0",
            i === 1 && "top-[46%] right-0",
            i === 2 && "bottom-[8%] left-[8%]",
          )}
          style={{ "--i": i } as React.CSSProperties}
        >
          <span
            className={cn("size-2 shrink-0 rounded-full", i === 1 ? "bg-spark" : "bg-success")}
          />
          <span className="truncate">{c}</span>
        </span>
      ))}
    </div>
  );
}

/** Small facts under an opener's title: "Two-week sprints", "UTC+2" … */
export function FactChips({ facts }: { facts: { icon?: string; label: string }[] }) {
  if (!facts.length) return null;
  return (
    <ul className="mt-8 flex flex-wrap gap-2">
      {facts.map((f, i) => (
        <li
          key={f.label}
          className="inner-rise inline-flex min-h-9 items-center gap-2 rounded-full border border-subtle bg-[color-mix(in_oklab,var(--bg-surface)_70%,transparent)] px-3.5 text-body-sm text-fg-secondary"
          style={{ "--i": i + 3 } as React.CSSProperties}
        >
          {f.icon && <Icon name={f.icon} className="size-4 text-accent" />}
          {f.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Numbered spotlight cards (deliverables, focus areas, features, values). The
 * number and icon warm to spark on hover; cards rise in as they scroll into view.
 */
export function FeatureGrid({
  items,
  columns = 3,
  numbered = true,
  className,
}: {
  items: {
    id?: string | null;
    title: string;
    body?: string | null;
    icon?: string | null;
    /** Makes the whole card a link. */
    href?: string;
    /** Live editing attributes for the title / body (lib/live-edit). */
    titleAttrs?: Record<string, string>;
    bodyAttrs?: Record<string, string>;
  }[];
  columns?: 2 | 3 | 4;
  numbered?: boolean;
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <ul
      className={cn(
        "grid gap-4 sm:grid-cols-2",
        columns === 3 && "lg:grid-cols-3",
        columns === 4 && "lg:grid-cols-4",
        className,
      )}
    >
      {items.map((it, i) => (
        <li key={it.id ?? i} className="reveal">
          <SpotlightCard className="inner-card group h-full rounded-2xl border border-subtle bg-surface p-6 transition-[translate,border-color,box-shadow] duration-300 ease-standard hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--accent-spark)_45%,var(--border-subtle))] hover:shadow-3">
            <div className="flex items-start justify-between gap-4">
              <span className="flex size-11 items-center justify-center rounded-xl border border-subtle text-accent transition-[background-color,color,border-color,rotate] duration-300 group-hover:-rotate-6 group-hover:border-transparent group-hover:bg-spark group-hover:text-on-spark [&_svg]:size-5">
                {it.icon ? <Icon name={it.icon} strokeWidth={1.6} /> : <Check aria-hidden />}
              </span>
              {numbered && (
                <span
                  aria-hidden
                  className="font-mono text-[0.72rem] tracking-[0.16em] text-fg-muted"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              )}
            </div>
            <h3 className="mt-6 font-display text-[1.125rem] leading-snug font-semibold text-fg">
              <span {...it.titleAttrs}>
                {it.href ? (
                  <a
                    href={it.href}
                    className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:outline-2 focus-visible:after:outline-focus"
                  >
                    {it.title}
                  </a>
                ) : (
                  it.title
                )}
              </span>
            </h3>
            {it.body && (
              <p className="mt-2 text-body-sm text-fg-secondary" {...it.bodyAttrs}>
                {it.body}
              </p>
            )}
          </SpotlightCard>
        </li>
      ))}
    </ul>
  );
}

/** A process on one glowing trace: numbered nodes, a pulse travelling along it. */
export function StepTrack({
  steps,
  stepLabel,
}: {
  steps: {
    id?: string | null;
    title: string;
    body?: string | null;
    titleAttrs?: Record<string, string>;
    bodyAttrs?: Record<string, string>;
  }[];
  stepLabel?: (n: number) => string;
}) {
  if (!steps.length) return null;
  const cols = Math.min(steps.length, 5);
  return (
    <ol
      className={cn(
        "inner-track relative grid gap-8 md:gap-5",
        cols === 2 && "md:grid-cols-2",
        cols === 3 && "md:grid-cols-3",
        cols === 4 && "md:grid-cols-4",
        cols === 5 && "md:grid-cols-5",
      )}
    >
      <span
        aria-hidden
        className="inner-track__line absolute top-5 bottom-5 left-5 w-px md:top-5 md:right-0 md:bottom-auto md:left-0 md:h-px md:w-auto"
      />
      {steps.map((s, i) => (
        <li key={s.id ?? i} className="reveal relative flex gap-5 md:block">
          <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-canvas font-mono text-body-sm font-medium text-accent shadow-[0_0_0_6px_var(--bg-canvas)]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="md:mt-6 md:pr-2">
            {stepLabel && (
              <p className="font-mono text-[0.72rem] tracking-[0.16em] text-spark-text uppercase">
                {stepLabel(i + 1)}
              </p>
            )}
            <h3 className="mt-1 font-display text-heading-md" {...s.titleAttrs}>
              {s.title}
            </h3>
            {s.body && (
              <p className="mt-2 text-body-sm text-fg-secondary" {...s.bodyAttrs}>
                {s.body}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Challenge → answer: what goes wrong today on the left, how we fix it on the
 * right, joined by a bridge trace on wide screens.
 */
export function BridgeCompare({
  problemsTitle,
  problems,
  answersTitle,
  answers,
}: {
  problemsTitle: string;
  problems: { id?: string | null; text: string }[];
  answersTitle: string;
  answers: { id?: string | null; title: string; body?: string | null }[];
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_80px_minmax(0,1fr)] lg:gap-0">
      <div>
        <h2 className="font-display text-heading-lg">{problemsTitle}</h2>
        <ul className="mt-6 space-y-3">
          {problems.map((p, i) => (
            <li
              key={p.id ?? i}
              className="reveal flex items-start gap-3 rounded-xl border border-subtle bg-surface p-4"
            >
              <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-spark-text" />
              <span>{p.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div aria-hidden className="relative hidden lg:block">
        <svg
          viewBox="0 0 80 400"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d="M0 120 C 40 120, 40 200, 80 200"
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
          <path
            className="inner-bridge__pulse"
            d="M0 120 C 40 120, 40 200, 80 200"
            pathLength={100}
            fill="none"
            stroke="var(--accent-spark)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="absolute top-1/2 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-subtle bg-surface text-accent shadow-2">
          <ArrowRight className="size-4" />
        </span>
      </div>
      <div>
        <h2 className="font-display text-heading-lg">{answersTitle}</h2>
        <ul className="mt-6 space-y-3">
          {answers.map((a, i) => (
            <li
              key={a.id ?? i}
              className="reveal flex items-start gap-3 rounded-xl border border-[color-mix(in_oklab,var(--accent-primary)_35%,var(--border-subtle))] bg-[linear-gradient(120deg,var(--accent-primary-soft),transparent_70%)] p-4"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                <Check aria-hidden className="size-3.5" />
              </span>
              <span>
                <strong className="block font-semibold text-fg">{a.title}</strong>
                {a.body && <span className="mt-1 block text-fg-secondary">{a.body}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Section wrapper for inner pages: optional sunken band and a header row. */
export function InnerSection({
  title,
  eyebrow,
  lead,
  sunken,
  night,
  className,
  children,
  action,
}: {
  title?: string;
  eyebrow?: string;
  lead?: string | null;
  sunken?: boolean;
  night?: boolean;
  className?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className={cn("section relative", sunken && "bg-sunken", night && "night", className)}>
      <div className="container-page">
        {(title || eyebrow) && (
          <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              {title && <h2 className="mt-4 text-display-lg">{title}</h2>}
              {lead && <p className="mt-5 max-w-xl text-body-lg text-fg-secondary">{lead}</p>}
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
