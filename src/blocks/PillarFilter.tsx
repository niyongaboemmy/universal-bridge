"use client";

import { useState, type ReactNode } from "react";
import { cx as cn } from "@/lib/cx";

/**
 * FR-SRV-01 pillar switcher (segmented control). Cards stay server-rendered;
 * filtering toggles a data attribute, animated with a View Transition where
 * supported. Without JS every service is simply shown.
 */
export function PillarFilter({
  options,
  label,
  children,
}: {
  options: { value: string; label: string }[];
  label: string;
  children: ReactNode;
}) {
  const [active, setActive] = useState("all");
  const all = [{ value: "all", label }, ...options];
  function select(value: string) {
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (doc.startViewTransition && !reduce) doc.startViewTransition(() => setActive(value));
    else setActive(value);
  }
  return (
    <div data-pillar-filter={active}>
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-10 inline-flex flex-wrap gap-1 rounded-md border border-subtle bg-surface p-1"
      >
        {all.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active === o.value}
            onClick={() => select(o.value)}
            className={cn(
              "min-h-11 rounded-sm px-4 text-body-sm font-medium transition-colors duration-[var(--dur-fast)]",
              active === o.value ? "bg-accent text-on-accent" : "text-fg-secondary hover:text-fg",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
