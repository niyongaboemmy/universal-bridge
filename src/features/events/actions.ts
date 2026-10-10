"use server";

import { payload as getPayload } from "@/lib/cms/payload";
import { saveApplication } from "@/lib/forms/application";
import { toE164 } from "@/lib/forms/phone";
import { fail, handleSubmission } from "@/lib/forms/submit";
import type { FormState } from "@/lib/forms/types";
import { eventSchema } from "./schema";

/** FR-EVT-01 registration; refused once registration closes or the event has started. */
export async function registerForEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  let ev: { id: number; title: string; capacity?: number | null } | undefined;
  return handleSubmission({
    formData,
    schema: eventSchema,
    scope: "event",
    emailField: "email",
    refine: async (data) => {
      const p = await getPayload();
      const doc = await p
        .findByID({ collection: "events", id: Number(data.event), depth: 0, overrideAccess: false })
        .catch(() => null);
      if (!doc || !doc.registration?.open || new Date(doc.startAt) < new Date())
        return fail("event", "intakeClosed");
      if (doc.registration.capacity) {
        const taken = await p.count({
          collection: "applications",
          where: { event: { equals: doc.id } },
          overrideAccess: true,
        });
        if (taken.totalDocs >= doc.registration.capacity) return fail("event", "intakeClosed");
      }
      ev = { id: doc.id, title: doc.title };
      const phone = toE164(data.phone, data.phoneCountry || "RW");
      if (phone === false) return fail("phone", "phone");
      return { data: { ...data, phone: phone ?? undefined } };
    },
    save: async ({ data, req, meta }) => {
      const { consent: _c, ...answers } = data;
      return saveApplication({
        req,
        meta,
        type: "event",
        subject: ev!.title,
        name: data.name,
        email: data.email,
        phone: data.phone,
        data: answers,
        event: ev!.id,
        summary: [
          ["Organisation", data.organisation || "—"],
          ["Team", data.teamName || "—"],
        ],
      });
    },
  });
}
