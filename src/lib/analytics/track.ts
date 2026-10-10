/**
 * First-party page views for the Company dashboard. Loaded only after the
 * visitor accepts analytics (CookieConsent). No cookies: a session id lives in
 * sessionStorage for 30 minutes of inactivity; the server derives a daily,
 * non-reversible visitor hash. Client-side navigations are counted too.
 */
const SESSION_KEY = "ub-sid";
const SESSION_MS = 30 * 60 * 1000;

function sessionId() {
  try {
    const [id, at] = (sessionStorage.getItem(SESSION_KEY) ?? "").split(":");
    const fresh =
      id && Date.now() - Number(at) < SESSION_MS ? id : crypto.randomUUID().slice(0, 12);
    sessionStorage.setItem(SESSION_KEY, `${fresh}:${Date.now()}`);
    return fresh;
  } catch {
    return "";
  }
}

let last = "";
function send() {
  const key = location.pathname + location.search;
  if (key === last) return;
  last = key;
  const body = JSON.stringify({
    p: location.pathname,
    q: location.search,
    r: document.referrer,
    l: document.documentElement.lang,
    s: sessionId(),
  });
  if (!navigator.sendBeacon?.("/api/collect", new Blob([body], { type: "application/json" }))) {
    void fetch("/api/collect", {
      method: "POST",
      body,
      keepalive: true,
      headers: { "content-type": "application/json" },
    });
  }
}

export function startTracking() {
  const w = window as Window & { __ubTracking?: boolean };
  if (w.__ubTracking) return;
  w.__ubTracking = true;
  send();
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method].bind(history);
    history[method] = (...args: Parameters<History["pushState"]>) => {
      original(...args);
      setTimeout(send, 0);
    };
  }
  addEventListener("popstate", () => setTimeout(send, 0));
}

function loadPlausible(domain: string) {
  if (document.querySelector("script[data-plausible]")) return;
  const s = document.createElement("script");
  s.defer = true;
  s.dataset.domain = domain;
  s.dataset.plausible = "";
  s.src = "https://plausible.io/js/script.outbound-links.js";
  document.head.appendChild(s);
}

/** Everything analytics, started once the visitor has accepted it (PRV-04). */
export function startAnalytics(plausibleDomain?: string) {
  if (plausibleDomain) loadPlausible(plausibleDomain);
  startTracking();
}
