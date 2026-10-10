import Link from "next/link";
import { cn } from "@/lib/utils";

export type Category = {
  key: string;
  label: string;
  href: string;
  active?: boolean;
  /** Big number (e.g. new/open items). */
  count: number;
  hint?: string;
  /** Stacked bar of the category's items by stage. */
  segments?: { label: string; value: number; color: string }[];
};

/** Step 2 of every board page: pick a category; each card shows its stages at a glance. */
export function CategoryCards({ items, cols = 5 }: { items: Category[]; cols?: 3 | 4 | 5 | 6 }) {
  if (!items.length) return null;
  const grid = {
    3: "xl:grid-cols-3",
    4: "xl:grid-cols-4",
    5: "xl:grid-cols-5",
    6: "xl:grid-cols-6",
  }[cols];
  return (
    <ul
      className={cn(
        "office-stagger -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0",
        grid,
      )}
    >
      {items.map((c) => {
        const total = (c.segments ?? []).reduce((s, x) => s + x.value, 0);
        return (
          <li key={c.key} className="w-44 shrink-0 snap-start sm:w-auto">
            <Link
              href={c.href}
              aria-current={c.active || undefined}
              className={cn(
                "block h-full rounded-2xl border border-subtle bg-surface p-3.5 shadow-1 transition-[translate,border-color,box-shadow] hover:-translate-y-0.5 hover:shadow-2",
                c.active && "border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]",
              )}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-body-sm font-medium">{c.label}</span>
                <span className="font-display text-heading-md tabular-nums">{c.count}</span>
              </span>
              <span className="mt-2.5 flex h-1.5 overflow-hidden rounded-full bg-[var(--bg-sunken)]">
                {total > 0 &&
                  c.segments!.map((s) =>
                    s.value ? (
                      <span
                        key={s.label}
                        title={`${s.value} ${s.label}`}
                        className="office-bar h-full"
                        style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
                      />
                    ) : null,
                  )}
              </span>
              <span className="mt-1.5 block truncate text-[0.75rem] text-fg-muted">
                {c.hint ?? `${total} in all`}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Stage colours shared by boards and category bars. */
export const STAGE_COLORS: Record<string, string> = {
  new: "#fe760d",
  received: "#fe760d",
  contacted: "#6b9cff",
  review: "#6b9cff",
  qualified: "#3b6fd8",
  shortlisted: "#3b6fd8",
  proposal: "#0145b8",
  won: "#0f8a6a",
  accepted: "#0f8a6a",
  lost: "#94a3b8",
  rejected: "#94a3b8",
  waitlisted: "#b7791f",
  planning: "#6b9cff",
  active: "#0f8a6a",
  "on-hold": "#f59e0b",
  done: "#0145b8",
  cancelled: "#94a3b8",
  "on-leave": "#f59e0b",
  left: "#94a3b8",
};
