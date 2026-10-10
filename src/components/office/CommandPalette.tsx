"use client";

import { ArrowRight, CornerDownLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Item = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  href: string;
  keys?: string;
  snippet?: string;
};
type Result = {
  type: string;
  id: number | string;
  title: string;
  subtitle: string;
  href: string;
  snippet?: string;
};

/** Wrap the searched words in <mark>. */
export function Highlight({ text, q }: { text: string; q: string }) {
  const terms = q.trim().split(/\s+/).filter((t) => t.length >= 2);
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 ? (
          <mark key={i} className="rounded-sm bg-[color-mix(in_oklab,var(--accent-spark)_30%,transparent)] px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * ⌘K / Ctrl+K palette for the Company dashboard: jump to a page, run an action,
 * or search requests, applicants, projects and people (as your role allows).
 * Shortcuts: "g" then a letter jumps to a section (g o, g r, g a…).
 */
export function CommandPalette({ pages, actions }: { pages: Item[]; actions: Item[] }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  const open = useCallback(() => {
    setQ("");
    setResults([]);
    setActive(0);
    dialog.current?.showModal();
    requestAnimationFrame(() => input.current?.focus());
  }, []);

  // ⌘K / Ctrl+K and "g x" shortcuts (not while typing in a field).
  useEffect(() => {
    let g = 0;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
        return;
      }
      const t = e.target as HTMLElement;
      if (
        t.closest("input, textarea, select, [contenteditable]") ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return;
      if (e.key === "/") {
        e.preventDefault();
        open();
      } else if (e.key === "g") {
        g = Date.now();
      } else if (Date.now() - g < 1000) {
        const hit = pages.find((p) => p.keys === `g ${e.key}`);
        if (hit) {
          e.preventDefault();
          router.push(hit.href);
        }
        g = 0;
      }
    };
    const onOpen = () => open();
    // Any element with data-open-palette opens the search (e.g. on the overview).
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.("[data-open-palette]")) open();
    };
    document.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);
    window.addEventListener("office:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      window.removeEventListener("office:palette", onOpen);
    };
  }, [open, pages, router]);

  // Debounced record search.
  useEffect(() => {
    if (q.trim().length < 2) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/office/search?q=${encodeURIComponent(q.trim())}`, {
          signal: ctrl.signal,
        });
        if (res.ok) setResults((await res.json()).results);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q]);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const match = (i: Item) =>
      !needle || `${i.label} ${i.hint ?? ""}`.toLowerCase().includes(needle);
    const records: Item[] =
      needle.length >= 2
        ? [
            ...results.map((r) => ({
              id: `${r.type}-${r.id}`,
              group: r.type + "s",
              label: r.title,
              hint: r.subtitle,
              snippet: r.snippet,
              href: r.href,
            })),
            {
              id: "all-results",
              group: "Search",
              label: `See all results for “${q.trim()}”`,
              href: `/office/search?q=${encodeURIComponent(q.trim())}`,
            },
          ]
        : [];
    return [...records, ...pages.filter(match), ...actions.filter(match)];
  }, [q, results, pages, actions]);

  const go = (item: Item | undefined) => {
    if (!item) return;
    dialog.current?.close();
    window.dispatchEvent(new Event("office:nav"));
    if (item.href.startsWith("/office")) router.push(item.href);
    else window.location.href = item.href;
  };

  let lastGroup = "";
  return (
    <dialog
      ref={dialog}
      aria-label="Search and commands"
      onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      className="office-palette m-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-subtle bg-surface p-0 text-fg shadow-4 backdrop:bg-[rgb(6_13_32/0.45)] backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 border-b border-subtle px-4">
        <Search className="size-4 text-fg-muted" aria-hidden />
        <input
          ref={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            if (e.target.value.trim().length < 2) setResults([]);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, items.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              go(items[active]);
            }
          }}
          role="combobox"
          aria-expanded="true"
          aria-controls="office-palette-list"
          aria-activedescendant={items[active] ? `pal-${items[active]!.id}` : undefined}
          placeholder="Search everything: people, requests, answers, notes, content… or jump to a page"
          className="h-13 flex-1 bg-transparent py-4 text-[0.9375rem] outline-none placeholder:text-fg-muted"
        />
        {loading && (
          <span
            className="size-4 animate-spin rounded-full border-2 border-accent border-t-transparent"
            aria-hidden
          />
        )}
        <kbd className="rounded-md border border-subtle px-1.5 py-0.5 font-sans text-[0.6875rem] text-fg-muted">
          Esc
        </kbd>
      </div>
      <ul
        id="office-palette-list"
        role="listbox"
        aria-label="Results"
        className="max-h-[55vh] overflow-y-auto p-2"
      >
        {items.length === 0 && (
          <li className="px-3 py-8 text-center text-[0.8125rem] text-fg-muted">
            {loading ? "Searching…" : q.trim().length >= 2 ? "Nothing found." : "Type to search."}
          </li>
        )}
        {items.map((item, i) => {
          const header = item.group !== lastGroup ? item.group : null;
          lastGroup = item.group;
          return (
            <li key={item.id} role="presentation">
              {header && (
                <p className="px-3 pt-3 pb-1 text-[0.6875rem] font-semibold tracking-wide text-fg-muted uppercase">
                  {header}
                </p>
              )}
              <div
                id={`pal-${item.id}`}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => go(item)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2",
                  i === active && "bg-accent-soft",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    <Highlight text={item.label} q={q} />
                  </span>
                  {item.hint && (
                    <span className="block truncate text-[0.75rem] text-fg-muted">
                      <Highlight text={item.hint} q={q} />
                    </span>
                  )}
                  {item.snippet && (
                    <span className="mt-0.5 block truncate text-[0.75rem] text-fg-secondary italic">
                      <Highlight text={item.snippet} q={q} />
                    </span>
                  )}
                </span>
                {item.keys && (
                  <kbd className="rounded-md border border-subtle px-1.5 py-0.5 font-sans text-[0.6875rem] text-fg-muted">
                    {item.keys}
                  </kbd>
                )}
                {i === active ? (
                  <CornerDownLeft className="size-3.5 text-accent" aria-hidden />
                ) : (
                  <ArrowRight className="size-3.5 text-fg-muted opacity-0" aria-hidden />
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="flex flex-wrap gap-x-4 gap-y-1 border-t border-subtle px-4 py-2.5 text-[0.6875rem] text-fg-muted">
        <span>↑ ↓ to move · Enter to open</span>
        <span>
          <kbd className="font-sans">/</kbd> or <kbd className="font-sans">⌘K</kbd> anywhere
        </span>
        <span>
          <kbd className="font-sans">g</kbd> then a letter to jump
        </span>
      </p>
    </dialog>
  );
}

/** The top-bar search field that opens the palette. */
export function PaletteTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("office:palette"))}
      className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-subtle bg-surface px-3.5 text-[0.8125rem] text-fg-muted transition-colors hover:border-strong sm:max-w-xs"
    >
      <Search className="size-4 shrink-0" aria-hidden />
      <span className="truncate">Search or jump to…</span>
      <kbd className="ml-auto hidden rounded-md border border-subtle px-1.5 font-sans text-[0.6875rem] sm:block">
        ⌘K
      </kbd>
    </button>
  );
}
