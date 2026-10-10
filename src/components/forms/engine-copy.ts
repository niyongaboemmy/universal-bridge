import "server-only";
import { getTranslations } from "next-intl/server";
import { baseFormCopy } from "@/features/contact/copy";
import { localizePath, type Locale } from "@/i18n/routing";
import type { EngineCopy, EngineField, Option } from "./FormEngine";

/** All engine copy, translated on the server (no i18n runtime in the browser). */
export async function engineCopy(
  locale: Locale,
  { academy = false }: { academy?: boolean } = {},
): Promise<EngineCopy> {
  const [f, a, st] = await Promise.all([
    getTranslations({ locale, namespace: "form" }),
    getTranslations({ locale, namespace: "apply" }),
    getTranslations({ locale, namespace: "steps" }),
  ]);
  const consent = f.raw("consentLabel") as string;
  const [before = "", rest = ""] = consent.split("<link>");
  const [link = "", after = ""] = rest.split("</link>");
  const base = await baseFormCopy(locale);
  const errorKeys = ["under18Guardian", "url", "date", "intakeClosed", "mustAccept"] as const;
  return {
    ...base,
    errors: {
      ...base.errors,
      ...Object.fromEntries(errorKeys.map((k) => [k, f.raw(`errors.${k}`) as string])),
    },
    next: a("next"),
    back: a("back"),
    review: a("review"),
    reviewShort: st("review"),
    reviewLead: a("reviewLead"),
    edit: a("edit"),
    step: a.raw("step") as string,
    saved: a("saved"),
    restored: a("restored"),
    restore: a("restore"),
    discard: a("discard"),
    file: {
      choose: a("file.choose"),
      drop: a("file.drop"),
      types: a("file.types"),
      remove: a("file.remove"),
      selected: a.raw("file.selected") as string,
    },
    successTitle: a("receivedTitle"),
    successBody: a("receivedBody"),
    waitlistTitle: a("waitlistTitle"),
    waitlistBody: a("waitlistBody"),
    reference: f.raw("reference") as string,
    consentBefore: before,
    consentLink: link,
    consentAfter: after,
    privacyHref: localizePath("/legal/privacy", locale),
    ...(academy
      ? { terms: { href: localizePath("/legal/academy-terms", locale), label: a("academyTerms") } }
      : {}),
    choose: f("choose"),
    under18: a("under18"),
  };
}

type FieldSpec = Omit<EngineField, "label" | "hint" | "options"> & {
  hint?: boolean;
  options?: readonly string[] | Option[];
};

/**
 * Build engine fields with translated labels (fields.<name>), hints
 * (fields.<name>Hint) and option labels (options.<name>.<value>).
 */
export async function buildFields(locale: Locale, specs: FieldSpec[]): Promise<EngineField[]> {
  const [t, o, sources] = await Promise.all([
    getTranslations({ locale, namespace: "fields" }),
    getTranslations({ locale, namespace: "options" }),
    getTranslations({ locale, namespace: "form.sources" }),
  ]);
  return specs.map((s) => ({
    ...s,
    label: t(s.name as "fullName"),
    hint: s.hint ? t(`${s.name}Hint` as "fullName") : undefined,
    options: s.options?.map((v) =>
      typeof v === "object"
        ? v
        : {
            value: v,
            label:
              s.name === "source" ? sources(v as "search") : o(`${s.name}.${v}` as "gender.male"),
          },
    ),
  }));
}
