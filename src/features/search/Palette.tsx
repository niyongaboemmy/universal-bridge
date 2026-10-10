"use client";

import { Calendar, Copy, FileText, Globe, Moon, Search } from "lucide-react";
import MiniSearch from "minisearch";
import { useTheme } from "next-themes";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SearchDoc } from "@/app/api/search-index/[locale]/route";
import { localizePath, type Locale } from "@/i18n/routing";

export type PaletteCopy = {
  open: string;
  placeholder: string;
  empty: string;
  groups: Record<string, string>;
  actions: { book: string; copyEmail: string; toggleTheme: string; language: string };
};
export type PaletteProps = {
  open: boolean;
  onClose: () => void;
  locale: string;
  copy: PaletteCopy;
  email: string;
};

type Item = {
  id: string;
  group: string;
  title: string;
  text?: string;
  icon: React.ReactNode;
  run: () => void;
};

const cache = new Map<string, Promise<SearchDoc[]>>();
const loadIndex = (locale: string) => {
  if (!cache.has(locale))
    cache.set(
      locale,
      fetch(`/api/search-index/${locale}`).then((r) => (r.ok ? r.json() : [])),
    );
  return cache.get(locale)!;
};

/**
 * Accessible command palette (UI/UX §10.8): native modal <dialog> with a
 * combobox + listbox (ARIA 1.2), arrow keys, Enter, Esc. Acrylic surface.
 */
export function Palette({ open, onClose, locale, copy, email }: PaletteProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const { resolvedTheme, setTheme } = useTheme();
  const listId = useId();

  useEffect(() => {
    loadIndex(locale).then(setDocs, () => setDocs([]));
  }, [locale]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      requestAnimationFrame(() => input.current?.focus());
    } else if (!open && d.open) d.close();
  }, [open]);

  const engine = useMemo(() => {
    const ms = new MiniSearch<SearchDoc>({
      fields: ["title", "text"],
      storeFields: ["title", "text", "url", "type"],
      searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 3 } },
    });
    ms.addAll(docs);
    return ms;
  }, [docs]);

  const go = (url: string) => {
    onClose();
    window.location.assign(url);
  };

  const actions: Item[] = [
    {
      id: "a-book",
      group: copy.groups.actions!,
      title: copy.actions.book,
      icon: <Calendar aria-hidden className="size-4" />,
      run: () => go(localizePath("/book", locale as Locale)),
    },
    {
      id: "a-email",
      group: copy.groups.actions!,
      title: copy.actions.copyEmail,
      text: email,
      icon: <Copy aria-hidden className="size-4" />,
      run: () => {
        void navigator.clipboard?.writeText(email);
        onClose();
      },
    },
    {
      id: "a-theme",
      group: copy.groups.actions!,
      title: copy.actions.toggleTheme,
      icon: <Moon aria-hidden className="size-4" />,
      run: () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        onClose();
      },
    },
    ...(["en", "fr", "rw"] as const)
      .filter((l) => l !== locale)
      .map((l) => ({
        id: `a-lang-${l}`,
        group: copy.groups.actions!,
        title: `${copy.actions.language}: ${{ en: "English", fr: "Français", rw: "Ikinyarwanda" }[l]}`,
        icon: <Globe aria-hidden className="size-4" />,
        run: () => {
          // Same as the language switcher: remember the choice, then navigate.
          document.cookie = `UB_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`;
          go(localizePath(window.location.pathname, l));
        },
      })),
  ];

  const q = query.trim();
  const results: Item[] = q
    ? engine
        .search(q)
        .slice(0, 12)
        .map((r) => ({
          id: String(r.id),
          group: copy.groups[r.type as string] ?? copy.groups.pages!,
          title: r.title as string,
          text: r.text as string,
          icon: <FileText aria-hidden className="size-4" />,
          run: () => go(r.url as string),
        }))
    : [];
  // A query that names an action ("book", "theme") runs it on Enter, ahead of content.
  const items = q
    ? [...actions.filter((a) => a.title.toLowerCase().includes(q.toLowerCase())), ...results]
    : actions;
  const current = Math.min(active, Math.max(0, items.length - 1));

  return (
    <dialog
      ref={dialog}
      aria-label={copy.open}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      className="acrylic m-auto mt-[12vh] w-[min(640px,calc(100vw-2rem))] rounded-xl border border-subtle p-0 text-fg shadow-4 backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 border-b border-subtle px-4">
        <Search aria-hidden className="size-5 text-fg-muted" />
        <input
          ref={input}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={items[current] ? `${listId}-${items[current].id}` : undefined}
          aria-autocomplete="list"
          aria-label={copy.placeholder}
          placeholder={copy.placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, items.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter" && items[current]) {
              e.preventDefault();
              items[current].run();
            }
          }}
          className="h-14 w-full bg-transparent text-body-lg outline-none placeholder:text-fg-muted"
        />
        <kbd className="hidden rounded border border-subtle px-1.5 font-mono text-[0.75rem] text-fg-muted sm:block">
          Esc
        </kbd>
      </div>
      <ul
        id={listId}
        role="listbox"
        aria-label={copy.open}
        className="max-h-[50vh] overflow-y-auto p-2"
      >
        {q && !results.length && (
          <li role="presentation" className="px-3 py-6 text-center text-body-sm text-fg-secondary">
            {copy.empty.replace("{query}", q)}
          </li>
        )}
        {items.map((item, i) => {
          const showGroup = i === 0 || items[i - 1]!.group !== item.group;
          return (
            <li key={item.id} role="presentation">
              {showGroup && (
                <p className="px-3 pt-3 pb-1 font-mono text-[0.75rem] tracking-widest text-fg-muted uppercase">
                  {item.group}
                </p>
              )}
              <div
                id={`${listId}-${item.id}`}
                role="option"
                aria-selected={i === current}
                onPointerMove={() => setActive(i)}
                onClick={() => item.run()}
                className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 ${i === current ? "bg-accent-soft text-accent" : ""}`}
              >
                <span className="text-fg-muted">{item.icon}</span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{item.title}</span>
                  {item.text && (
                    <span className="block truncate text-body-sm text-fg-secondary">
                      {item.text}
                    </span>
                  )}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </dialog>
  );
}
