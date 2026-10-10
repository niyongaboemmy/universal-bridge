"use client";

import { useId, useMemo, useState } from "react";

type Series = { key: string; label: string; color: string };

/**
 * Lightweight interactive time-series chart (SVG, no library): smooth stacked
 * areas or lines, gridlines, hover crosshair with a tooltip, keyboard focus on
 * each day, and a legend that toggles series.
 */
export function AreaChart({
  data,
  series,
  height = 220,
  stacked = false,
  format = (n: number) => String(n),
}: {
  data: ({ day: string } & Record<string, number | string>)[];
  series: Series[];
  height?: number;
  stacked?: boolean;
  format?: (n: number) => string;
}) {
  const id = useId();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<number | null>(null);
  const visible = series.filter((s) => !hidden.has(s.key));
  const W = 800;
  const H = height;
  const pad = { t: 12, r: 8, b: 26, l: 36 };
  const n = Math.max(data.length, 2);

  const { stacks, max } = useMemo(() => {
    const stacks = visible.map(() => [] as [number, number][]);
    let max = 1;
    data.forEach((d) => {
      let base = 0;
      visible.forEach((s, si) => {
        const v = Number(d[s.key] ?? 0);
        const lo = stacked ? base : 0;
        const hi = lo + v;
        stacks[si]!.push([lo, hi]);
        base = hi;
        max = Math.max(max, hi);
      });
    });
    return { stacks, max };
  }, [data, visible, stacked]);

  const nice = Math.max(4, Math.ceil(max / 4) * 4);
  const x = (i: number) => pad.l + (i / (n - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / nice) * (H - pad.t - pad.b);
  const smooth = (pts: [number, number][]) =>
    pts
      .map(([px, py], i) => {
        if (i === 0) return `M${px},${py}`;
        const [qx, qy] = pts[i - 1]!;
        const cx = (qx + px) / 2;
        return `C${cx},${qy} ${cx},${py} ${px},${py}`;
      })
      .join(" ");

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(nice * f));
  const labelEvery = Math.ceil(data.length / 8);
  const fmtDay = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap gap-2">
        {series.map((s) => {
          const off = hidden.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={!off}
              onClick={() =>
                setHidden((h) => {
                  const next = new Set(h);
                  if (next.has(s.key)) next.delete(s.key);
                  else if (visible.length > 1) next.add(s.key);
                  return next;
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-subtle px-2.5 py-1 text-[0.75rem] font-medium transition-opacity aria-[pressed=false]:opacity-40"
            >
              <span className="size-2 rounded-full" style={{ background: s.color }} />
              {s.label}
            </button>
          );
        })}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label={`Chart of ${series.map((s) => s.label).join(", ")} by day`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          {visible.map((s) => (
            <linearGradient key={s.key} id={`${id}-${s.key}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={s.color} stopOpacity="0.32" />
              <stop offset="1" stopColor={s.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--border-subtle)"
              strokeDasharray={t ? "3 4" : undefined}
            />
            <text
              x={pad.l - 8}
              y={y(t) + 4}
              textAnchor="end"
              className="fill-[var(--text-muted)] text-[11px]"
            >
              {format(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) =>
          i % labelEvery === 0 ? (
            <text
              key={d.day}
              x={x(i)}
              y={H - 6}
              textAnchor="middle"
              className="fill-[var(--text-muted)] text-[11px]"
            >
              {fmtDay(d.day)}
            </text>
          ) : null,
        )}
        {visible.map((s, si) => {
          const top = stacks[si]!.map(([, hi], i) => [x(i), y(hi)] as [number, number]);
          const bottom = stacks[si]!.map(([lo], i) => [x(i), y(lo)] as [number, number]).reverse();
          const area = `${smooth(top)} L${bottom.map(([a, b]) => `${a},${b}`).join(" L")} Z`;
          return (
            <g key={s.key}>
              <path d={area} fill={`url(#${id}-${s.key})`} className="office-page" />
              <path
                d={smooth(top)}
                pathLength={1}
                className="office-draw"
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          );
        })}
        {hover !== null && (
          <g pointerEvents="none">
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={pad.t}
              y2={H - pad.b}
              stroke="var(--border-strong)"
            />
            {visible.map((s, si) => (
              <circle
                key={s.key}
                cx={x(hover)}
                cy={y(stacks[si]![hover]![1])}
                r="4"
                fill="var(--bg-surface)"
                stroke={s.color}
                strokeWidth="2"
              />
            ))}
          </g>
        )}
        {data.map((d, i) => (
          <rect
            key={d.day}
            x={x(i) - (W - pad.l - pad.r) / (n - 1) / 2}
            y={pad.t}
            width={(W - pad.l - pad.r) / (n - 1)}
            height={H - pad.t - pad.b}
            fill="transparent"
            tabIndex={0}
            aria-label={`${fmtDay(d.day)}: ${visible.map((s) => `${s.label} ${format(Number(d[s.key] ?? 0))}`).join(", ")}`}
            onMouseEnter={() => setHover(i)}
            onFocus={() => setHover(i)}
            className="outline-none"
          />
        ))}
      </svg>
      {hover !== null && data[hover] && (
        <div
          className="pointer-events-none absolute top-10 z-10 min-w-36 -translate-x-1/2 rounded-xl border border-subtle bg-surface px-3 py-2 text-[0.8125rem] shadow-3"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          <p className="font-medium">{fmtDay(data[hover]!.day)}</p>
          {visible.map((s) => (
            <p key={s.key} className="mt-0.5 flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-fg-secondary">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="font-medium tabular-nums">
                {format(Number(data[hover]![s.key] ?? 0))}
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
