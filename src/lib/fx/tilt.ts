/**
 * Pointer parallax for the hero showcase: writes --px/--py (-1…1); layers move
 * by their own --depth in CSS. Mouse only, never under reduced motion.
 */
export function attach(el: HTMLElement) {
  if (!matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
  let raf = 0;
  const set = (x: number, y: number) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    });
  };
  const onMove = (e: Event) => {
    const { clientX, clientY } = e as PointerEvent;
    const r = el.getBoundingClientRect();
    set(((clientX - r.left) / r.width) * 2 - 1, ((clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => set(0, 0);
  // The whole hero reacts, so the composite responds as the pointer approaches.
  const zone = el.closest("section") ?? el;
  zone.addEventListener("pointermove", onMove, { passive: true });
  zone.addEventListener("pointerleave", onLeave);
  return () => {
    cancelAnimationFrame(raf);
    zone.removeEventListener("pointermove", onMove);
    zone.removeEventListener("pointerleave", onLeave);
  };
}
