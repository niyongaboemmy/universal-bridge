"use server";

import { saveApplication } from "@/lib/forms/application";
import { toE164 } from "@/lib/forms/phone";
import { fail, handleSubmission } from "@/lib/forms/submit";
import type { FormState } from "@/lib/forms/types";
import { payload as getPayload } from "@/lib/cms/payload";
import { jobSchema } from "./schema";

/** FR-CAR-02/03: job application or open application, with CV. */
export async function submitJobApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  let job: { id: number; title: string } | undefined;
  return handleSubmission({
    formData,
    schema: jobSchema,
    scope: "job",
    emailField: "email",
    files: [{ name: "cv", required: true }],
    refine: async (data) => {
      if (data.job) {
        const doc = await (
          await getPayload()
        )
          .findByID({ collection: "jobs", id: Number(data.job), depth: 0, overrideAccess: false })
          .catch(() => null);
        if (!doc) return fail("job", "required");
        job = { id: doc.id, title: doc.title };
      } else if (!data.roleInterest) {
        return fail("roleInterest", "required");
      }
      const phone = toE164(data.phone, data.phoneCountry || "RW");
      if (phone === false) return fail("phone", "phone");
      return { data: { ...data, phone: phone ?? undefined } };
    },
    save: async ({ data, req, meta, uploads }) => {
      const { consent: _c, cv: _cv, ...answers } = data;
      return saveApplication({
        req,
        meta,
        type: "job",
        subject: job ? job.title : `Open application — ${data.roleInterest}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        data: answers,
        uploads,
        job: job?.id,
        summary: [
          ["Location", data.location],
          ["LinkedIn", data.linkedin || "—"],
          ["Portfolio", data.portfolio || "—"],
          ["Earliest start", data.earliestStart || "—"],
        ],
      });
    },
  });
}
