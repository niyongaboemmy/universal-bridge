import "server-only";
import type { PayloadRequest } from "payload";
import type { ApplicationEmailData } from "@/emails/application";
import { formTranslator } from "@/emails/translator";
import { audit } from "@/lib/audit";
import { submissionRef } from "@/lib/ids";
import { enqueue } from "@/lib/outbox";
import { storePrivateFile, type UploadCheck } from "@/lib/uploads";
import type { SubmissionMeta } from "./submit";
import { CONSENT_VERSION } from "./types";

const INBOX = {
  academy: () => process.env.INBOX_ACADEMY,
  internship: () => process.env.INBOX_ACADEMY,
  job: () => process.env.INBOX_CAREERS,
  partner: () => process.env.INBOX_PARTNERS,
  event: () => process.env.INBOX_EVENTS ?? process.env.INBOX_ACADEMY,
} as const;

/**
 * Save any application (SRS §7.2, §11) with its files, emails, team alert and
 * audit entry — all inside the caller's transaction.
 */
export async function saveApplication(args: {
  req: PayloadRequest;
  meta: SubmissionMeta;
  type: ApplicationEmailData["type"];
  subject: string;
  name: string;
  email: string;
  phone?: string | null;
  data: Record<string, unknown>;
  uploads?: Record<string, Extract<UploadCheck, { ok: true }> | undefined>;
  program?: number;
  intake?: number;
  job?: number;
  event?: number;
  waitlisted?: boolean;
  guardian?: string;
  summary: [string, string][];
}): Promise<{ ref: string; waitlisted?: boolean }> {
  const { req, meta } = args;
  const ref = submissionRef("A");
  const fileIds: number[] = [];
  for (const [field, upload] of Object.entries(args.uploads ?? {})) {
    if (upload) fileIds.push((await storePrivateFile(req, upload, field, args.type)).id as number);
  }
  const consentText = String(
    formTranslator(meta.locale).markup("consentLabel", { link: (c) => c }),
  );
  const doc = await req.payload.create({
    collection: "applications",
    overrideAccess: true,
    req,
    data: {
      ref,
      type: args.type,
      status: args.waitlisted ? "waitlisted" : "received",
      subject: args.subject,
      name: args.name,
      email: args.email.toLowerCase(),
      phone: args.phone || undefined,
      program: args.program,
      intake: args.intake,
      job: args.job,
      event: args.event,
      data: args.data,
      files: fileIds,
      botCheck: meta.botCheck === "missing" ? "missing" : "passed",
      tracking: { utm: meta.utm, referrer: meta.referrer, locale: meta.locale },
      consent: {
        text: consentText,
        version: CONSENT_VERSION,
        at: new Date().toISOString(),
        guardian: args.guardian,
      },
    },
  });

  const emailData: ApplicationEmailData = {
    ref,
    type: args.type,
    name: args.name,
    email: args.email,
    subject: args.subject,
    locale: meta.locale,
    waitlisted: args.waitlisted,
    summary: args.summary,
    botCheck: meta.botCheck,
  };
  const adminPath = `/admin/collections/applications/${doc.id}`;
  await enqueue(req, {
    kind: "send-email",
    payload: { template: "application-confirmation", to: args.email, data: emailData },
  });
  await enqueue(req, {
    kind: "send-email",
    payload: {
      template: "application-notification",
      to: INBOX[args.type]() ?? "hello@universalbridge.rw",
      replyTo: args.email,
      data: emailData,
      adminPath,
    },
  });
  await enqueue(req, {
    kind: "notify-team",
    payload: {
      text: `New ${args.type} application ${ref} — ${args.subject}`,
      url: adminPath,
    },
  });
  await audit(req, {
    action: "submit",
    entity: "applications",
    entityId: doc.id,
    meta: { ref, type: args.type },
  });
  return { ref, waitlisted: args.waitlisted };
}
