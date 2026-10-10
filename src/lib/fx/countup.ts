/**
 * Stat counter (UI/UX §11): counts up once when half visible. The final number
 * is server-rendered, so reduced motion, no-JS and crawlers see the real value.
 */
export function attach(el: HTMLElement) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const value = Number(el.dataset.value);
  if (!Number.isFinite(value)) return;
  const { prefix = "", suffix = "", locale = "en" } = el.dataset;
  const nf = new Intl.NumberFormat(locale === "rw" ? "en" : locale);
  const format = (n: number) => `${prefix}${nf.format(n)}${suffix}`;
  let frame = 0;
  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / 1200);
        el.textContent = format(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      el.textContent = format(0);
      frame = requestAnimationFrame(tick);
    },
    { threshold: 0.5 },
  );
  io.observe(el);
  return () => {
    io.disconnect();
    cancelAnimationFrame(frame);
    el.textContent = format(value);
  };
}
