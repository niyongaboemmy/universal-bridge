"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; icon: ReactNode; count?: number };
export type NavGroup = { label: string; items: NavItem[] };

const KEY = "office-nav-open";
const isActive = (href: string, path: string) =>
  href === "/office" ? path === "/office" : path === href || path.startsWith(href + "/");

function readOpen(): string[] | null {
  try {
    const v = localStorage.getItem(KEY);
    return v ? (JSON.parse(v) as string[]) : null;
  } catch {
    return null;
  }
}

/**
 * Sidebar sections as an accordion: the section holding the current page is open,
 * the others fold away (with their unread totals on the header). Choices are
 * remembered on this device.
 */
export function OfficeNav({ groups, onNavigate }: { groups: NavGroup[]; onNavigate?: () => void }) {
  const path = usePathname();
  const current = groups.find((g) => g.items.some((i) => isActive(i.href, path)))?.label;
  const [open, setOpen] = useState<Set<string>>(
    () => new Set([groups[0]?.label ?? "", current ?? ""]),
  );
  const loaded = useRef(false);

  // Restore saved state once, then always keep the current section open.
  useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      const saved = readOpen();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading device storage after hydration
      if (saved) setOpen(new Set([...saved, current ?? ""]));
      return;
    }
    if (current) setOpen((o) => (o.has(current) ? o : new Set([...o, current])));
  }, [current]);

  const toggle = (label: string) =>
    setOpen((o) => {
      const n = new Set(o);
      if (n.has(label)) n.delete(label);
      else n.add(label);
      try {
        localStorage.setItem(KEY, JSON.stringify([...n]));
      } catch {
        /* storage blocked */
      }
      return n;
    });

  return (
    <nav aria-label="Company dashboard" className="grid gap-1">
      {groups.map((g) => {
        const expanded = open.has(g.label) || groups.length === 1;
        const total = g.items.reduce((s, i) => s + (i.count ?? 0), 0);
        const id = `nav-${g.label.toLowerCase().replace(/\W+/g, "-")}`;
        return (
          <div key={g.label}>
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={id}
              onClick={() => toggle(g.label)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left font-mono text-[0.6875rem] tracking-[0.18em] text-white/50 uppercase transition-colors hover:text-white/80"
            >
              <span className="flex-1">{g.label}</span>
              {!expanded && total > 0 && (
                <span className="rounded-full bg-[var(--ub-orange-500)] px-1.5 font-sans text-[0.625rem] font-semibold tracking-normal text-[var(--ub-navy-900)]">
                  {total}
                </span>
              )}
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-200",
                  !expanded && "-rotate-90",
                )}
                aria-hidden
              />
            </button>
            <div
              id={id}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-250 ease-out",
                expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <ul className="grid min-h-0 gap-0.5 overflow-hidden" inert={!expanded}>
                {g.items.map((item) => {
                  const active = isActive(item.href, path);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "relative flex items-center gap-3 rounded-xl px-3 py-2 text-body-sm whitespace-nowrap text-white/75 transition-colors hover:bg-white/8 hover:text-white [&_svg]:size-4",
                          active && "bg-white/12 text-white",
                        )}
                      >
                        {item.icon}
                        <span className="flex-1">{item.label}</span>
                        {!!item.count && (
                          <span className="rounded-full bg-[var(--ub-orange-500)] px-1.5 text-[0.6875rem] font-semibold text-[var(--ub-navy-900)] tabular-nums">
                            {item.count}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

/** Phones and tablets: the same navigation in a drawer from the left. */
export function MobileNav({ groups, footer }: { groups: NavGroup[]; footer?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const path = usePathname();
  useEffect(() => {
    ref.current?.close();
  }, [path]);
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-label="Open the menu"
        className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-subtle bg-surface lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <dialog
        ref={ref}
        aria-label="Menu"
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="office-drawer m-0 h-dvh max-h-dvh w-[min(20rem,86vw)] max-w-none overflow-y-auto bg-[var(--ub-navy-900)] p-0 text-white backdrop:bg-black/50 backdrop:backdrop-blur-sm lg:hidden"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-mono text-[0.6875rem] tracking-[0.16em] text-white/60 uppercase">
            Office
          </span>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Close the menu"
            className="grid size-9 place-items-center rounded-lg hover:bg-white/10"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="px-2 pb-4">
          <OfficeNav groups={groups} onNavigate={() => ref.current?.close()} />
        </div>
        {footer && <div className="border-t border-white/10 px-4 py-4">{footer}</div>}
      </dialog>
    </>
  );
}
