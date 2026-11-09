"use client";

import { Laptop, Monitor, Terminal } from "lucide-react";
import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { OS_EVENT } from "./DownloadPanel";
import type { OsFamily } from "./platforms";
import { useDetection } from "./use-detection";

const ORDER: OsFamily[] = ["mac", "windows", "linux"];
const ICON = { mac: Laptop, windows: Monitor, linux: Terminal } as const;

/**
 * Install steps per system as tabs (WAI-ARIA tabs, arrow keys move). Opens on
 * the visitor's system and follows the one picked in the download panel. The
 * steps themselves are server-rendered and passed in.
 */
export function InstallGuide({
  labels,
  panels,
}: {
  labels: Record<OsFamily, string>;
  panels: Record<OsFamily, ReactNode>;
}) {
  const id = useId();
  const detected = useDetection();
  const [picked, setPicked] = useState<OsFamily | null>(null);
  const os = picked ?? (detected?.os && detected.os !== "mobile" ? detected.os : "mac");

  useEffect(() => {
    const follow = (e: Event) => setPicked((e as CustomEvent<OsFamily>).detail);
    window.addEventListener(OS_EVENT, follow);
    return () => window.removeEventListener(OS_EVENT, follow);
  }, []);

  const select = (next: OsFamily, focus = false) => {
    setPicked(next);
    if (focus) document.getElementById(`${id}-tab-${next}`)?.focus();
  };
  const onKey = (e: KeyboardEvent) => {
    const i = ORDER.indexOf(os);
    const next =
      e.key === "ArrowRight"
        ? ORDER[(i + 1) % ORDER.length]
        : e.key === "ArrowLeft"
          ? ORDER[(i + ORDER.length - 1) % ORDER.length]
          : e.key === "Home"
            ? ORDER[0]
            : e.key === "End"
              ? ORDER[ORDER.length - 1]
              : null;
    if (!next) return;
    e.preventDefault();
    select(next, true);
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label={labels[os]}
        onKeyDown={onKey}
        className="inline-flex rounded-full border border-subtle bg-surface p-1"
      >
        {ORDER.map((o) => {
          const Icon = ICON[o];
          return (
            <button
              key={o}
              id={`${id}-tab-${o}`}
              type="button"
              role="tab"
              aria-selected={o === os}
              aria-controls={`${id}-panel-${o}`}
              tabIndex={o === os ? 0 : -1}
              onClick={() => select(o)}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-body-sm font-medium transition-[background-color,color] duration-[var(--dur-fast)]",
                o === os ? "bg-accent text-on-accent" : "text-fg-secondary hover:text-fg",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {labels[o]}
            </button>
          );
        })}
      </div>
      {ORDER.map((o) => (
        <div
          key={o}
          id={`${id}-panel-${o}`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${o}`}
          hidden={o !== os}
          className="mt-10"
        >
          {panels[o]}
        </div>
      ))}
    </div>
  );
}
