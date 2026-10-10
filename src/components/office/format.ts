/** Formatting helpers for the Company dashboard (Kigali time, English UI). */
export const TZ = "Africa/Kigali";

export function timeAgo(iso?: string | null, now = Date.now()) {
  if (!iso) return "—";
  const s = Math.round((now - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} d ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  });
}

export const fmtDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: TZ,
      })
    : "—";

export const fmtNumber = (n: number) => new Intl.NumberFormat("en-US").format(Math.round(n));

export function fmtMoney(n?: number | null, currency = "RWF") {
  if (n === null || n === undefined) return "—";
  if (currency === "RWF")
    return `${new Intl.NumberFormat("en-US", { notation: n >= 1e6 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n)} RWF`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: n >= 1e6 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Change against the previous period; undefined when there is nothing to compare with. */
export function delta(now: number, prev: number): number | undefined {
  if (!prev) return undefined;
  return Math.round(((now - prev) / prev) * 100);
}

/** Hours since a date: drives SLA colours on cards. */
export const hoursSince = (iso?: string | null, now = Date.now()) =>
  iso ? (now - new Date(iso).getTime()) / 3600000 : 0;

export const titleCase = (s?: string | null) =>
  s ? s.replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "";
