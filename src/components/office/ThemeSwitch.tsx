"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark" | "system";
const MODES: { mode: Mode; label: string; icon: typeof Sun }[] = [
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon },
  { mode: "system", label: "System", icon: Monitor },
];

function apply(mode: Mode) {
  const dark =
    mode === "dark" || (mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  const root = document.documentElement;
  root.dataset.theme = dark ? "dark" : "light";
  root.style.colorScheme = dark ? "dark" : "light";
}

/** Light / dark / system for the staff app; shares the website's stored choice. */
export function ThemeSwitch() {
  const [mode, setMode] = useState<Mode>("system");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as Mode | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read the stored choice after hydration
      if (stored === "light" || stored === "dark" || stored === "system") setMode(stored);
    } catch {
      /* private mode */
    }
  }, []);
  useEffect(() => {
    if (mode !== "system") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);
  const choose = (m: Mode) => {
    setMode(m);
    try {
      localStorage.setItem("theme", m);
    } catch {
      /* private mode */
    }
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches)
      doc.startViewTransition(() => apply(m));
    else apply(m);
  };
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="flex rounded-full border border-subtle bg-surface p-0.5"
    >
      {MODES.map(({ mode: m, label, icon: Icon }) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          aria-label={label}
          title={label}
          onClick={() => choose(m)}
          className={cn(
            "grid size-7 place-items-center rounded-full text-fg-muted transition-colors hover:text-fg",
            mode === m && "bg-accent text-on-accent hover:text-on-accent",
          )}
        >
          <Icon className="size-3.5" aria-hidden />
        </button>
      ))}
    </div>
  );
}
