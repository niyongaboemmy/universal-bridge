import "server-only";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import type { IntakeView } from "@/lib/cms/academy";
import type { Program } from "@/payload-types";

export const dateFmt = (iso: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "rw" ? "en-GB" : locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Kigali",
  }).format(new Date(iso));

export async function feeLabel(p: Program, locale: Locale) {
  const t = await getTranslations({ locale, namespace: "academyPages" });
  if (p.fee?.isFree) return t("free");
  if (!p.fee?.amount) return t("feeOnRequest");
  return new Intl.NumberFormat(locale === "rw" ? "en" : locale, {
    style: "currency",
    currency: p.fee.currency ?? "RWF",
    maximumFractionDigits: 0,
  }).format(p.fee.amount);
}

/** IX-12: "12 seats left · closes in 9 days". */
export async function intakeLabels(i: IntakeView, locale: Locale) {
  const t = await getTranslations({ locale, namespace: "academyPages" });
  return {
    starts: t("starts", { date: dateFmt(i.startDate, locale) }),
    deadline: t("deadline", { date: dateFmt(i.applicationDeadline, locale) }),
    seats: t("seatsLeft", { n: i.seatsLeft }),
    closes: t("closesIn", { n: Math.max(0, i.daysToDeadline) }),
  };
}
