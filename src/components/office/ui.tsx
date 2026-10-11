import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CountUp } from "./CountUp";

/** Building blocks for the Company dashboard (server components, no client JS). */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-heading-lg tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-body-sm text-fg-secondary">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Card({
  title,
  action,
  children,
  className,
  pad = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <section className={cn("rounded-2xl border border-subtle bg-surface shadow-1", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-subtle px-5 py-3.5">
          <h2 className="text-body-sm font-semibold">{title}</h2>
          {action}
        </div>
      )}
      <div className={pad ? "p-5" : undefined}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  change,
  hint,
  href,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: ReactNode;
  change?: number;
  hint?: ReactNode;
  href?: string;
  tone?: "neutral" | "warn" | "good";
  icon?: ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-body-sm text-fg-secondary">{label}</p>
        {icon && (
          <span className="grid size-8 place-items-center rounded-lg bg-accent-soft text-accent [&_svg]:size-4">
            {icon}
          </span>
        )}
      </div>
      <p
        className={cn(
          "mt-2 font-display text-heading-lg tracking-tight",
          tone === "warn" && "text-[var(--accent-spark-text)]",
          tone === "good" && "text-success",
        )}
      >
        {typeof value === "number" ? <CountUp value={value} /> : value}
      </p>
      <div className="mt-1 flex items-center gap-2 text-[0.8125rem] text-fg-muted">
        {change !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              change > 0 ? "text-success" : change < 0 ? "text-danger" : "text-fg-muted",
            )}
          >
            {change > 0 ? (
              <ArrowUpRight className="size-3.5" aria-hidden />
            ) : change < 0 ? (
              <ArrowDownRight className="size-3.5" aria-hidden />
            ) : null}
            {change > 0 ? "+" : ""}
            {change}%
          </span>
        )}
        {hint}
      </div>
    </>
  );
  const cls =
    "block min-w-0 rounded-2xl border border-subtle bg-surface p-4 shadow-1 transition-[border-color,box-shadow,translate] duration-200 sm:p-5";
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

export function BarList({
  items,
  empty = "No data yet.",
  format = (n: number) => String(n),
}: {
  items: { key?: string | number; label: string; value: number; sub?: string; href?: string }[];
  empty?: string;
  format?: (n: number) => string;
}) {
  if (!items.length) return <p className="text-body-sm text-fg-muted">{empty}</p>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-1.5">
      {items.map((i) => (
        <li
          key={i.key ?? i.label}
          className="relative flex items-center justify-between gap-3 overflow-hidden rounded-lg px-3 py-1.5 text-body-sm"
        >
          <span
            aria-hidden
            className="office-bar absolute inset-y-0 left-0 rounded-lg bg-accent-soft"
            style={{ width: `${(i.value / max) * 100}%` }}
          />
          <span className="relative min-w-0 truncate">
            {i.href ? (
              <a href={i.href} className="hover:text-accent" target="_blank" rel="noreferrer">
                {i.label}
              </a>
            ) : (
              i.label
            )}
            {i.sub && <span className="ml-2 text-fg-muted">{i.sub}</span>}
          </span>
          <span className="relative shrink-0 font-medium tabular-nums">{format(i.value)}</span>
        </li>
      ))}
    </ul>
  );
}

const TONES = {
  neutral: "bg-[var(--bg-sunken)] text-fg-secondary",
  blue: "bg-accent-soft text-accent",
  orange:
    "bg-[color-mix(in_oklab,var(--accent-spark)_16%,transparent)] text-[var(--accent-spark-text)]",
  green: "bg-[color-mix(in_oklab,var(--success)_14%,transparent)] text-success",
  red: "bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] text-danger",
} as const;
export type Tone = keyof typeof TONES;

export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.75rem] font-medium capitalize",
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

export const STATUS_TONE: Record<string, Tone> = {
  new: "orange",
  received: "orange",
  contacted: "blue",
  review: "blue",
  qualified: "blue",
  shortlisted: "blue",
  proposal: "blue",
  won: "green",
  accepted: "green",
  lost: "neutral",
  rejected: "neutral",
  waitlisted: "neutral",
  planning: "neutral",
  active: "blue",
  "on-hold": "orange",
  done: "green",
  cancelled: "neutral",
  "on-track": "green",
  "at-risk": "orange",
  "off-track": "red",
  "on-leave": "orange",
  left: "neutral",
};

export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-strong px-6 py-14 text-center">
      <p className="font-medium">{title}</p>
      {body && <p className="mt-1 max-w-md text-body-sm text-fg-secondary">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Tabs({
  items,
  current,
}: {
  items: { href: string; label: string; count?: number }[];
  current: string;
}) {
  return (
    <nav className="flex flex-wrap gap-1 rounded-xl border border-subtle bg-surface p-1">
      {items.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          aria-current={t.href === current ? "page" : undefined}
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-body-sm font-medium text-fg-secondary transition-colors hover:text-fg aria-[current=page]:bg-accent aria-[current=page]:text-on-accent"
        >
          {t.label}
          {t.count !== undefined && <span className="tabular-nums opacity-70">{t.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

export const btn =
  "inline-flex h-10 items-center gap-1.5 rounded-full border border-subtle bg-surface px-3.5 shadow-1 text-body-sm font-medium transition-colors hover:border-strong";
export const btnPrimary =
  "inline-flex h-10 items-center gap-1.5 rounded-full bg-spark px-4 shadow-1 text-body-sm font-medium text-on-spark transition-colors hover:bg-spark-hover";
