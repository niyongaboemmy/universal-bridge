import "server-only";
import type { Locale } from "@/i18n/routing";
import type { Intake, Program } from "@/payload-types";
import { cached } from "./cached";
import { payload } from "./payload";

export type IntakeView = Intake & {
  seatsLeft: number;
  full: boolean;
  open: boolean;
  daysToDeadline: number;
};

/** IX-12 / FR-ACA-06: seats left, full, open — computed from capacity and dates. */
export function intakeView(i: Intake, now = new Date()): IntakeView {
  const seatsLeft = Math.max(0, (i.capacity ?? 0) - (i.accepted ?? 0));
  const deadline = new Date(i.applicationDeadline);
  deadline.setUTCHours(23, 59, 59, 999);
  const open = i.status !== "closed" && deadline >= now;
  return {
    ...i,
    seatsLeft,
    full: seatsLeft === 0,
    open,
    daysToDeadline: Math.ceil((deadline.getTime() - now.getTime()) / 86_400_000),
  };
}

/** Upcoming intakes (all programs), soonest first. Cached by the intakes tag. */
export const getUpcomingIntakes = cached(
  async (locale: Locale): Promise<Intake[]> => {
    const res = await (
      await payload()
    ).find({
      collection: "intakes",
      locale,
      where: { status: { equals: "open" } },
      sort: "startDate",
      depth: 1,
      limit: 100,
      pagination: false,
    });
    return res.docs;
  },
  ["intakes-upcoming"],
  () => ["intakes", "programs"],
);

export async function openIntakes(locale: Locale, now = new Date()) {
  return (await getUpcomingIntakes(locale))
    .map((i) => intakeView(i, now))
    .filter(
      (i) =>
        i.open && typeof i.program === "object" && (i.program as Program)._status === "published",
    );
}
