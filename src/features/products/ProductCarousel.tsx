"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const INTERVAL = 6000;

/**
 * The hero's product stage: one slide per product, logo tabs below with a
 * progress line. Advances every 6 s; pauses on hover, keyboard focus or the pause
 * button (WCAG 2.2.2). Under reduced motion it starts
 * paused, on the first product. Slides are server-rendered children.
 */
export function ProductCarousel({
  tabs,
  slides,
  labels,
}: {
  tabs: { key: string; name: string; logo: ReactNode }[];
  slides: ReactNode[];
  labels: { products: string; pause: string; play: string };
}) {
  const id = useId();
  const [active, setActive] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [hover, setHover] = useState(false);
  const [calm, setCalm] = useState(true);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const n = tabs.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Lite mode (phones by default) still rotates: it is a cheap cross-fade, and the
    // carousel is how phones see every product. Reduced motion stays put.
    const read = () => setCalm(mq.matches);
    read();
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);

  const paused = stopped || hover || calm || n < 2;
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => setActive((a) => (a + 1) % n), INTERVAL);
    return () => window.clearTimeout(timer);
  }, [paused, active, n]);

  function onKey(e: React.KeyboardEvent, i: number) {
    const next =
      e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setHover(false)}
    >
      <div className="absolute inset-x-0 top-0 bottom-[15%]">
        {slides.map((slide, i) => (
          <div
            key={tabs[i]!.key}
            id={`${id}-p${i}`}
            role="tabpanel"
            aria-labelledby={`${id}-t${i}`}
            data-active={i === active || undefined}
            inert={i !== active}
            className="pc-slide absolute inset-0"
          >
            {slide}
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2">
        {n > 1 && (
          <button
            type="button"
            onClick={() => setStopped((s) => !s)}
            aria-label={stopped ? labels.play : labels.pause}
            aria-pressed={stopped}
            className="grid size-[3.25rem] shrink-0 place-items-center rounded-full border border-subtle bg-[color-mix(in_oklab,var(--bg-surface)_70%,transparent)] text-fg-secondary backdrop-blur-md transition-colors hover:text-fg"
          >
            {stopped ? (
              <Play aria-hidden className="size-4" />
            ) : (
              <Pause aria-hidden className="size-4" />
            )}
          </button>
        )}
        <div
          role="tablist"
          aria-label={labels.products}
          className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto rounded-full border border-subtle bg-[color-mix(in_oklab,var(--bg-surface)_70%,transparent)] p-1.5 backdrop-blur-md [scrollbar-width:none]"
        >
          {tabs.map((tab, i) => (
            <button
              key={tab.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`${id}-t${i}`}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls={`${id}-p${i}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                "relative flex h-10 shrink-0 items-center gap-2 overflow-hidden rounded-full pr-3 pl-1.5 text-[0.82rem] font-semibold whitespace-nowrap transition-colors duration-300",
                i === active ? "bg-surface text-fg shadow-2" : "text-fg-secondary hover:text-fg",
                i !== active && "max-sm:pr-1.5",
              )}
            >
              <span className="size-7 shrink-0 text-[1.1rem]">{tab.logo}</span>
              <span className={cn(i !== active && "max-sm:sr-only")}>{tab.name}</span>
              {i === active && (
                <span
                  key={`${active}-${paused}`}
                  aria-hidden
                  data-paused={paused || undefined}
                  className="pc-progress absolute inset-x-3 bottom-0.5 h-0.5 origin-left rounded-full bg-spark"
                  style={{ "--pc-dur": `${INTERVAL}ms` } as React.CSSProperties}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
