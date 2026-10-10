import { getTranslations } from "next-intl/server";
import { buildFields, engineCopy } from "@/components/forms/engine-copy";
import { FormEngine } from "@/components/forms/FormEngine";
import type { Locale } from "@/i18n/routing";
import { openIntakes } from "@/lib/cms/academy";
import { countryOptions } from "@/lib/forms/options";
import { callingCodes } from "@/lib/forms/phone";
import type { Program } from "@/payload-types";
import { submitAcademyApplication, submitInternshipApplication } from "./actions";
import { dateFmt } from "./format";
import { EDUCATION, GENDERS, MODES, SOURCES, STATUSES, TRACKS, YEARS } from "./options";

const turnstile = () => process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined;

/** FR-ACA-05: 4-step academy application (You → Background → Program → Review). */
export async function AcademyApplyForm({
  locale,
  programSlug,
}: {
  locale: Locale;
  programSlug?: string;
}) {
  const [copy, t, s, intakes] = await Promise.all([
    engineCopy(locale, { academy: true }),
    getTranslations({ locale, namespace: "academyPages" }),
    getTranslations({ locale, namespace: "steps" }),
    openIntakes(locale),
  ]);
  const list = programSlug
    ? intakes.filter((i) => (i.program as Program).slug === programSlug)
    : intakes;
  const intakeOptions = list.map((i) => ({
    value: String(i.id),
    label: `${(i.program as Program).title} — ${i.label} (${dateFmt(i.startDate, locale)})${i.full ? ` · ${t("joinWaitlist")}` : ""}`,
  }));
  const fields = await buildFields(locale, [
    { name: "name", type: "text", required: true, autoComplete: "name" },
    { name: "email", type: "email", required: true, autoComplete: "email" },
    { name: "phone", type: "phone" },
    { name: "dateOfBirth", type: "date", required: true, autoComplete: "bday" },
    { name: "gender", type: "select", options: GENDERS },
    { name: "country", type: "select", options: countryOptions(locale) },
    { name: "district", type: "text", autoComplete: "address-level2" },
    { name: "guardianName", type: "text", required: true, showIf: { under18: "dateOfBirth" } },
    {
      name: "guardianConsent",
      type: "checkbox",
      required: true,
      showIf: { under18: "dateOfBirth" },
    },
    { name: "educationLevel", type: "select", required: true, options: EDUCATION },
    { name: "currentStatus", type: "radio", required: true, options: STATUSES },
    { name: "intake", type: "select", required: true, options: intakeOptions, full: true },
    { name: "preferredMode", type: "radio", required: true, options: MODES },
    { name: "motivation", type: "textarea", required: true, hint: true, full: true },
    { name: "source", type: "select", options: SOURCES },
  ]);
  return (
    <FormEngine
      schemaKey="academy"
      action={submitAcademyApplication}
      idPrefix="apply"
      locale={locale}
      copy={copy}
      fields={fields}
      callingCodes={callingCodes()}
      draftKey="ub-draft-academy"
      queryDefaults={["intake"]}
      defaults={list.length === 1 ? { intake: String(list[0]!.id) } : {}}
      review
      steps={[
        {
          id: "you",
          title: s("you"),
          fields: [
            "name",
            "email",
            "phone",
            "dateOfBirth",
            "gender",
            "country",
            "district",
            "guardianName",
            "guardianConsent",
          ],
        },
        { id: "background", title: s("background"), fields: ["educationLevel", "currentStatus"] },
        {
          id: "program",
          title: s("program"),
          fields: ["intake", "preferredMode", "motivation", "source"],
        },
      ]}
      turnstileSiteKey={turnstile()}
    />
  );
}

/** FR-ACA-04: internship application with CV upload. */
export async function InternshipForm({ locale }: { locale: Locale }) {
  const copy = await engineCopy(locale, { academy: true });
  const fields = await buildFields(locale, [
    { name: "track", type: "radio", required: true, options: TRACKS },
    { name: "name", type: "text", required: true, autoComplete: "name" },
    { name: "email", type: "email", required: true, autoComplete: "email" },
    { name: "phone", type: "phone" },
    { name: "institution", type: "text", required: true, autoComplete: "organization" },
    { name: "fieldOfStudy", type: "text", required: true },
    { name: "yearOfStudy", type: "select", required: true, options: YEARS },
    { name: "availability", type: "date", required: true },
    { name: "cv", type: "file", required: true },
    { name: "portfolio", type: "url" },
    { name: "motivation", type: "textarea", required: true, hint: true, full: true },
  ]);
  return (
    <FormEngine
      schemaKey="internship"
      action={submitInternshipApplication}
      idPrefix="intern"
      locale={locale}
      copy={copy}
      fields={fields}
      callingCodes={callingCodes()}
      draftKey="ub-draft-internship"
      turnstileSiteKey={turnstile()}
    />
  );
}
