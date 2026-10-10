"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import type { NavItem } from "./nav-types";

/**
 * FR-GL-03 mobile drawer: a native modal <dialog> — the rest of the page is
 * inert, focus stays inside, Esc closes, focus returns to the trigger.
 */
const supportsCommands = () =>
  typeof HTMLButtonElement !== "undefined" && "command" in HTMLButtonElement.prototype;

export function MobileMenu({
  items,
  labels,
  cta,
  controls,
}: {
  items: NavItem[];
  labels: { open: string; close: string; nav: string; viewAll: string };
  cta: ReactNode;
  controls: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <div className="lg:hidden">
      {/* Invoker Commands open the native modal dialog without JavaScript, so a tap
          before hydration on a slow connection still works. onClick covers older browsers. */}
      <button
        type="button"
        aria-label={labels.open}
        aria-haspopup="dialog"
        {...({ commandfor: "mobile-menu", command: "show-modal" } as Record<string, string>)}
        onClick={() => {
          if (supportsCommands()) return; // the native command already opens it
          if (!dialog.current?.open) dialog.current?.showModal();
        }}
        className="inline-flex size-11 items-center justify-center rounded-md hover:bg-accent-soft hover:text-accent"
      >
        <Menu aria-hidden className="size-6" />
      </button>
      <dialog
        id="mobile-menu"
        ref={dialog}
        aria-label={labels.nav}
        className="mobile-drawer m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-surface p-0 text-fg shadow-4 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-[72px] items-center justify-between border-b border-subtle px-4">
            <div className="flex items-center gap-1">{controls}</div>
            <button
              type="button"
              aria-label={labels.close}
              {...({ commandfor: "mobile-menu", command: "close" } as Record<string, string>)}
              onClick={() => {
                if (!supportsCommands()) dialog.current?.close();
              }}
              className="inline-flex size-11 items-center justify-center rounded-md hover:bg-accent-soft"
            >
              <X aria-hidden className="size-6" />
            </button>
          </div>
          <nav aria-label={labels.nav} className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-1">
              {items.map((item, i) => (
                <li
                  key={item.href}
                  className="mobile-drawer__item"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {item.children?.length ? (
                    <details className="group rounded-lg">
                      <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between rounded-lg px-3 font-display text-heading-md hover:bg-accent-soft [&::-webkit-details-marker]:hidden">
                        {item.label}
                        <ChevronDown
                          aria-hidden
                          className="size-5 transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <ul className="mb-2 ml-3 border-l border-subtle pl-3">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="flex min-h-11 items-center rounded-md px-3 text-fg-secondary hover:text-accent"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={item.href}
                            className="flex min-h-11 items-center rounded-md px-3 font-semibold text-accent"
                          >
                            {labels.viewAll}
                          </Link>
                        </li>
                      </ul>
                    </details>
                  ) : (
                    <Link
                      href={item.href}
                      className="flex min-h-13 items-center rounded-lg px-3 font-display text-heading-md hover:bg-accent-soft"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="border-t border-subtle p-4">{cta}</div>
        </div>
      </dialog>
    </div>
  );
}
