"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Each behaviour is its own chunk, fetched only when an element on the page asks
// for it with data-fx="…". Pages pay for this loader, not for every island a CMS
// block might render (ADR-007 budget, UI/UX audit v2).
const loaders = {
  circuit: () => import("@/lib/fx/circuit"),
  globe: () => import("@/lib/fx/globe"),
  tilt: () => import("@/lib/fx/tilt"),
  countup: () => import("@/lib/fx/countup"),
  spotlight: () => import("@/lib/fx/spotlight"),
  carousel: () => import("@/lib/fx/carousel"),
  officehours: () => import("@/lib/fx/officehours"),
  footeracc: () => import("@/lib/fx/footeracc"),
  liveedit: () => import("@/lib/fx/liveedit"),
} satisfies Record<
  string,
  () => Promise<{ attach: (el: HTMLElement) => (() => void) | undefined }>
>;

export type FxName = keyof typeof loaders;

/** Attaches progressive-enhancement behaviours to server-rendered markup. */
export function Fx() {
  const pathname = usePathname();
  useEffect(() => {
    let cancelled = false;
    const cleanups: (() => void)[] = [];
    for (const el of document.querySelectorAll<HTMLElement>("[data-fx]")) {
      const load = loaders[el.dataset.fx as FxName];
      if (!load) continue;
      void load()
        .then(({ attach }) => {
          if (cancelled || !el.isConnected) return;
          const cleanup = attach(el);
          if (cleanup) cleanups.push(cleanup);
        })
        // An effect that fails (chunk error, GPU, …) must never break the page:
        // the server-rendered markup underneath stays as it is.
        .catch((error: unknown) => console.warn(`[fx] ${el.dataset.fx} not started`, error));
    }
    return () => {
      cancelled = true;
      for (const c of cleanups) c();
    };
  }, [pathname]);
  return null;
}
