import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CountUp } from "./CountUp";

/**
 * Small server-rendered charts for the overview: they draw themselves with CSS
 * (no chart library, no client JS) and explain themselves on hover (<title>).
 */

export function Sparkline({
  values,
  color = "var(--accent-primary)",
  height = 36,
  className,
}: {
  values: number[];
  color?: string;
  height?: number;
  className?: string;
}) {
  const W = 120;
  const max = Math.max(...values, 1);
  const pts = values.map((v, i) => [
    (i / Math.max(values.length - 1, 1)) * W,
    height - 3 - (v / max) * (height - 6),
  ]);
  const line = pts
    .map(([x, y], i) => `${i ? "L" : "M"}${x!.toFixed(1)} ${y!.toFixed(1)}`)
    .join(" ");
  const id = `sp${Math.abs(values.reduce((a, b) => a * 31 + b, 7)) % 1e6}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      className={cn("h-9 w-full overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.28" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${line} L${W} ${height} L0 ${height} Z`}
        fill={`url(#${id})`}
        className="office-fade-in"
      />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="office-draw"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** KPI tile: number, change against the previous period, and a 14-day sparkline. */
export function Kpi({
  label,
  value,
  change,
  spark,
  href,
  icon,
  tone = "blue",
  hint,
}: {
  label: string;
  value: number | string;
  change?: number;
  spark?: number[];
  href?: string;
  icon?: ReactNode;
  tone?: "blue" | "orange" | "green" | "violet" | "teal" | "rose";
  hint?: ReactNode;
}) {
  const color = {
    blue: "#0145b8",
    orange: "#fe760d",
    green: "#0f8a6a",
    violet: "#7a4de0",
    teal: "#0e7490",
    rose: "#be185d",
  }[tone];
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.8125rem] text-fg-secondary">{label}</p>
        {icon && (
          <span
            className="grid size-8 shrink-0 place-items-center rounded-lg text-white [&_svg]:size-4"
            style={{ background: color }}
          >
            {icon}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <p className="font-display text-[1.75rem] leading-none font-bold tracking-tight tabular-nums">
          {typeof value === "number" ? <CountUp value={value} /> : value}
        </p>
        {change !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold",
              change > 0
                ? "bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-success"
                : change < 0
                  ? "bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] text-danger"
                  : "bg-[var(--bg-sunken)] text-fg-muted",
            )}
            title="Against the previous period"
          >
            {change > 0 ? (
              <ArrowUpRight className="size-3" />
            ) : change < 0 ? (
              <ArrowDownRight className="size-3" />
            ) : null}
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      {spark && <Sparkline values={spark} color={color} className="mt-2" />}
      {hint && <p className="mt-1 truncate text-[0.75rem] text-fg-muted">{hint}</p>}
    </>
  );
  const cls =
    "group block min-w-0 rounded-2xl border border-subtle bg-surface p-4 shadow-1 transition-[translate,box-shadow,border-color] duration-200";
  return href ? (
    <Link
      href={href}
      className={cn(cls, "hover:-translate-y-0.5 hover:border-strong hover:shadow-2")}
    >
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Donut with a legend; segments draw in one after another. */
export function Donut({
  data,
  label,
  size = 132,
  format = (n: number) => String(n),
}: {
  data: { label: string; value: number; color: string; href?: string }[];
  label: string;
  size?: number;
  format?: (n: number) => string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 42 42"
          className="size-full -rotate-90"
          role="img"
          aria-label={`${label}: ${total}`}
        >
          <circle
            cx="21"
            cy="21"
            r="15.9"
            fill="none"
            strokeWidth="5"
            className="stroke-[color-mix(in_oklab,var(--text-primary)_8%,transparent)]"
          />
          {total > 0 &&
            data.map((d, i) => {
              const pct = (d.value / total) * 100;
              const el = (
                <circle
                  key={d.label}
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke={d.color}
                  strokeWidth="5"
                  pathLength={100}
                  strokeDasharray={`${Math.max(pct - 0.6, 0)} ${100 - Math.max(pct - 0.6, 0)}`}
                  strokeDashoffset={-offset}
                  className="office-donut transition-[stroke-width] hover:[stroke-width:6.5]"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  <title>{`${d.label}: ${format(d.value)} (${Math.round(pct)}%)`}</title>
                </circle>
              );
              offset += pct;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-display text-heading-md leading-none tabular-nums">
              {format(total)}
            </p>
            <p className="mt-0.5 text-[0.6875rem] text-fg-muted">{label}</p>
          </div>
        </div>
      </div>
      <ul className="grid min-w-0 flex-1 gap-1.5 text-[0.8125rem]">
        {data.map((d) => {
          const row = (
            <>
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="min-w-0 flex-1 truncate">{d.label}</span>
              <span className="font-medium tabular-nums">{format(d.value)}</span>
              <span className="w-9 text-right text-fg-muted tabular-nums">
                {total ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </>
          );
          return (
            <li key={d.label}>
              {d.href ? (
                <Link
                  href={d.href}
                  className="flex items-center gap-2 rounded-md px-1 py-0.5 hover:bg-[var(--bg-sunken)]"
                >
                  {row}
                </Link>
              ) : (
                <span className="flex items-center gap-2 px-1 py-0.5">{row}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Half-circle gauge (0–100) with a target notch. */
export function Gauge({
  value,
  label,
  display,
  target,
  good = "high",
}: {
  value: number;
  label: string;
  display: string;
  target?: number;
  good?: "high" | "low";
}) {
  const v = Math.max(0, Math.min(100, value));
  const ok = target === undefined ? true : good === "high" ? v >= target : v <= target;
  const color = ok ? "#0f8a6a" : v > 0 && Math.abs(v - (target ?? 0)) < 15 ? "#fe760d" : "#dc2626";
  const angle = target !== undefined ? Math.PI * (1 - target / 100) : 0;
  return (
    <figure className="grid justify-items-center">
      <svg viewBox="0 0 100 58" className="w-40" role="img" aria-label={`${label}: ${display}`}>
        <path
          d="M10 50 A40 40 0 0 1 90 50"
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className="stroke-[color-mix(in_oklab,var(--text-primary)_9%,transparent)]"
        />
        <path
          d="M10 50 A40 40 0 0 1 90 50"
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${v} 100`}
          className="office-gauge"
        />
        {target !== undefined && (
          <line
            x1={50 + 33 * Math.cos(angle)}
            y1={50 - 33 * Math.sin(angle)}
            x2={50 + 47 * Math.cos(angle)}
            y2={50 - 47 * Math.sin(angle)}
            stroke="var(--text-primary)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}
      </svg>
      <p className="-mt-6 font-display text-heading-md tabular-nums">{display}</p>
      <figcaption className="text-[0.75rem] text-fg-muted">{label}</figcaption>
    </figure>
  );
}

/** Stage funnel: each bar is a stage, width = count; value shown on the right. */
export function Funnel({
  stages,
  format,
}: {
  stages: { label: string; count: number; value?: number; color: string; href?: string }[];
  format?: (n: number) => string;
}) {
  const max = Math.max(...stages.map((s) => s.count), 1);
  return (
    <ul className="grid gap-2">
      {stages.map((s, i) => {
        const bar = (
          <>
            <span className="w-24 shrink-0 truncate text-[0.8125rem] text-fg-secondary capitalize">
              {s.label}
            </span>
            <span className="relative h-7 min-w-0 flex-1 overflow-hidden rounded-lg bg-[var(--bg-sunken)]">
              <span
                className="office-bar absolute inset-y-0 left-0 rounded-lg"
                style={{
                  width: `${Math.max((s.count / max) * 100, s.count ? 4 : 0)}%`,
                  background: s.color,
                  animationDelay: `${i * 70}ms`,
                }}
              />
              <span className="relative flex h-full items-center px-2.5 text-[0.75rem] font-semibold tabular-nums mix-blend-luminosity">
                {s.count}
              </span>
            </span>
            {s.value !== undefined && (
              <span className="w-20 shrink-0 text-right text-[0.75rem] text-fg-muted tabular-nums">
                {format ? format(s.value) : s.value}
              </span>
            )}
          </>
        );
        return (
          <li key={s.label}>
            {s.href ? (
              <Link
                href={s.href}
                className="flex items-center gap-3 rounded-lg transition-opacity hover:opacity-85"
              >
                {bar}
              </Link>
            ) : (
              <span className="flex items-center gap-3">{bar}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Ring showing a share (seats filled, progress). */
export function Ring({
  value,
  size = 44,
  color = "#0145b8",
  children,
}: {
  value: number;
  size?: number;
  color?: string;
  children?: ReactNode;
}) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <span
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          strokeWidth="4"
          className="stroke-[color-mix(in_oklab,var(--text-primary)_9%,transparent)]"
        />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={`${v} 1`}
          className="office-gauge"
        />
      </svg>
      <span className="relative text-[0.625rem] font-semibold tabular-nums">
        {children ?? `${Math.round(v * 100)}%`}
      </span>
    </span>
  );
}

/** Placeholder while a section streams in. */
export function SectionSkeleton({ rows = 2, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4", className)} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="office-skeleton h-56" />
      ))}
    </div>
  );
}
