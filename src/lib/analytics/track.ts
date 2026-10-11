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
