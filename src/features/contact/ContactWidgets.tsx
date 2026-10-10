"use client";

import { Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNow, useTimeZone } from "@/lib/hooks/client-stores";
import { isOpenNow, KIGALI_TZ, workingOverlap, type OfficeHours } from "@/lib/time/office-hours";
import { cx as cn } from "@/lib/cx";

/** Copy email/phone: icon swaps to a check, announced politely (UI/UX §11). */
export function CopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {}
      }}
      aria-label={`${label}: ${value}`}
      className="inline-flex size-10 items-center justify-center rounded-md text-fg-secondary transition-colors hover:bg-accent-soft hover:text-accent"
    >
      {copied ? (
        <Check aria-hidden className="size-4 text-success" />
      ) : (
        <Copy aria-hidden className="size-4" />
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  );
}

/** Kigali local time + "Open now / Closed now" (computed client-side; the page is static). */
export function KigaliClock({
  hours,
  copy,
}: {
  hours: OfficeHours;
  copy: { open: string; closed: string; time: string };
}) {
  const now = useNow();
  if (!now) return <span className="inline-block h-6" />;
  const open = isOpenNow(hours, now);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: KIGALI_TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
  return (
    <span className="inline-flex flex-wrap items-center gap-2 text-body-sm">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium",
          open
            ? "bg-[color-mix(in_oklch,var(--success)_12%,transparent)] text-fg"
            : "bg-sunken text-fg",
        )}
      >
        <span
          aria-hidden
          className={cn("size-2 rounded-full", open ? "bg-success" : "bg-fg-muted")}
        />
        {open ? copy.open : copy.closed}
      </span>
      <span className="font-mono text-fg-secondary tabular">
        {copy.time.replace("{time}", time)}
      </span>
    </span>
  );
}

/**
 * IX-03 "Your hours ↔ Kigali hours". Reads the visitor's time zone from the
 * browser (nothing is sent or stored) and draws both working days on one
 * 24-hour track in Kigali time.
 */
export function HoursOverlap({
  hours,
  copy,
}: {
  hours: OfficeHours;
  copy: {
    title: string;
    you: string;
    kigali: string;
    summary: { zero: string; one: string; other: string };
  };
}) {
  const tz = useTimeZone();
  if (!tz) return <div className="h-[132px]" aria-hidden />;
  const o = workingOverlap(tz, new Date(), hours);
  const zone = tz.split("/").pop()?.replace(/_/g, " ") ?? tz;
  const pct = (h: number) => `${(((h % 24) + 24) % 24) / 0.24}%`;
  const span = (start: number, end: number): ReactNode => {
    // A window may wrap past midnight in Kigali time.
    const s = ((start % 24) + 24) % 24;
    const len = end - start;
    if (s + len <= 24)
      return (
        <span
          className="absolute inset-y-0 rounded-full"
          style={{ left: pct(s), width: `${len / 0.24}%` }}
        />
      );
    return (
      <>
        <span
          className="absolute inset-y-0 rounded-full"
          style={{ left: pct(s), width: `${(24 - s) / 0.24}%` }}
        />
        <span
          className="absolute inset-y-0 rounded-full"
          style={{ left: 0, width: `${(s + len - 24) / 0.24}%` }}
        />
      </>
    );
  };
  const summary = (
    o.hours === 0 ? copy.summary.zero : o.hours === 1 ? copy.summary.one : copy.summary.other
  ).replace("{count}", String(o.hours));
  return (
    <div>
      <h3 className="font-display text-heading-md">{copy.title}</h3>
      <div className="mt-4 space-y-3" aria-hidden>
        <div>
          <p className="mb-1 text-body-sm text-fg-secondary">{copy.kigali}</p>
          <div className="relative h-3 rounded-full bg-sunken [&>span]:bg-accent">
            {span(hours.openHour, hours.closeHour)}
          </div>
        </div>
        <div>
          <p className="mb-1 text-body-sm text-fg-secondary">{copy.you.replace("{zone}", zone)}</p>
          <div className="relative h-3 rounded-full bg-sunken [&>span]:bg-spark">
            {span(o.visitorStartInKigali, o.visitorEndInKigali)}
          </div>
        </div>
        <div className="flex justify-between font-mono text-[0.75rem] text-fg-muted">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
      </div>
      <p className="mt-3 font-medium">{summary}</p>
    </div>
  );
}
