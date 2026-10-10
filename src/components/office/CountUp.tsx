"use client";

import { useEffect, useRef } from "react";

/** A number that counts up once when it appears (instant with reduced motion). */
export function CountUp({
  value,
  format = "number",
}: {
  value: number;
  format?: "number" | "plain";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) =>
    format === "number"
      ? new Intl.NumberFormat("en-US").format(Math.round(n))
      : String(Math.round(n));
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || value === 0) return;
    let raf = 0;
    const start = performance.now();
    const dur = Math.min(1100, 400 + value * 6);
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      el.textContent = fmt(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formats are stable
  }, [value]);
  return <span ref={ref}>{fmt(value)}</span>;
}
