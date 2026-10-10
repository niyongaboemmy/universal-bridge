"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

type Place = { top: number; left: number; maxHeight: number; origin: "top" | "bottom" };

/** Where the panel goes: below the trigger, or above when there's more room there. */
function placeFor(
  anchor: HTMLElement | null,
  p: HTMLElement | null,
  align: "start" | "end",
  width?: number,
): Place | null {
  const a = anchor?.getBoundingClientRect();
  if (!a || !p) return null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(width ?? p.offsetWidth, vw - 16);
  const below = vh - a.bottom - 12;
  const above = a.top - 12;
  const h = p.scrollHeight;
  const up = h > below && above > below;
  let left = align === "end" ? a.right - w : a.left;
  left = Math.max(8, Math.min(left, vw - w - 8));
  return {
    left,
    top: up ? Math.max(8, a.top - Math.min(h, above) - 6) : a.bottom + 6,
    maxHeight: Math.max(160, up ? above : below),
    origin: up ? "bottom" : "top",
  };
}

/**
 * A floating panel next to its trigger, rendered at the end of <body> so tables,
 * cards and scroll areas never clip it. Flips above when there's no room below,
 * stays inside the viewport, closes on outside click, Escape and resize.
 */
export function Popover({
  open,
  onClose,
  anchor,
  children,
  align = "start",
  width,
  className,
  label,
}: {
  open: boolean;
  onClose: () => void;
  anchor: RefObject<HTMLElement | null>;
  children: ReactNode;
  align?: "start" | "end";
  width?: number;
  className?: string;
  label?: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<Place | null>(null);

  useLayoutEffect(() => {
    if (open) setPlace(placeFor(anchor.current, panel.current, align, width));
  }, [open, anchor, align, width]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panel.current?.contains(t) || anchor.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        anchor.current?.focus();
      }
    };
    const onMove = () => setPlace(placeFor(anchor.current, panel.current, align, width));
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, onClose, anchor, align, width]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={panel}
      role="dialog"
      aria-label={label}
      style={{
        top: place?.top ?? -9999,
        left: place?.left ?? -9999,
        width,
        maxHeight: place?.maxHeight,
        transformOrigin: place?.origin === "bottom" ? "bottom" : "top",
      }}
      className={cn(
        "office-pop fixed z-[90] overflow-y-auto rounded-xl border border-subtle bg-surface p-1.5 text-fg shadow-[0_1px_2px_rgb(2_8_23/0.06),0_22px_48px_-14px_rgb(2_8_23/0.4)] [[data-theme=dark]_&]:bg-[var(--bg-surface-raised)]",
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  );
}
