"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export type FilterField =
  | { kind: "search"; name: string; placeholder: string }
  | { kind: "select"; name: string; label: string; options: { value: string; label: string }[] }
  | { kind: "date"; name: string; label: string };

const control = "ui-field w-auto";

/**
 * Search, filters, sort and page size for a dashboard list, kept in the URL so a
 * filtered view can be bookmarked or shared. Changing anything returns to page 1.
 * Search is debounced; the list updates without a full page load.
 */
export function FilterBar({
  fields,
  sorts,
  perPage = true,
  keep = ["view", "type"],
}: {
  fields: FilterField[];
  sorts?: { value: string; label: string }[];
  perPage?: boolean;
  /** Params that clearing filters leaves alone (view mode, tabs). */
  keep?: string[];
}) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  // Phones: filters fold behind a button, the search stays visible.
  const [more, setMore] = useState(false);
  const search = fields.find((f) => f.kind === "search");
  const [q, setQ] = useState(search ? (params.get(search.name) ?? "") : "");
  // Skips the debounced search update on mount and right after "Clear".
  const skip = useRef(true);

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    next.delete("page");
    start(() => router.replace(next.size ? `${path}?${next}` : path, { scroll: false }));
  };

  // Debounced search.
  useEffect(() => {
    if (!search) return;
    if (skip.current) {
      skip.current = false;
      return;
    }
    const t = setTimeout(() => update({ [search.name]: q.trim() || null }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the typed text drives this
  }, [q]);

  // Text typed before React took over the input (slow devices) is in the DOM but not in
  // state, so it would never be searched for. Pick it up once, after the first render.
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const typed = input.current?.value ?? "";
    if (search && typed !== q) setQ(typed);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount
  }, []);

  const filterNames = fields.filter((f) => f.kind !== "search").map((f) => f.name);
  const active =
    filterNames.filter((n) => params.get(n)).length + (search && params.get(search.name) ? 1 : 0);
  const clear = () => {
    const next = new URLSearchParams();
    for (const k of keep) if (params.get(k)) next.set(k, params.get(k)!);
    if (q) {
      skip.current = true;
      setQ("");
    }
    start(() => router.replace(next.size ? `${path}?${next}` : path, { scroll: false }));
  };

  return (
    <div
      role="search"
      aria-label="Filter the list"
      className="flex flex-wrap items-center gap-2"
      aria-busy={pending}
    >
      {search && (
        <label className="relative min-w-0 flex-1 basis-56">
          <span className="sr-only">{search.placeholder}</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted"
            aria-hidden
          />
          <input
            ref={input}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={search.placeholder}
            className={cn(control, "w-full pl-9")}
          />
        </label>
      )}
      {(fields.some((f) => f.kind !== "search") || sorts || perPage) && (
        <button
          type="button"
          onClick={() => setMore((m) => !m)}
          aria-expanded={more}
          className={cn(
            "ui-field inline-flex w-auto items-center gap-1.5 sm:hidden",
            active > 0 && "is-active",
          )}
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filters{active > 0 ? ` · ${active}` : ""}
        </button>
      )}
      <div
        className={cn(
          "flex w-full flex-wrap items-center gap-2 sm:contents",
          !more && "max-sm:hidden",
        )}
      >
        {fields.map((f) =>
          f.kind === "select" ? (
            <label key={f.name} className="contents">
              <span className="sr-only">{f.label}</span>
              <select
                value={params.get(f.name) ?? ""}
                onChange={(e) => update({ [f.name]: e.target.value || null })}
                className={cn(
                  control,
                  "max-sm:flex-1 max-sm:basis-[45%] sm:max-w-[14rem]",
                  params.get(f.name) && "is-active",
                )}
                aria-label={f.label}
              >
                <option value="">{f.label}: all</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ) : f.kind === "date" ? (
            <label
              key={f.name}
              className={cn(
                control,
                "inline-flex items-center gap-1.5 pr-1.5",
                params.get(f.name) && "is-active",
              )}
            >
              <span className="text-fg-muted">{f.label}</span>
              <input
                type="date"
                value={params.get(f.name) ?? ""}
                onChange={(e) => update({ [f.name]: e.target.value || null })}
                className="bg-transparent text-[0.8125rem] outline-none"
                aria-label={f.label}
              />
            </label>
          ) : null,
        )}
        {sorts && (
          <select
            value={params.get("sort") ?? ""}
            onChange={(e) => update({ sort: e.target.value || null })}
            className={control}
            aria-label="Sort by"
          >
            {sorts.map((s, i) => (
              <option key={s.value} value={i === 0 ? "" : s.value}>
                Sort: {s.label}
              </option>
            ))}
          </select>
        )}
        {perPage && (
          <select
            value={params.get("per") ?? ""}
            onChange={(e) => update({ per: e.target.value || null })}
            className={control}
            aria-label="Rows per page"
          >
            <option value="">25 per page</option>
            {[10, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        )}
      </div>
      {active > 0 && (
        <button
          type="button"
          onClick={clear}
          className="inline-flex h-10 items-center gap-1 rounded-full px-3 text-[0.8125rem] font-medium text-accent hover:bg-accent-soft"
        >
          <X className="size-3.5" aria-hidden /> Clear {active} filter{active === 1 ? "" : "s"}
        </button>
      )}
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[0.75rem] text-fg-muted transition-opacity",
          pending ? "opacity-100" : "opacity-0",
        )}
        aria-hidden
      >
        <SlidersHorizontal className="size-3.5 animate-pulse" /> Updating…
      </span>
    </div>
  );
}
