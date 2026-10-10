"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cx as cn } from "@/lib/cx";
import type { NavItem } from "./nav-types";

/**
 * FR-GL-02 desktop mega-menu. Disclosure pattern: each trigger is a button with
 * aria-expanded/aria-controls. Mouse: opens on hover with intent delay.
 * Keyboard: Enter/Space/↓ open, ←/→ move between triggers, ↑/↓ move between
 * links, Esc closes and returns focus (UI/UX §13).
 */
export function MegaMenu({
  items,
  label,
  viewAllLabel,
}: {
  items: NavItem[];
  label: string;
  viewAllLabel: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pathname = usePathname();

  const close = useCallback((focusTrigger = false) => {
    setOpen((current) => {
      if (focusTrigger && current !== null) triggers.current[current]?.focus();
      return null;
    });
  }, []);

  // Close on route change (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
  }
  useEffect(() => {
    if (open === null) return;
    // Esc closes from anywhere (focus may be on the trigger, a link or the page).
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(true);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);
  useEffect(() => {
    if (open === null) return;
    const onDown = (e: PointerEvent) => {
      const nav = triggers.current[0]?.closest("nav");
      if (nav && !nav.contains(e.target as Node)) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, close]);

  const focusLink = (index: number, which: "first" | "last" | number) => {
    const links = [
      ...(panels.current[index]?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []),
    ];
    const target = which === "first" ? links[0] : which === "last" ? links.at(-1) : links[which];
    target?.focus();
  };

  function onTriggerKey(e: React.KeyboardEvent, index: number) {
    const count = items.length;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = (index + (e.key === "ArrowRight" ? 1 : -1) + count) % count;
      triggers.current[next]?.focus();
      if (open !== null) setOpen(items[next]?.children?.length ? next : null);
    } else if (e.key === "ArrowDown" && items[index]?.children?.length) {
      e.preventDefault();
      setOpen(index);
      requestAnimationFrame(() => focusLink(index, "first"));
    }
  }

  function onPanelKey(e: React.KeyboardEvent, index: number) {
    const links = [
      ...(panels.current[index]?.querySelectorAll<HTMLAnchorElement>("a[href]") ?? []),
    ];
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusLink(index, (current + 1) % links.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (current <= 0) triggers.current[index]?.focus();
      else focusLink(index, current - 1);
    }
  }

  const hover = (index: number | null) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(index), index === null ? 160 : 90);
  };

  return (
    <nav
      aria-label={label}
      className="hidden lg:block"
      onPointerLeave={(e) => e.pointerType === "mouse" && hover(null)}
    >
      <ul className="flex items-center gap-0.5">
        {items.map((item, index) => {
          const hasMenu = Boolean(item.children?.length);
          const isOpen = open === index;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const triggerClass = cn(
            "inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-[0.9375rem] font-medium transition-colors",
            "hover:bg-accent-soft hover:text-accent",
            (isOpen || active) && "text-accent",
            isOpen && "bg-accent-soft",
          );
          return (
            <li key={item.href} className="static">
              {hasMenu ? (
                <button
                  ref={(el) => {
                    triggers.current[index] = el;
                  }}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`mega-${index}`}
                  className={triggerClass}
                  onClick={() => setOpen(isOpen ? null : index)}
                  onKeyDown={(e) => onTriggerKey(e, index)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && hover(index)}
                >
                  {item.label}
                  <ChevronDown
                    aria-hidden
                    className={cn(
                      "size-4 transition-transform duration-[var(--dur-base)]",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
              ) : (
                <Link
                  ref={(el) => {
                    triggers.current[index] = el;
                  }}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={triggerClass}
                  onKeyDown={(e) => onTriggerKey(e, index)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && hover(null)}
                >
                  {item.label}
                </Link>
              )}
              {hasMenu && (
                <div
                  ref={(el) => {
                    panels.current[index] = el;
                  }}
                  id={`mega-${index}`}
                  hidden={!isOpen}
                  onKeyDown={(e) => onPanelKey(e, index)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && hover(index)}
                  className="absolute inset-x-0 top-full pt-2"
                >
                  <div className="container-page">
                    <div className="acrylic grid animate-[reveal_var(--dur-base)_var(--ease-enter)] grid-cols-[1fr_300px] gap-2 rounded-xl border border-subtle p-3 text-fg shadow-4">
                      <ul className="grid grid-cols-2 gap-1">
                        {item.children!.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="group/item flex gap-3.5 rounded-lg p-3.5 transition-colors hover:bg-accent-soft focus-visible:bg-accent-soft"
                            >
                              {child.icon && (
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent transition-transform group-hover/item:scale-105 [&_svg]:size-5">
                                  {child.icon}
                                </span>
                              )}
                              <span>
                                <span className="block font-semibold text-fg group-hover/item:text-accent">
                                  {child.label}
                                </span>
                                {child.description && (
                                  <span className="mt-0.5 block text-body-sm text-fg-secondary">
                                    {child.description}
                                  </span>
                                )}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <div className="night flex flex-col justify-between rounded-lg p-6">
                        {item.feature?.title ? (
                          <div>
                            {item.feature.eyebrow && (
                              <p className="eyebrow">{item.feature.eyebrow}</p>
                            )}
                            <p className="mt-2 font-display text-heading-md">
                              {item.feature.title}
                            </p>
                            {item.feature.body && (
                              <p className="mt-2 text-body-sm text-fg-secondary">
                                {item.feature.body}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div />
                        )}
                        <Link
                          href={item.feature?.href ?? item.href}
                          className="mt-6 inline-flex items-center gap-2 font-semibold text-accent hover:gap-3 transition-[gap]"
                        >
                          {item.feature?.cta ?? viewAllLabel}
                          <ArrowRight aria-hidden className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
