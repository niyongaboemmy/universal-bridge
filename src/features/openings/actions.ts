"use server";

import * as z from "zod/mini";
import type { OpeningField } from "@/collections/Openings";
import { memberRoleId } from "@/collections/Members";
import { isLocale } from "@/i18n/routing";
import { audit } from "@/lib/audit";
import { payload } from "@/lib/cms/payload";
import { saveApplication } from "@/lib/forms/application";
import {
  email,
  optionalCheckbox,
  optionalPhone,
  optionalText,
  optionalUrl,
  requiredConsent,
  requiredText,
} from "@/lib/forms/schema-helpers";
import { handleSubmission } from "@/lib/forms/submit";
import type { FormState } from "@/lib/forms/types";
import type { Opening } from "@/payload-types";
import { currentMember } from "../account/session";
import { isAccepting } from "./data";

const choices = (f: OpeningField) =>
  (f.options ?? "")
    .split("\n")
    .map((o) => o.trim())
    .filter(Boolean);

/** Validation for one question, from how it was built in the office. */
function fieldSchema(f: OpeningField): z.ZodMiniType {
  const req = Boolean(f.required);
  switch (f.type) {
    case "textarea":
      return req ? requiredText(2, 5000) : optionalText(5000);
    case "email":
      return req
        ? email()
        : z.optional(
            z.string().check(z.trim(), z.regex(/^$|^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "email")),
          );
    case "tel":
      return req
        ? z.string("required").check(z.trim(), z.regex(/^[+\d\s().-]{6,20}$/, "phone"))
        : optionalPhone();
    case "url":
      return req
        ? z.string("required").check(z.trim(), z.regex(/^https?:\/\/[^\s.]+\.[^\s]{2,}$/i, "url"))
        : optionalUrl();
    case "number":
      return req
        ? z.string("required").check(z.trim(), z.regex(/^-?\d+(\.\d+)?$/, "required"))
        : z.optional(z.string().check(z.trim(), z.regex(/^$|^-?\d+(\.\d+)?$/, "required")));
    case "date":
      return req
        ? z.string("required").check(z.regex(/^\d{4}-\d{2}-\d{2}$/, "date"))
        : z.optional(z.string().check(z.regex(/^$|^\d{4}-\d{2}-\d{2}$/, "date")));
    case "select":
    case "radio": {
      const opts = choices(f);
      const one = z.string("required").check(z.refine((v) => opts.includes(v), "required"));
      return req ? one : z.optional(z.union([z.literal(""), one]));
    }
    case "checkbox":
      return req
        ? z.unknown().check(z.refine((v) => v === "on" || v === "true" || v === true, "mustAccept"))
        : optionalCheckbox();
    default:
      return req ? requiredText(1, 500) : optionalText(500);
  }
}

/** Apply through an opening's own form (public). Signed-in members are linked and promoted. */
export async function applyToOpening(_prev: FormState, formData: FormData): Promise<FormState> {
  const slug = String(formData.get("opening") ?? "");
  const localeRaw = String(formData.get("locale") ?? "en");
  const locale = isLocale(localeRaw) ? localeRaw : "en";
  const p = await payload();
  // Read fresh (not cached): the status or deadline may have just changed.
  const opening = (
    await p.find({
      collection: "openings",
      where: { slug: { equals: slug } },
      locale,
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
  ).docs[0] as Opening | undefined;
  if (!opening || !isAccepting(opening)) return { status: "error", formError: "closed" };
  const member = await currentMember();
  if (opening.requireAccount && !member) return { status: "error", formError: "signIn" };

  const custom = ((opening.fields ?? []) as OpeningField[]).filter((f) => f.key);
  const shape: Record<string, z.ZodMiniType> = {
    name: requiredText(2, 120),
    email: email(),
    phone: optionalPhone(),
    consent: requiredConsent(),
  };
  for (const f of custom) if (f.type !== "file") shape[`q_${f.key}`] = fieldSchema(f);

  return handleSubmission({
    formData,
    schema: z.object(shape),
    scope: "apply",
    emailField: "email",
    files: custom
      .filter((f) => f.type === "file")
      .map((f) => ({ name: `q_${f.key}`, required: Boolean(f.required) })),
    save: async ({ data, req, meta, uploads }) => {
      const d = data as Record<string, unknown>;
      const answers = Object.fromEntries(
        custom.filter((f) => f.type !== "file").map((f) => [f.key, d[`q_${f.key}`] ?? null]),
      );
      const rel = (v: unknown) =>
        typeof v === "object" && v
          ? (v as { id: number }).id
          : ((v as number | undefined) ?? undefined);
      const saved = await saveApplication({
        req,
        meta,
        type: opening.kind,
        subject: opening.title,
        name: String(d.name),
        email: String(d.email),
        phone: (d.phone as string) || null,
        data: { opening: opening.slug, answers },
        uploads,
        program: rel(opening.program),
        intake: rel(opening.intake),
        job: rel(opening.job),
        event: rel(opening.event),
        opening: opening.id,
        member: member?.id,
        summary: custom
          .filter((f) => f.type !== "file")
          .map((f) => [f.label, String(answers[f.key] ?? "—")] as [string, string]),
      });
      // First application: a visitor becomes an applicant.
      if (member) {
        const [applicant, visitor] = await Promise.all([
          memberRoleId(req, "applicant"),
          memberRoleId(req, "default"),
        ]);
        const current = typeof member.role === "object" ? member.role?.id : member.role;
        if (applicant && current !== applicant && (!current || current === visitor)) {
          await req.payload.update({
            collection: "members",
            id: member.id,
            data: { role: applicant },
            overrideAccess: true,
            req,
          });
          await audit({ ...req, user: { ...member, collection: "members" } } as never, {
            action: "member.promote",
            entity: "members",
            entityId: member.id,
            meta: { to: "applicant" },
          });
        }
      }
      return saved;
    },
  });
}
