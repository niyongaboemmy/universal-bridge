"use server";

import { saveApplication } from "@/lib/forms/application";
import { toE164 } from "@/lib/forms/phone";
import { fail, handleSubmission } from "@/lib/forms/submit";
import type { FormState } from "@/lib/forms/types";
import { partnerSchema } from "./schema";

/** FR-PRT-01: partner / agent application. */
export async function submitPartnerApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission({
    formData,
    schema: partnerSchema,
    scope: "partner",
    emailField: "email",
    refine: (data) => {
      const phone = toE164(data.phone, data.phoneCountry || "RW");
      if (phone === false) return fail("phone", "phone");
      return { data: { ...data, phone: phone ?? undefined } };
    },
    save: async ({ data, req, meta }) => {
      const { consent: _c, acceptsConditions: _a, ...answers } = data;
      return saveApplication({
        req,
        meta,
        type: "partner",
        subject: `Agent programme — ${data.tier}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        data: { ...answers, acceptedConditionsAt: new Date().toISOString() },
        summary: [
          ["Tier", data.tier],
          ["Profession", data.profession],
          ["Location", data.location],
        ],
      });
    },
  });
}
