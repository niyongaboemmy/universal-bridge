"use client";

import { useEffect, useState } from "react";
import { ClientButton as Button } from "@/components/ui/ClientButton";
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

function loadPlausible(domain: string) {
  if (document.querySelector("script[data-plausible]")) return;
  const s = document.createElement("script");
  s.defer = true;
  s.dataset.domain = domain;
  s.dataset.plausible = "";
  s.src = "https://plausible.io/js/script.outbound-links.js";
  document.head.appendChild(s);
}

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
}: {
  copy: ConsentCopy;
  plausibleDomain?: string;
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
    if (stored?.analytics && plausibleDomain) loadPlausible(plausibleDomain);
  }, [stored?.analytics, plausibleDomain]);

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
    if (allowAnalytics && plausibleDomain) loadPlausible(plausibleDomain);
    // Withdrawing consent takes effect on the next page load (script removed).
    if (!allowAnalytics) document.querySelector("script[data-plausible]")?.remove();
  }

  if (!open) return null;

  return (
    <section
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      data-no-print
      data-floating-bottom
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-xl animate-[reveal_var(--dur-slow)_var(--ease-enter)] rounded-xl border border-subtle bg-raised p-4 text-fg shadow-4 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:p-5"
    >
      {/* Phones: a compact bar (audit v2 R-2) — the title stays for screen readers. */}
      <h2 id="consent-title" className="font-display text-heading-md max-sm:sr-only">
        {copy.title}
      </h2>
      <p className="text-body-sm text-fg-secondary sm:mt-2">
        {copy.body}{" "}
        <a href={copy.policyHref} className="font-medium text-accent underline underline-offset-4">
          {copy.policy}
        </a>
      </p>
      {details && (
        <fieldset className="mt-4 space-y-3 border-t border-subtle pt-4">
          <label className="flex items-start gap-3 opacity-80">
            <input type="checkbox" checked disabled className="mt-1 size-4 accent-accent" />
            <span>
              <span className="block font-medium">{copy.essential}</span>
              <span className="block text-body-sm text-fg-secondary">{copy.essentialHint}</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="mt-1 size-4 accent-accent"
            />
            <span>
              <span className="block font-medium">{copy.analytics}</span>
              <span className="block text-body-sm text-fg-secondary">{copy.analyticsHint}</span>
            </span>
          </label>
        </fieldset>
      )}
      <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:flex sm:flex-wrap">
        {/* Equal weight for both choices (PRV-04). */}
        <Button size="sm" variant="secondary" onClick={() => save(false)}>
          {copy.reject}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => save(true)}>
          {copy.accept}
        </Button>
        {details ? (
          <Button size="sm" variant="ghost" onClick={() => save(analytics)}>
            {copy.save}
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setAnalytics(analytics)}>
            {copy.customise}
          </Button>
        )}
      </div>
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
