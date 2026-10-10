"use client";

import { Search } from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import type { PaletteCopy, PaletteProps } from "./Palette";

/**
 * FR-GL-08 ⌘K. This trigger is tiny; the palette, its index and MiniSearch
 * load on first open (ADR-005), so they cost nothing on page load.
 */
export function SearchTrigger({
  locale,
  copy,
  email,
  className,
}: {
  locale: string;
  copy: PaletteCopy;
  email: string;
  className?: string;
}) {
  const [Palette, setPalette] = useState<ComponentType<PaletteProps> | null>(null);
  const [open, setOpen] = useState(false);

  async function show() {
    if (!Palette) {
      const mod = await import("./Palette");
      setPalette(() => mod.Palette);
    }
    setOpen(true);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        void show();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <button
        type="button"
        onClick={() => void show()}
        aria-label={copy.open}
        aria-keyshortcuts="Meta+K Control+K"
        className={`inline-flex size-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-accent-soft hover:text-accent ${className ?? ""}`}
      >
        <Search aria-hidden className="size-5" />
      </button>
      {Palette && (
        <Palette
          open={open}
          onClose={() => setOpen(false)}
          locale={locale}
          copy={copy}
          email={email}
        />
      )}
    </>
  );
}
