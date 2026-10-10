/**
 * Footer office hours: "Open now · 14:32 in Kigali". Hours follow the footer
 * copy (Mon–Fri, 8:00–17:00, Africa/Kigali). Hidden until this runs.
 */
const OPEN_FROM = 8;
const OPEN_UNTIL = 17;

export function attach(el: HTMLElement) {
  const status = el.querySelector<HTMLElement>("[data-status]");
  const time = el.querySelector<HTMLElement>("[data-time]");
  if (!status || !time) return;
  const zone = "Africa/Kigali";
  const clock = new Intl.DateTimeFormat(document.documentElement.lang || "en", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  });
  const tick = () => {
    const now = new Date();
    const p = Object.fromEntries(parts.formatToParts(now).map((x) => [x.type, x.value]));
    const hour = Number(p.hour);
    const open =
      p.weekday !== "Sat" && p.weekday !== "Sun" && hour >= OPEN_FROM && hour < OPEN_UNTIL;
    el.toggleAttribute("data-open", open);
    status.textContent = (open ? el.dataset.labelOpen : el.dataset.labelClosed) ?? "";
    time.textContent = clock.format(now);
  };
  tick();
  el.setAttribute("data-ready", "");
  const id = window.setInterval(tick, 30_000);
  return () => window.clearInterval(id);
}
