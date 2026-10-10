import "server-only";
import { getTranslations } from "next-intl/server";
import type { FormCopy } from "@/components/forms/copy";
import { icuPluralForms } from "@/lib/i18n-plural";
import { localizePath, type Locale } from "@/i18n/routing";
import type { ContactFormCopy } from "./ContactForm";
import { BUDGETS, DEPARTMENTS, SOURCES, TIMELINES } from "./schema";

/** Shared form copy, translated on the server (no i18n runtime in the browser). */
export async function baseFormCopy(locale: Locale): Promise<FormCopy> {
  const t = await getTranslations({ locale, namespace: "form" });
  const errors = [
    "required",
    "email",
    "phone",
    "tooShort",
    "tooLong",
    "consent",
    "chooseOne",
    "fileType",
    "fileSize",
  ] as const;
  const summary = icuPluralForms(t.raw("errorSummary") as string);
  return {
    required: t("required"),
    optional: t("optional"),
    submit: t("submit"),
    submitting: t("submitting"),
    errorSummaryOne: summary.one,
    errorSummaryOther: summary.other,
    genericError: t("genericError"),
    rateLimited: t("rateLimited"),
    botCheckFailed: t("botCheckFailed"),
    errors: Object.fromEntries(errors.map((k) => [k, t.raw(`errors.${k}`) as string])),
  };
}

export async function contactFormCopy(locale: Locale): Promise<ContactFormCopy> {
  const t = await getTranslations({ locale, namespace: "form" });
  // Split "…<link>privacy policy</link>…" into three parts for a real anchor.
  const consent = t.raw("consentLabel") as string;
  const [before = "", rest = ""] = consent.split("<link>");
  const [link = "", after = ""] = rest.split("</link>");
  const pick = <T extends readonly string[]>(group: string, keys: T) =>
    Object.fromEntries(keys.map((k) => [k, t(`${group}.${k}` as "fields.name")])) as Record<
      string,
      string
    >;
  return {
    ...(await baseFormCopy(locale)),
    fields: pick("fields", [
      "name",
      "email",
      "workEmail",
      "company",
      "country",
      "phone",
      "department",
      "services",
      "budget",
      "timeline",
      "message",
      "messageHint",
      "source",
      "consent",
    ] as const),
    departments: pick("departments", DEPARTMENTS),
    budgets: pick("budgets", BUDGETS),
    timelines: pick("timelines", TIMELINES),
    sources: pick("sources", SOURCES),
    consentBefore: before,
    consentLink: link,
    consentAfter: after,
    marketing: t("marketingLabel"),
    privacyHref: localizePath("/legal/privacy", locale),
    connectedTitle: t("connectedTitle"),
    connectedBody: t("connectedBody"),
    reference: t.raw("reference") as string,
    sendAnother: t("sendAnother"),
    moreDetails: t("moreDetails"),
    sooner: t("sooner"),
    bookCall: t("bookCall"),
    bookHref: localizePath("/book", locale),
    choose: t("choose"),
  };
}
