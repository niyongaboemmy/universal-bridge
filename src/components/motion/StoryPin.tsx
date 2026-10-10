import type { ReactNode } from "react";

/**
 * UI/UX §10.3 "Ideas → Code → Impact" as a CSS-only pinned story
 * (IMPLEMENTATION-PLAN §7: sticky + view timelines, no GSAP). Each step is a
 * real section in reading order; on wide screens the visual column sticks and
 * cross-fades as each step scrolls through. Mobile and reduced motion: stacked.
 */
export function StoryPin({
  steps,
}: {
  steps: { id: string; eyebrow: string; title: string; body?: string | null; visual: ReactNode }[];
}) {
  return (
    <div className="story grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-28">
      <ol className="story__steps min-w-0 space-y-10 lg:space-y-0">
        {steps.map((s, i) => (
          <li
            key={s.id}
            className="story__step lg:flex lg:min-h-[55vh] lg:items-center"
            style={{ "--n": i } as React.CSSProperties}
          >
            <div>
              <p className="eyebrow">{s.eyebrow}</p>
              <h3 className="mt-4 text-display-lg">{s.title}</h3>
              {s.body && <p className="mt-5 max-w-md text-body-lg text-fg-secondary">{s.body}</p>}
              <div aria-hidden className="mt-8 overflow-hidden lg:hidden">
                {s.visual}
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div aria-hidden className="hidden lg:block">
        <div data-fx="tilt" className="story__stage sticky top-[18vh] aspect-[4/3]">
          {/* Progress rail: a line that fills as the story scrolls, with 1 · 2 · 3 on it. */}
          <div className="absolute top-1/2 -left-14 flex h-40 -translate-y-1/2 flex-col items-center justify-between">
            {/* Lines are <i>, dots are <span>: dot animations match by span order. */}
            <i className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 bg-[var(--border-strong)]" />
            <i className="story__progress absolute top-3 bottom-3 left-1/2 w-px origin-top -translate-x-1/2 bg-spark" />
            {steps.map((s, i) => (
              <span
                key={s.id}
                className="story__dot relative z-10 grid size-7 place-items-center rounded-full border border-strong bg-[var(--bg-canvas)] font-mono text-[0.7rem] text-fg-muted"
              >
                {i + 1}
              </span>
            ))}
          </div>
          {/* Pointer tilt (lib/fx/tilt sets --px/--py on the stage). */}
          <div className="story__tilt absolute inset-0">
            {steps.map((s, i) => (
              <div
                key={s.id}
                className="story__visual absolute inset-0"
                style={{ "--n": i } as React.CSSProperties}
              >
                {s.visual}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
