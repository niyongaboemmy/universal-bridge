"use server";

import { formTranslator } from "@/emails/translator";
import { audit } from "@/lib/audit";
import { toE164 } from "@/lib/forms/phone";
import { handleSubmission } from "@/lib/forms/submit";
import { isChecked } from "@/lib/forms/schema-helpers";
import { CONSENT_VERSION, type FormState } from "@/lib/forms/types";
import { submissionRef } from "@/lib/ids";
import { enqueue } from "@/lib/outbox";
import { settings } from "@/lib/settings";
import { contactSchema } from "./schema";

/** Project inquiry / contact form (FR-CON-01/02, SRS §7.2). */
export async function submitContact(_prev: FormState, formData: FormData): Promise<FormState> {
  return handleSubmission({
    formData,
    schema: contactSchema,
    scope: "contact",
    arrayKeys: ["services"],
    emailField: "email",
    refine: (data) => {
      const phone = toE164(data.phone, data.phoneCountry || "RW");
      if (phone === false) return { fieldErrors: { phone: "phone" } };
      return { data: { ...data, phone: phone ?? undefined } };
    },
    save: async ({ data, req, meta }) => {
      const ref = submissionRef("L");
      const consentText = formTranslator(meta.locale).markup("consentLabel", {
        link: (chunks) => chunks,
      });
      const lead = await req.payload.create({
        collection: "leads",
        overrideAccess: true,
        req,
        data: {
          ref,
          status: "new",
          department: data.department,
          name: data.name,
          email: data.email.toLowerCase(),
          company: data.company || undefined,
          country: data.country || undefined,
          phone: data.phone || undefined,
          services: data.department === "sales" ? (data.services ?? []) : [],
          budgetRange: data.department === "sales" ? data.budgetRange || undefined : undefined,
          timeline: data.department === "sales" ? data.timeline || undefined : undefined,
          source: data.source || undefined,
          product: data.product || undefined,
          message: data.message,
          botCheck: meta.botCheck,
          tracking: {
            utm: meta.utm,
            referrer: meta.referrer,
            landingPage: meta.landingPage,
            locale: meta.locale,
          },
          consent: {
            text: String(consentText),
            version: CONSENT_VERSION,
            at: new Date().toISOString(),
            marketing: isChecked(data.marketing),
          },
        },
      });

      const emailData = {
        ref,
        name: data.name,
        email: data.email,
        company: data.company,
        country: data.country,
        phone: data.phone,
        department: data.department,
        services: data.product
          ? [`product:${data.product}`, ...(data.services ?? [])]
          : data.services,
        budgetRange: data.budgetRange,
        timeline: data.timeline,
        message: data.message,
        locale: meta.locale,
        botCheck: meta.botCheck,
      };
      const adminPath = `/admin/collections/leads/${lead.id}`;
      const { inbox } = await settings();
      await enqueue(req, {
        kind: "send-email",
        payload: { template: "lead-confirmation", to: data.email, data: emailData },
      });
      await enqueue(req, {
        kind: "send-email",
        payload: {
          template: "lead-notification",
          to: inbox[data.department] ?? inbox.sales ?? "hello@universalbridge.rw",
          replyTo: data.email,
          data: emailData,
          adminPath,
        },
      });
      await enqueue(req, {
        kind: "notify-team",
        payload: {
          text: `New ${data.department} lead ${ref}`,
          url: adminPath,
        },
      });
      if (data.department === "sales") await enqueue(req, { kind: "crm-sync", payload: emailData });
      await audit(req, {
        action: "submit",
        entity: "leads",
        entityId: lead.id,
        meta: { ref, department: data.department },
      });
      return ref;
    },
  });
}
