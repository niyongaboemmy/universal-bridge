"use client";

import { X } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { localizePath, type Locale } from "@/i18n/routing";

type Offer = { text: string; action: string; dismiss: string };

const subscribe = () => () => {};
function readSaved(): Locale | null {
  try {
    if (sessionStorage.getItem("ub-locale-offer")) return null;
    return (
      (/(?:^|; )UB_LOCALE=(fr|rw)(?:;|$)/.exec(document.cookie)?.[1] as Locale | undefined) ?? null
    );
  } catch {
    return null;
  }
}

/**
 * UI/UX audit P2-9: an unprefixed (English) link opened by someone whose saved
 * language is French or Kinyarwanda stays English — this offers a one-tap
 * switch, written in their language. Dismissal lasts for the browser session.
 */
export function LocaleOffer({ offers }: { offers: Partial<Record<Locale, Offer>> }) {
  const [dismissed, setDismissed] = useState(false);
  // Read once on the client; the server render (and hydration) shows nothing.
  const saved = useSyncExternalStore(subscribe, readSaved, () => null);
  const target = !dismissed && saved && offers[saved] ? saved : null;

  if (!target) return null;
  const offer = offers[target]!;
  const dismiss = () => {
    try {
      sessionStorage.setItem("ub-locale-offer", "1");
    } catch {}
    setDismissed(true);
  };
  return (
    <aside
      lang={target}
      aria-label={offer.text}
      data-floating-bottom
      className="glass fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-subtle p-3 pl-4 text-body-sm shadow-4 sm:right-6 sm:left-auto"
    >
      <p className="flex-1 text-fg">{offer.text}</p>
      <a
        href={localizePath(window.location.pathname, target) + window.location.search}
        onClick={dismiss}
        className="inline-flex min-h-11 items-center rounded-md bg-spark px-3 font-semibold text-on-spark"
      >
        {offer.action}
      </a>
      <button
        type="button"
        onClick={dismiss}
        aria-label={offer.dismiss}
        className="inline-flex size-11 items-center justify-center rounded-full text-fg-secondary hover:bg-accent-soft hover:text-accent"
      >
        <X aria-hidden className="size-4" />
      </button>
    </aside>
  );
}
