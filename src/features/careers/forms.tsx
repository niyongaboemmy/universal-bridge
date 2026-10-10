import { buildFields, engineCopy } from "@/components/forms/engine-copy";
import { FormEngine } from "@/components/forms/FormEngine";
import type { Locale } from "@/i18n/routing";
import { callingCodes } from "@/lib/forms/phone";
import { submitJobApplication } from "./actions";

/** FR-CAR-02/03: job application, or the open application when no job is given. */
export async function JobApplicationForm({ locale, jobId }: { locale: Locale; jobId?: number }) {
  const copy = await engineCopy(locale);
  const fields = await buildFields(locale, [
    ...(jobId ? [] : [{ name: "roleInterest", type: "text" as const, required: true, full: true }]),
    { name: "name", type: "text", required: true, autoComplete: "name" },
    { name: "email", type: "email", required: true, autoComplete: "email" },
    { name: "phone", type: "phone" },
    { name: "location", type: "text", required: true, autoComplete: "address-level2" },
    { name: "linkedin", type: "url" },
    { name: "portfolio", type: "url" },
    { name: "cv", type: "file", required: true },
    { name: "earliestStart", type: "date" },
    { name: "coverNote", type: "textarea", required: true, hint: true, full: true },
  ]);
  return (
    <FormEngine
      schemaKey="job"
      action={submitJobApplication}
      idPrefix={jobId ? `job${jobId}` : "open"}
      locale={locale}
      copy={copy}
      fields={fields}
      hidden={jobId ? { job: String(jobId) } : {}}
      callingCodes={callingCodes()}
      draftKey={jobId ? `ub-draft-job-${jobId}` : "ub-draft-open-application"}
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined}
    />
  );
}
