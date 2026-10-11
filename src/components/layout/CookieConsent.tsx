"use client";

import { useEffect, useState } from "react";
import type { AnalyticsConfig } from "@/lib/analytics/track";
import { useLocalStorage } from "@/lib/hooks/client-stores";

/**
 * FR-GL-10 / PRV-04. "Reject all" is exactly as easy as "Accept all"; nothing
 * non-essential loads until the visitor agrees; the choice can be changed from
 * the footer. Stored locally (no cookie) with the policy version and time.
 */
const KEY = "ub-consent";
const VERSION = 1;
const OPEN_EVENT = "ub:cookie-settings";

type Consent = { v: number; analytics: boolean; at: string };

function parse(raw: string | null | undefined): Consent | null {
  try {
    const value = JSON.parse(raw ?? "null") as Consent | null;
    return value?.v === VERSION ? value : null;
  } catch {
    return null;
  }
}

/**
 * Analytics code (Plausible, Google Analytics and first-party page views) loads only
 * after consent, as its own chunk.
 */
const startAnalytics = (config: AnalyticsConfig) =>
  void import("@/lib/analytics/track").then((m) => m.startAnalytics(config));

export type ConsentCopy = {
  title: string;
  body: string;
  accept: string;
  reject: string;
  customise: string;
  save: string;
  analytics: string;
  analyticsHint: string;
  essential: string;
  essentialHint: string;
  policy: string;
  policyHref: string;
};

export function CookieConsent({
  copy,
  plausibleDomain,
  gaMeasurementId,
}: {
  copy: ConsentCopy;
  plausibleDomain?: string;
  gaMeasurementId?: string;
}) {
  const [raw, write] = useLocalStorage(KEY);
  const stored = parse(raw);
  const [reopened, setReopened] = useState(false);
  const [analyticsChoice, setAnalytics] = useState<boolean | null>(null);
  const analytics = analyticsChoice ?? stored?.analytics ?? false;
  // undefined = before hydration: render nothing so the static HTML matches.
  const open = raw !== undefined && (!stored || reopened);
  const details = reopened || analyticsChoice !== null;

  // Load analytics only with consent (PRV-04). Side effect only, no setState.
  useEffect(() => {
    if (stored?.analytics) startAnalytics({ plausibleDomain, gaMeasurementId });
  }, [stored?.analytics, plausibleDomain, gaMeasurementId]);

  useEffect(() => {
    const reopen = () => setReopened(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  function save(allowAnalytics: boolean) {
    const value: Consent = { v: VERSION, analytics: allowAnalytics, at: new Date().toISOString() };
    write(JSON.stringify(value));
    setReopened(false);
    setAnalytics(null);
    if (allowAnalytics) startAnalytics({ plausibleDomain, gaMeasurementId });
    if (!allowAnalytics) {
      // Withdrawing consent: Google Analytics stops at once and its cookies go;
      // Plausible and page views stop from the next page load (script removed).
      document.querySelector("script[data-plausible]")?.remove();
      void import("@/lib/analytics/track").then((m) => m.stopGoogleAnalytics(gaMeasurementId));
    }
  }

  if (!open) return null;

  // Styles live in globals.css (.consent*): class strings in JS count against the page budget.
  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      data-no-print
      data-floating-bottom
      className="consent"
    >
      <div className="consent-head">
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <div>
          <h2 id="consent-title">{copy.title}</h2>
          <p>
            {copy.body} <a href={copy.policyHref}>{copy.policy}</a>
          </p>
        </div>
      </div>
      {details && (
        <fieldset className="consent-opts">
          <legend className="sr-only">{copy.customise}</legend>
          {[
            [true, true, copy.essential, copy.essentialHint],
            [analytics, false, copy.analytics, copy.analyticsHint],
          ].map(([on, fixed, label, hint]) => (
            <label key={label as string} data-fixed={fixed || undefined}>
              <span>
                <b>{label}</b>
                {hint}
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={on as boolean}
                disabled={fixed as boolean}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
            </label>
          ))}
        </fieldset>
      )}
      {/* Both choices look exactly the same (PRV-04: rejecting is as easy as accepting). */}
      <div className="consent-actions">
        <button type="button" onClick={() => save(false)}>
          {copy.reject}
        </button>
        <button type="button" onClick={() => save(true)}>
          {copy.accept}
        </button>
      </div>
      <button
        type="button"
        className="consent-more"
        onClick={() => (details ? save(analytics) : setAnalytics(analytics))}
      >
        {details ? copy.save : copy.customise}
      </button>
    </section>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="hover:text-fg"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      {label}
    </button>
  );
}
