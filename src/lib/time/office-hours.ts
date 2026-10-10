// Office-hours helpers for "Open now" and the hours-overlap widget (IX-03).
// Pure functions so they can be unit-tested with fixed dates.

export const KIGALI_TZ = "Africa/Kigali";

export type OfficeHours = { openHour: number; closeHour: number; days: number[] };

export const DEFAULT_OFFICE_HOURS: OfficeHours = {
  openHour: 8,
  closeHour: 17,
  days: [1, 2, 3, 4, 5],
};

/** Offset of `timeZone` from UTC at `date`, in minutes (e.g. Kigali → +120). */
export function tzOffsetMinutes(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUtc - date.getTime()) / 60000 / 15) * 15;
}

export function isOpenNow(hours: OfficeHours, now: Date = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: KIGALI_TZ,
    weekday: "short",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    parts.find((p) => p.type === "weekday")?.value ?? "",
  );
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  return hours.days.includes(weekday) && hour >= hours.openHour && hour < hours.closeHour;
}

/**
 * Working-hour overlap between Kigali office hours and a visitor's 9–17 day.
 * Returns whole hours, plus the visitor's window expressed in Kigali hours.
 */
export function workingOverlap(
  visitorTz: string,
  now: Date = new Date(),
  office: OfficeHours = DEFAULT_OFFICE_HOURS,
  visitorDay: { start: number; end: number } = { start: 9, end: 17 },
): { hours: number; visitorStartInKigali: number; visitorEndInKigali: number; diffHours: number } {
  const diffHours = (tzOffsetMinutes(KIGALI_TZ, now) - tzOffsetMinutes(visitorTz, now)) / 60;
  const visitorStartInKigali = visitorDay.start + diffHours;
  const visitorEndInKigali = visitorDay.end + diffHours;
  const overlap = Math.max(
    0,
    Math.min(office.closeHour, visitorEndInKigali) -
      Math.max(office.openHour, visitorStartInKigali),
  );
  return { hours: Math.floor(overlap), visitorStartInKigali, visitorEndInKigali, diffHours };
}

/** Current time for server-rendered pages; pair with `revalidate` so "upcoming" stays fresh. */
export const nowMs = () => Date.now();
