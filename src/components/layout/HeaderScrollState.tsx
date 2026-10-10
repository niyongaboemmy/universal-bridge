"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * FR-GL-01 behaviour: marks the header as scrolled after 24 px and hides it
 * while scrolling down fast; any upward scroll brings it back. Re-evaluated on
 * every route change (client navigations don't scroll). Writes data attributes
 * only, so the header stays a Server Component.
 */
export function HeaderScrollState({ targetId }: { targetId: string }) {
  const pathname = usePathname();
  useEffect(() => {
    const header = document.getElementById(targetId);
    if (!header) return;
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      header.dataset.scrolled = String(y > 24);
      const delta = y - lastY;
      if (y < 400 || delta < -4) header.dataset.hidden = "false";
      else if (delta > 12) header.dataset.hidden = "true";
      lastY = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    // Once more after the new page has painted (images, fonts, scroll restoration).
    const settle = requestAnimationFrame(() => requestAnimationFrame(update));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId, pathname]);
  return null;
}
