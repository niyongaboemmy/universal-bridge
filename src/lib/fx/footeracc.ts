/**
 * Footer link groups: collapsed accordions on phones, open columns from the
 * sm breakpoint up (the summary cannot close them there). Server markup is
 * open, so without JavaScript every link stays visible.
 */
export function attach(el: HTMLElement) {
  if (!(el instanceof HTMLDetailsElement)) return;
  const phone = matchMedia("(max-width: 639px)");
  const apply = () => {
    el.open = !phone.matches;
  };
  const onToggle = () => {
    if (!phone.matches && !el.open) el.open = true;
  };
  apply();
  phone.addEventListener("change", apply);
  el.addEventListener("toggle", onToggle);
  return () => {
    phone.removeEventListener("change", apply);
    el.removeEventListener("toggle", onToggle);
  };
}
