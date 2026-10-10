"use server";

import { saveApplication } from "@/lib/forms/application";
import { toE164 } from "@/lib/forms/phone";
import { fail, handleSubmission, type Refined } from "@/lib/forms/submit";
import type { FormState } from "@/lib/forms/types";
import { payload as getPayload } from "@/lib/cms/payload";
import { intakeView } from "@/lib/cms/academy";
import type { Program } from "@/payload-types";
import { academySchema, internshipSchema } from "./schema";

const phoneRefine = <T extends { phone?: string; phoneCountry?: string }>(data: T): Refined<T> => {
  const phone = toE164(data.phone, data.phoneCountry || "RW");
  if (phone === false) return fail("phone", "phone");
  return { data: { ...data, phone: phone ?? undefined } };
};

/** FR-ACA-05/06: academy application; full intakes go to the waitlist. */
export async function submitAcademyApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  let intakeInfo: { program: Program; label: string; id: number; full: boolean } | undefined;
  return handleSubmission({
    formData,
    schema: academySchema,
    scope: "academy",
    emailField: "email",
    refine: async (data) => {
      const p = await getPayload();
      const intake = await p
        .findByID({
          collection: "intakes",
          id: Number(data.intake),
          depth: 1,
          overrideAccess: true,
        })
        .catch(() => null);
      if (!intake || typeof intake.program !== "object") return fail("intake", "intakeClosed");
      const view = intakeView(intake);
      if (!view.open) return fail("intake", "intakeClosed");
      intakeInfo = {
        program: intake.program as Program,
        label: intake.label,
        id: intake.id,
        full: view.full,
      };
      return phoneRefine(data);
    },
    save: async ({ data, req, meta }) => {
      const { consent: _c, guardianConsent: _g, ...answers } = data;
      return saveApplication({
        req,
        meta,
        type: "academy",
        subject: `${intakeInfo!.program.title} — ${intakeInfo!.label}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        data: answers,
        program: intakeInfo!.program.id,
        intake: intakeInfo!.id,
        waitlisted: intakeInfo!.full,
        guardian: data.guardianName || undefined,
        summary: [
          ["Mode", data.preferredMode],
          ["Education", data.educationLevel],
          ["Status", data.currentStatus],
          ["Date of birth", data.dateOfBirth],
          ...(data.guardianName ? ([["Guardian", data.guardianName]] as [string, string][]) : []),
        ],
      });
    },
  });
}

/** FR-ACA-04: internship application with CV (FR-FORM-08). */
export async function submitInternshipApplication(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission({
    formData,
    schema: internshipSchema,
    scope: "internship",
    emailField: "email",
    files: [{ name: "cv", required: true }],
    refine: phoneRefine,
    save: async ({ data, req, meta, uploads }) => {
      const { consent: _c, cv: _cv, ...answers } = data;
      return saveApplication({
        req,
        meta,
        type: "internship",
        subject: `Internship — ${data.track}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        data: answers,
        uploads,
        summary: [
          ["Track", data.track],
          ["Institution", data.institution],
          ["Field", data.fieldOfStudy],
          ["Year", data.yearOfStudy],
          ["Available from", data.availability],
        ],
      });
    },
  });
}
