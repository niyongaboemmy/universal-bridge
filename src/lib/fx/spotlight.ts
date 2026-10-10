/** Soft light follows the pointer inside the card (UI/UX §17.6). Mouse only. */
export function attach(el: HTMLElement) {
  let frame = 0;
  const onMove = (e: Event) => {
    const { pointerType, clientX, clientY } = e as PointerEvent;
    if (pointerType !== "mouse") return;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${clientX - r.left}px`);
      el.style.setProperty("--y", `${clientY - r.top}px`);
    });
  };
  el.addEventListener("pointermove", onMove, { passive: true });
  return () => {
    cancelAnimationFrame(frame);
    el.removeEventListener("pointermove", onMove);
  };
}
