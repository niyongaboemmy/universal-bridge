"use client";

import { GripVertical, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { setOpeningStatus } from "@/features/office/admin-actions";
import {
  setEmployeeStatus,
  updateApplication,
  updateLead,
  updateProject,
} from "@/features/office/actions";
import { cn } from "@/lib/utils";
import { toast } from "./Toaster";

/** Cards rendered per column; the rest are one click away (keeps big inboxes fast). */
const DEFAULT_LIMIT = 40;

export type KanbanItem = {
  id: number;
  column: string;
  title: string;
  subtitle?: string;
  meta?: string[];
  badge?: string;
  /** "ok" | "warn" | "late": SLA colour on the card's edge. */
  urgency?: "ok" | "warn" | "late";
  href: string;
  value?: string;
  /** 0–1: a thin bar under the card (seats filled, project progress…). */
  progress?: number;
};

export type BoardKind = "lead" | "application" | "project" | "employee" | "opening";
const MOVE: Record<BoardKind, (id: number, column: string) => ReturnType<typeof updateLead>> = {
  lead: (id, status) => updateLead(id, { status }),
  application: (id, status) => updateApplication(id, { status }),
  project: (id, status) => updateProject(id, { status }),
  employee: (id, status) => setEmployeeStatus(id, status),
  opening: (id, status) => setOpeningStatus(id, status),
};

/**
 * Pipeline board with drag and drop between stages. Cards also move from their
 * menu (keyboard and touch friendly). Updates are optimistic: the card moves at
 * once and snaps back with a message if the server refuses.
 */
export function Kanban({
  kind,
  columns,
  items,
  moreHref,
  limit: LIMIT = DEFAULT_LIMIT,
}: {
  kind: BoardKind;
  /** Cards per column (Settings → Workflow). */
  limit?: number;
  /** Where the full list lives when a column is long. */
  moreHref?: string;
  columns: { id: string; label: string; hint?: string }[];
  items: KanbanItem[];
}) {
  const [optimistic, move] = useOptimistic(
    items,
    (state, { id, column }: { id: number; column: string }) =>
      state.map((i) => (i.id === id ? { ...i, column } : i)),
  );
  const [, start] = useTransition();
  const [dragging, setDragging] = useState<number | null>(null);
  const [over, setOver] = useState<string | null>(null);

  function moveTo(id: number, column: string) {
    const item = optimistic.find((i) => i.id === id);
    if (!item || item.column === column) return;
    start(async () => {
      move({ id, column });
      const res = await MOVE[kind](id, column);
      if (res.ok) toast(`${item.title} → ${columns.find((c) => c.id === column)?.label}`);
      else toast(res.error, "error");
    });
  }

  return (
    <div>
      <div className="flex snap-x gap-3 overflow-x-auto pb-3">
        {columns.map((col) => {
          const all = optimistic.filter((i) => i.column === col.id);
          const list = all.slice(0, LIMIT);
          return (
            <section
              key={col.id}
              aria-label={col.label}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(col.id);
              }}
              onDragLeave={() => setOver((o) => (o === col.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const id = Number(e.dataTransfer.getData("text/plain"));
                if (id) moveTo(id, col.id);
              }}
              className={cn(
                "flex w-72 shrink-0 snap-start flex-col rounded-2xl border border-subtle bg-[var(--bg-sunken)] p-2 transition-colors",
                over === col.id && "border-accent bg-accent-soft",
              )}
            >
              <header className="flex items-center justify-between px-2 py-1.5">
                <h3 className="text-body-sm font-semibold capitalize">{col.label}</h3>
                <span className="rounded-full bg-surface px-2 text-[0.75rem] tabular-nums text-fg-secondary">
                  {all.length}
                </span>
              </header>
              <ul className="flex min-h-24 flex-col gap-2">
                {list.map((item) => (
                  <li
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", String(item.id));
                      e.dataTransfer.effectAllowed = "move";
                      setDragging(item.id);
                    }}
                    onDragEnd={() => setDragging(null)}
                    data-urgency={item.urgency}
                    className={cn(
                      "group relative rounded-xl border border-subtle bg-surface p-3 shadow-1 transition-[opacity,box-shadow,translate]",
                      "hover:-translate-y-0.5 hover:shadow-2",
                      dragging === item.id && "opacity-50",
                      item.urgency === "late" &&
                        "border-[color-mix(in_oklab,var(--danger)_45%,transparent)]",
                      item.urgency === "warn" &&
                        "border-[color-mix(in_oklab,var(--accent-spark)_50%,transparent)]",
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical
                        aria-hidden
                        className="mt-0.5 size-4 shrink-0 cursor-grab text-fg-muted opacity-0 transition-opacity group-hover:opacity-100"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={item.href}
                          className="block truncate font-medium hover:text-accent"
                        >
                          {item.title}
                        </Link>
                        {item.subtitle && (
                          <p className="truncate text-[0.8125rem] text-fg-secondary">
                            {item.subtitle}
                          </p>
                        )}
                        {!!item.meta?.length && (
                          <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[0.75rem] text-fg-muted">
                            {item.meta.map((m) => (
                              <span key={m}>{m}</span>
                            ))}
                          </p>
                        )}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          {item.badge ? (
                            <span className="text-[0.75rem] text-fg-muted">{item.badge}</span>
                          ) : (
                            <span />
                          )}
                          {item.value && (
                            <span className="text-[0.75rem] font-medium">{item.value}</span>
                          )}
                        </div>
                        {item.progress !== undefined && (
                          <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-[var(--bg-sunken)]">
                            <span
                              className="office-bar block h-full rounded-full bg-gradient-to-r from-[#0145b8] to-[#fe760d]"
                              style={{ width: `${Math.round(Math.min(1, item.progress) * 100)}%` }}
                            />
                          </span>
                        )}
                      </div>
                      <span className="relative grid size-7 shrink-0 place-items-center rounded-md text-fg-muted hover:bg-[var(--bg-sunken)] hover:text-fg">
                        <MoreHorizontal aria-hidden className="size-4" />
                        <select
                          aria-label={`Move ${item.title} to another stage`}
                          value={item.column}
                          onChange={(e) => moveTo(item.id, e.target.value)}
                          className="absolute inset-0 cursor-pointer opacity-0"
                        >
                          {columns.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </span>
                    </div>
                  </li>
                ))}
                {all.length > LIMIT && (
                  <li className="px-2 py-1 text-center text-[0.8125rem]">
                    {moreHref ? (
                      <Link href={moreHref} className="text-accent">
                        +{all.length - LIMIT} more · open the list
                      </Link>
                    ) : (
                      <span className="text-fg-muted">+{all.length - LIMIT} more</span>
                    )}
                  </li>
                )}
                {!list.length && (
                  <li className="rounded-xl border border-dashed border-subtle px-3 py-6 text-center text-[0.8125rem] text-fg-muted">
                    Drop here
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
