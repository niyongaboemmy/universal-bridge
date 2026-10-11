/**
 * First-party page views for the Company dashboard. Loaded only after the
 * visitor accepts analytics (CookieConsent). No cookies: a session id lives in
 * sessionStorage for 30 minutes of inactivity; the server derives a daily,
 * non-reversible visitor hash. Client-side navigations are counted too. While the
 * page is open and visible, a ping every 30 s tells the office who is on the site
 * now and how long visits last. The time zone (not the IP) gives the country.
 */
const SESSION_KEY = "ub-sid";
const SESSION_MS = 30 * 60 * 1000;
const PING_MS = 30_000;

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

function timeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return "";
  }
}

/**
 * Page views and pings go out with fetch (keepalive). sendBeacon is kept for the last
 * ping when the tab is hidden or closing, which is what it is for; for ordinary
 * requests it is less dependable (Safari has dropped beacon bodies).
 */
function post(data: Record<string, string>, leaving = false) {
  const body = JSON.stringify(data);
  if (
    leaving &&
    navigator.sendBeacon?.("/api/collect", new Blob([body], { type: "application/json" }))
  )
    return;
  void fetch("/api/collect", {
    method: "POST",
    body,
    keepalive: true,
    headers: { "content-type": "application/json" },
  }).catch(() => {});
}

let last = "";
function send() {
  const key = location.pathname + location.search;
  if (key === last) return;
  last = key;
  post({
    p: location.pathname,
    q: location.search,
    r: document.referrer,
    l: document.documentElement.lang,
    s: sessionId(),
    z: timeZone(),
  });
}

/** "Still here": refreshes the current view, no new page view. */
function ping(leaving = false) {
  post({ t: "ping", p: location.pathname, s: sessionId() }, leaving);
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
  setInterval(() => document.visibilityState === "visible" && ping(), PING_MS);
  // Leaving or switching tabs: one last ping so the visit's length is right.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") ping(true);
  });
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

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [disable: `ga-disable-${string}`]: boolean | undefined;
};

/**
 * Google Analytics 4 (gtag.js), the same snippet Google gives, loaded only after
 * consent. Analytics only: advertising storage, Google signals and ad
 * personalisation stay off. GA4's enhanced measurement counts client-side
 * navigations (history changes), so no manual page_view calls are needed.
 */
export function loadGoogleAnalytics(id: string) {
  const w = window as unknown as GtagWindow;
  w[`ga-disable-${id}`] = false;
  if (document.querySelector("script[data-gtag]")) return;
  w.dataLayer = w.dataLayer || [];
  // gtag must push the `arguments` object itself, as in Google's snippet.
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  w.gtag("js", new Date());
  w.gtag("config", id, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const s = document.createElement("script");
  s.async = true;
  s.dataset.gtag = id;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

/** Withdrawn consent: stop Google Analytics now and remove its cookies (_ga, _ga_*). */
export function stopGoogleAnalytics(id?: string) {
  const w = window as unknown as GtagWindow;
  if (id) w[`ga-disable-${id}`] = true;
  w.gtag?.("consent", "update", { analytics_storage: "denied" });
  document.querySelector("script[data-gtag]")?.remove();
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const name of document.cookie.split(";").map((c) => c.split("=")[0]!.trim())) {
    if (name !== "_ga" && !name.startsWith("_ga_") && name !== "_gid") continue;
    for (const d of domains)
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
  }
}

export type AnalyticsConfig = { plausibleDomain?: string; gaMeasurementId?: string };

/** Everything analytics, started once the visitor has accepted it (PRV-04). */
export function startAnalytics({ plausibleDomain, gaMeasurementId }: AnalyticsConfig = {}) {
  if (plausibleDomain) loadPlausible(plausibleDomain);
  if (gaMeasurementId) loadGoogleAnalytics(gaMeasurementId);
  startTracking();
}
