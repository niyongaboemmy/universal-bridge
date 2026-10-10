"use client";

import { X } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cx as cn } from "@/lib/cx";

/** A server-rendered item and the facet values it has, e.g. { mode: ["online"] }. */
export type Facet = { id: string; values: Record<string, string[]> };
export type Dimension = { key: string; label: string; options: { value: string; label: string }[] };

const subscribe = (cb: () => void) => {
  window.addEventListener("popstate", cb);
  window.addEventListener("ub:filters", cb);
  return () => {
    window.removeEventListener("popstate", cb);
    window.removeEventListener("ub:filters", cb);
  };
};

export function matchesFacets(item: Facet, active: Record<string, string>) {
  return Object.entries(active).every(([k, v]) => !v || (item.values[k] ?? []).includes(v));
}

/**
 * Shareable filters in URL search params (FR-WORK-01, FR-ACA-02). The items
 * are server-rendered; filtering emits one CSS rule hiding non-matches, so the
 * page stays static and nothing re-renders.
 */
export function FacetFilters({
  facets,
  dimensions,
  keys,
  attr,
  copy,
}: {
  facets: Facet[];
  dimensions: Dimension[];
  /** Every key that can be filtered on, even when its control is hidden. */
  keys: string[];
  /** data attribute on each item, e.g. "case" → [data-case="12"]. */
  attr: string;
  copy: {
    title: string;
    any: string;
    clear: string;
    results: { zero: string; one: string; other: string };
    emptyTitle: string;
    emptyBody: string;
  };
}) {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => "",
  );
  const params = new URLSearchParams(search);
  const active = Object.fromEntries(keys.map((k) => [k, params.get(k) ?? ""]));
  const count = facets.filter((f) => matchesFacets(f, active)).length;
  const resultText = (
    count === 0 ? copy.results.zero : count === 1 ? copy.results.one : copy.results.other
  ).replace("{count}", String(count));
  const hidden = facets
    .filter((f) => !matchesFacets(f, active))
    .map((f) => `[data-${attr}="${f.id}"]`);

  function update(next: URLSearchParams) {
    const qs = next.toString();
    const apply = () => {
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
      window.dispatchEvent(new Event("ub:filters"));
    };
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      doc.startViewTransition(apply);
    else apply();
  }

  return (
    <div className="mt-10">
      {hidden.length > 0 && <style>{`${hidden.join(",")}{display:none}`}</style>}
      <form
        role="search"
        aria-label={copy.title}
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => e.preventDefault()}
      >
        {dimensions.map((d) => (
          <label
            key={d.key}
            className="flex min-w-44 flex-1 flex-col gap-1.5 text-body-sm font-medium sm:flex-none"
          >
            {d.label}
            <select
              name={d.key}
              value={active[d.key]}
              onChange={(e) => {
                const next = new URLSearchParams(window.location.search);
                if (e.target.value) next.set(d.key, e.target.value);
                else next.delete(d.key);
                update(next);
              }}
              className={cn(
                "select-chevron h-11 appearance-none rounded-sm border bg-surface pr-10 pl-3.5 font-normal text-fg",
                active[d.key] ? "border-accent" : "border-strong",
              )}
            >
              <option value="">{copy.any}</option>
              {d.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}
        {Object.values(active).some(Boolean) && (
          <button
            type="button"
            onClick={() => update(new URLSearchParams())}
            className="inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-body-sm font-semibold text-accent hover:bg-accent-soft"
          >
            <X aria-hidden className="size-4" />
            {copy.clear}
          </button>
        )}
      </form>
      <p aria-live="polite" className="mt-6 text-body-sm text-fg-secondary">
        {resultText}
      </p>
      {count === 0 && (
        <div className="mt-6 rounded-xl border border-dashed border-strong p-10 text-center">
          <svg aria-hidden viewBox="0 0 120 40" className="mx-auto w-32 text-fg-muted">
            <circle cx="14" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="106" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M22 20h26M72 20h26"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>
          <p className="mt-4 font-display text-heading-md">{copy.emptyTitle}</p>
          <p className="mt-2 text-fg-secondary">{copy.emptyBody}</p>
        </div>
      )}
    </div>
  );
}
