import { buildFields, engineCopy } from "@/components/forms/engine-copy";
import { FormEngine } from "@/components/forms/FormEngine";
import type { Locale } from "@/i18n/routing";
import { callingCodes } from "@/lib/forms/phone";
import { submitPartnerApplication } from "./actions";
import { PARTNER_GENDERS, TIERS } from "./schema";

/** FR-PRT-01: agent / partner application. */
export async function PartnerForm({ locale }: { locale: Locale }) {
  const copy = await engineCopy(locale);
  const fields = await buildFields(locale, [
    { name: "tier", type: "radio", required: true, options: TIERS },
    { name: "name", type: "text", required: true, autoComplete: "name" },
    { name: "email", type: "email", required: true, autoComplete: "email" },
    { name: "phone", type: "phone" },
    { name: "gender", type: "select", options: PARTNER_GENDERS },
    { name: "location", type: "text", required: true },
    { name: "profession", type: "text", required: true, autoComplete: "organization-title" },
    { name: "network", type: "textarea", required: true, hint: true, full: true },
    { name: "acceptsConditions", type: "checkbox", required: true },
  ]);
  return (
    <FormEngine
      schemaKey="partner"
      action={submitPartnerApplication}
      idPrefix="partner"
      locale={locale}
      copy={copy}
      fields={fields}
      callingCodes={callingCodes()}
      queryDefaults={["tier"]}
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined}
    />
  );
}
