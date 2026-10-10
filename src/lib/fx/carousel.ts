/**
 * Home services carousel (blocks/ServicePairs): marks the active slide and tab,
 * wires the arrows and counter, and auto-advances. The dwell timer is the CSS
 * ring animation itself: it pauses on hover, off screen and when paused, and
 * its animationend moves to the next slide. Any manual navigation pauses
 * auto-advance (WCAG 2.2.2); reduced motion and lite mode (phones, slow links)
 * start paused: swiping, the arrows and the play button still work.
 */
export function attach(root: HTMLElement) {
  const track = root.querySelector<HTMLElement>(".svc-pairs__track");
  const ring = root.querySelector<SVGElement>(".svc-pairs__ring");
  const toggle = root.querySelector<HTMLButtonElement>("[data-toggle]");
  const count = root.querySelector<HTMLElement>("[data-count]");
  if (!track || !ring || !toggle) return;
  const slides = [...track.querySelectorAll<HTMLElement>(":scope > section")];
  const tabs = [...root.querySelectorAll<HTMLAnchorElement>("nav a")];
  if (slides.length < 2) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const offset = (i: number) => slides[i]!.offsetLeft - slides[0]!.offsetLeft;
  let active = -1;

  const restartRing = () => {
    ring.style.animation = "none";
    void ring.getBoundingClientRect();
    ring.style.animation = "";
  };
  const setPaused = (paused: boolean) => {
    root.toggleAttribute("data-paused", paused);
    toggle.setAttribute(
      "aria-label",
      (paused ? toggle.dataset.labelPlay : toggle.dataset.labelPause) ?? "",
    );
    if (!paused) restartRing();
  };
  const go = (i: number) => {
    const n = (i + slides.length) % slides.length;
    track.scrollTo({ left: offset(n), behavior: reduced ? "auto" : "smooth" });
  };
  const sync = () => {
    const x = track.scrollLeft;
    let next = 0;
    for (let i = 1; i < slides.length; i++)
      if (Math.abs(offset(i) - x) < Math.abs(offset(next) - x)) next = i;
    if (next === active) return;
    active = next;
    slides.forEach((s, i) => s.toggleAttribute("data-active", i === next));
    tabs.forEach((t, i) => t.setAttribute("aria-current", String(i === next)));
    if (count) count.textContent = String(next + 1).padStart(2, "0");
    restartRing();
  };
  const manual = (i: number) => {
    setPaused(true);
    go(i);
  };

  let raf = 0;
  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(sync);
  };
  const onTab = (e: Event) => {
    const i = tabs.indexOf(e.currentTarget as HTMLAnchorElement);
    if (i < 0) return;
    e.preventDefault(); // scroll the track only, not the page
    manual(i);
  };
  const onArrow = (e: Event) => {
    const dir = (e.currentTarget as HTMLElement).dataset.dir;
    manual(active + (dir === "prev" ? -1 : 1));
  };
  const onToggle = () => setPaused(!root.hasAttribute("data-paused"));
  const onRingEnd = () => {
    if (!root.hasAttribute("data-paused")) go(active + 1);
  };
  const onSwipe = () => setPaused(true);
  const onWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) setPaused(true); // sideways only; page scrolling passes through
  };

  const io = new IntersectionObserver(
    ([entry]) => root.toggleAttribute("data-offscreen", !entry?.isIntersecting),
    { threshold: 0.35 },
  );
  io.observe(root);

  const arrows = [...root.querySelectorAll<HTMLButtonElement>("[data-dir]")];
  track.addEventListener("scroll", onScroll, { passive: true });
  track.addEventListener("pointerdown", onSwipe, { passive: true });
  track.addEventListener("wheel", onWheel, { passive: true });
  tabs.forEach((t) => t.addEventListener("click", onTab));
  arrows.forEach((a) => a.addEventListener("click", onArrow));
  toggle.addEventListener("click", onToggle);
  ring.addEventListener("animationend", onRingEnd);

  sync();
  setPaused(reduced || document.documentElement.dataset.lite === "on");
  root.setAttribute("data-ready", "");

  return () => {
    cancelAnimationFrame(raf);
    io.disconnect();
    track.removeEventListener("scroll", onScroll);
    track.removeEventListener("pointerdown", onSwipe);
    track.removeEventListener("wheel", onWheel);
    tabs.forEach((t) => t.removeEventListener("click", onTab));
    arrows.forEach((a) => a.removeEventListener("click", onArrow));
    toggle.removeEventListener("click", onToggle);
    ring.removeEventListener("animationend", onRingEnd);
    root.removeAttribute("data-ready");
  };
}
