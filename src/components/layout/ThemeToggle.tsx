"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cx as cn } from "@/lib/cx";

const subscribe = () => () => {};

/**
 * FR-GL-06 theme toggle: a "Dark theme" toggle button (aria-pressed). Uses a
 * circular View Transition from the button when supported (UI/UX §11), plain
 * swap otherwise. The icon is chosen by CSS from <html data-theme>, which is
 * set before first paint, so it is right before hydration too.
 */
export function ThemeToggle({ label, className }: { label: string; className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const isDark = resolvedTheme === "dark";

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next = isDark ? "light" : "dark";
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
    };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduce) {
      setTheme(next);
      return;
    }
    const x = event.clientX || window.innerWidth;
    const y = event.clientY || 0;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const root = document.documentElement;
    // Turns off the default cross-fade so only the circular reveal runs (globals.css).
    root.dataset.themeSwitching = "";
    const transition = doc.startViewTransition(() => setTheme(next));
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        {
          duration: 450,
          easing: "cubic-bezier(.2,0,0,1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
    transition.finished.finally(() => delete root.dataset.themeSwitching);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={mounted ? isDark : undefined}
      title={label}
      className={cn(
        "relative inline-flex size-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-accent-soft hover:text-accent",
        className,
      )}
    >
      <Sun
        aria-hidden
        className="size-5 scale-100 rotate-0 transition-all duration-300 theme-dark:scale-0 theme-dark:-rotate-90 theme-dark:opacity-0"
      />
      <Moon
        aria-hidden
        className="absolute size-5 scale-0 rotate-90 opacity-0 transition-all duration-300 theme-dark:scale-100 theme-dark:rotate-0 theme-dark:opacity-100"
      />
    </button>
  );
}
