"use client";

import { useSyncExternalStore } from "react";
import { HONEYPOT_FIELD } from "@/lib/forms/types";

/** Honeypot (FR-FORM-03): off-screen, not focusable, ignored by assistive tech. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const KEY = "ub-first-touch";

/** Record first-touch attribution once per session (idempotent). */
function firstTouch(): string | null {
  try {
    let raw = sessionStorage.getItem(KEY);
    if (!raw) {
      const params = new URLSearchParams(location.search);
      const data: Record<string, string> = { landing_page: location.pathname + location.search };
      for (const k of UTM) if (params.get(k)) data[k] = params.get(k)!.slice(0, 120);
      raw = JSON.stringify(data);
      sessionStorage.setItem(KEY, raw);
    }
    return raw;
  } catch {
    return null;
  }
}

/**
 * FR-FORM-09: first-touch UTM parameters and landing page, kept for the
 * session and sent with the form as (controlled) hidden fields.
 */
export function TrackingFields({ locale }: { locale: string }) {
  const raw = useSyncExternalStore(subscribeNever, firstTouch, () => null);
  const data = (raw ? JSON.parse(raw) : {}) as Record<string, string>;
  return (
    <div hidden>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="landing_page" value={data.landing_page ?? ""} />
      {UTM.map((k) => (
        <input key={k} type="hidden" name={k} value={data[k] ?? ""} />
      ))}
    </div>
  );
}

const subscribeNever = () => () => {};
