"use client";

import { useRef, useState } from "react";

/**
 * 404 "broken bridge" (UI/UX §11): drag the orange piece into the gap to
 * reconnect the two nodes and go home. Keyboard: focus the piece and press
 * Enter/Space. The SVG is a labelled group (not role="img", which can't contain
 * a button); the "Take me home" link next to it does the same job.
 */
export function BridgeGame({
  homeHref,
  copy,
}: {
  homeHref: string;
  copy: { piece: string; hint: string; connected: string };
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const svg = useRef<SVGSVGElement>(null);

  function complete() {
    setDone(true);
    setPos({ x: 0, y: 0 });
    setTimeout(() => window.location.assign(homeHref), 1200);
  }

  function toLocal(dx: number, dy: number) {
    const r = svg.current?.getBoundingClientRect();
    const k = r ? 400 / r.width : 1;
    return { x: dx * k, y: dy * k };
  }

  return (
    <div className="mx-auto max-w-xl">
      <svg
        ref={svg}
        viewBox="0 0 400 200"
        className="w-full touch-none select-none"
        role="group"
        aria-label={copy.hint}
      >
        <path
          d="M30 120 H150"
          stroke="var(--accent-primary)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M250 120 H370"
          stroke="var(--accent-primary)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle
          cx="30"
          cy="120"
          r="14"
          fill="var(--bg-surface)"
          stroke="var(--accent-primary)"
          strokeWidth="5"
        />
        <circle
          cx="370"
          cy="120"
          r="14"
          fill={done ? "var(--accent-primary)" : "var(--bg-surface)"}
          stroke="var(--accent-primary)"
          strokeWidth="5"
          style={{ transition: "fill 300ms" }}
        />
        {/* gap outline */}
        {!done && (
          <path
            d="M156 120 H244"
            stroke="var(--border-strong)"
            strokeWidth="6"
            strokeDasharray="6 8"
            strokeLinecap="round"
          />
        )}
        <g
          tabIndex={0}
          role="button"
          aria-label={copy.piece}
          className="cursor-grab outline-none focus-visible:[&>rect]:stroke-[var(--focus-ring)] active:cursor-grabbing"
          transform={done ? "translate(0 0)" : `translate(${pos.x} ${pos.y - 70})`}
          style={{ transition: dragging ? "none" : "transform 400ms cubic-bezier(.2,0,0,1.2)" }}
          onPointerDown={(e) => {
            if (done) return;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            start.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
            setDragging(true);
          }}
          onPointerMove={(e) => {
            if (!start.current) return;
            const d = toLocal(e.clientX - start.current.x, e.clientY - start.current.y);
            setPos({ x: start.current.px + d.x, y: start.current.py + d.y });
          }}
          onPointerUp={() => {
            if (!start.current) return;
            start.current = null;
            setDragging(false);
            // Close enough to the gap (piece rests 70 units above it)?
            if (Math.abs(pos.x) < 40 && Math.abs(pos.y - 70) < 35) complete();
            else setPos({ x: 0, y: 0 });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              complete();
            }
          }}
        >
          <rect
            x="150"
            y="113"
            width="100"
            height="14"
            rx="7"
            fill="var(--accent-spark)"
            stroke="transparent"
            strokeWidth="3"
          />
        </g>
      </svg>
      <p role="status" className="mt-2 min-h-6 text-center text-body-sm text-fg-secondary">
        {done ? copy.connected : copy.hint}
      </p>
    </div>
  );
}
