import "server-only";
import { sql } from "@payloadcms/db-postgres";
import type { Payload, PayloadRequest } from "payload";
import type { Outbox } from "@/payload-types";
import {
  applicationConfirmationEmail,
  applicationNotificationEmail,
  applicationStatusEmail,
  type ApplicationEmailData,
  type ApplicationStatusEmailData,
} from "@/emails/application";
import { leadConfirmationEmail, leadNotificationEmail, type LeadEmailData } from "@/emails/lead";
import { sendEmail } from "./email/send";
import { siteUrl } from "./utils";

/**
 * ADR-002 transactional outbox. Jobs are written in the same transaction as
 * the submission, then processed by /api/cron/outbox (every minute) or right
 * after the request via `after()`.
 */
export type OutboxJob =
  | {
      kind: "send-email";
      payload: { template: "lead-confirmation"; to: string; data: LeadEmailData };
    }
  | {
      kind: "send-email";
      payload: {
        template: "lead-notification";
        to: string;
        replyTo?: string;
        data: LeadEmailData;
        adminPath: string;
      };
    }
  | {
      kind: "send-email";
      payload: { template: "application-confirmation"; to: string; data: ApplicationEmailData };
    }
  | {
      kind: "send-email";
      payload: {
        template: "application-notification";
        to: string;
        replyTo?: string;
        data: ApplicationEmailData;
        adminPath: string;
      };
    }
  | {
      kind: "send-email";
      payload: { template: "application-status"; to: string; data: ApplicationStatusEmailData };
    }
  | {
      kind: "send-email";
      payload: { template: "raw"; to: string; subject: string; html: string; text: string };
    }
  | { kind: "notify-team"; payload: { text: string; url?: string } }
  | { kind: "scan-upload"; payload: { fileId: number } }
  | { kind: "staff-invite"; payload: { email: string } }
  | { kind: "crm-sync"; payload: Record<string, unknown> };

export const MAX_ATTEMPTS = 5;

/** Backoff after the n-th failed attempt: 1, 2, 4, 8 minutes. */
export const backoffMs = (attempt: number) => 60_000 * 2 ** Math.max(0, attempt - 1);

export async function enqueue(req: PayloadRequest, job: OutboxJob) {
  return req.payload.create({
    collection: "outbox",
    overrideAccess: true,
    req,
    data: {
      kind: job.kind,
      payload: job.payload as Outbox["payload"],
      status: "pending",
      attempts: 0,
      runAfter: new Date().toISOString(),
    },
  });
}

async function scanUpload(payload: Payload, fileId: number) {
  const file = await payload.findByID({
    collection: "private-files",
    id: fileId,
    overrideAccess: true,
  });
  let scanStatus: "clean" | "infected" | "skipped" = "skipped";
  if (process.env.CLAMAV_HOST) {
    const [{ clamScan }, { readPrivateFile }] = await Promise.all([
      import("@/lib/uploads"),
      import("@/lib/storage"),
    ]);
    scanStatus = await clamScan(await readPrivateFile(file.filename!), process.env.CLAMAV_HOST);
  } else if (process.env.NODE_ENV === "production") {
    throw new Error("CLAMAV_HOST is not configured; uploads stay pending until it is");
  }
  await payload.update({
    collection: "private-files",
    id: fileId,
    data: { scanStatus },
    overrideAccess: true,
  });
  if (scanStatus === "infected") {
    // Quarantined: only super admins can still see the record (PrivateFiles access).
    payload.logger.error({ msg: "Infected upload quarantined", fileId });
    await payload.create({
      collection: "outbox",
      overrideAccess: true,
      data: {
        kind: "notify-team",
        payload: {
          text: `An uploaded file failed the virus scan and was quarantined (private file #${fileId}).`,
          url: `${siteUrl()}/admin/collections/private-files/${fileId}`,
        },
        status: "pending",
        attempts: 0,
        runAfter: new Date().toISOString(),
      },
    });
  }
}

async function run(
  job: Pick<Outbox, "kind" | "payload">,
  payload: Payload,
): Promise<void | { scan: number }> {
  const p = job.payload as Record<string, unknown>;
  switch (job.kind) {
    case "send-email": {
      if (p.template === "lead-confirmation") {
        const mail = await leadConfirmationEmail(p.data as LeadEmailData);
        await sendEmail({ to: p.to as string, ...mail });
      } else if (p.template === "lead-notification") {
        const mail = await leadNotificationEmail(
          p.data as LeadEmailData,
          siteUrl(p.adminPath as string),
        );
        await sendEmail({ to: p.to as string, replyTo: p.replyTo as string | undefined, ...mail });
      } else if (p.template === "application-confirmation") {
        const mail = await applicationConfirmationEmail(p.data as ApplicationEmailData);
        await sendEmail({ to: p.to as string, ...mail });
      } else if (p.template === "application-notification") {
        const mail = await applicationNotificationEmail(
          p.data as ApplicationEmailData,
          siteUrl(p.adminPath as string),
        );
        await sendEmail({ to: p.to as string, replyTo: p.replyTo as string | undefined, ...mail });
      } else if (p.template === "application-status") {
        const mail = await applicationStatusEmail(p.data as ApplicationStatusEmailData);
        await sendEmail({ to: p.to as string, ...mail });
      } else if (p.template === "raw") {
        await sendEmail({
          to: p.to as string,
          subject: p.subject as string,
          html: p.html as string,
          text: p.text as string,
        });
      } else throw new Error(`Unknown email template ${String(p.template)}`);
      return;
    }
    case "notify-team": {
      // INT-08: Slack/Teams/Telegram-compatible incoming webhook.
      const url = process.env.TEAM_ALERT_WEBHOOK_URL;
      if (!url) return;
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        // Links are absolute so they open from Slack/Telegram; no personal data in the text.
        body: JSON.stringify({
          text: p.url
            ? `${p.text}\n${String(p.url).startsWith("/") ? siteUrl() + p.url : p.url}`
            : p.text,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`Team webhook ${res.status}`);
      return;
    }
    case "crm-sync": {
      // INT-06: CRM webhook (HubSpot/Zoho workflow URL).
      const url = process.env.CRM_WEBHOOK_URL;
      if (!url) return;
      const res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(p),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`CRM webhook ${res.status}`);
      return;
    }
    case "staff-invite": {
      // ADM-01: a new staff member sets their own password from a reset link.
      await payload.forgotPassword({
        collection: "users",
        data: { email: p.email as string },
        disableEmail: false,
      });
      return;
    }
    case "scan-upload": {
      // ADR-004: scan with clamd when configured; otherwise mark "skipped" (dev only).
      return { scan: p.fileId as number };
    }
    default:
      throw new Error(`No handler for outbox kind ${job.kind}`);
  }
}

/**
 * Claim and run due jobs. Claiming uses FOR UPDATE SKIP LOCKED so overlapping
 * cron invocations never process the same job twice.
 */
export async function processOutbox(payload: Payload, { limit = 25 } = {}) {
  const db = payload.db.drizzle;
  // Jobs stuck in "running" for 10 minutes (crashed worker) go back to pending.
  await db.execute(
    sql`update outbox set status = 'pending' where status = 'running' and updated_at < now() - interval '10 minutes'`,
  );
  const claimed = await db.execute(sql`
    update outbox set status = 'running', updated_at = now()
    where id in (
      select id from outbox
      where status = 'pending' and run_after <= now()
      order by run_after
      limit ${limit}
      for update skip locked
    )
    returning id`);
  const ids = (claimed.rows as { id: number }[]).map((r) => r.id);

  const summary = { claimed: ids.length, done: 0, retried: 0, dead: 0 };
  for (const id of ids) {
    const job = await payload.findByID({ collection: "outbox", id, overrideAccess: true });
    const attempts = (job.attempts ?? 0) + 1;
    try {
      const result = await run(job, payload);
      if (result && "scan" in result) await scanUpload(payload, result.scan);
      await payload.update({
        collection: "outbox",
        id,
        overrideAccess: true,
        data: { status: "done", attempts, lastError: null },
      });
      summary.done++;
    } catch (err) {
      const dead = attempts >= MAX_ATTEMPTS;
      await payload.update({
        collection: "outbox",
        id,
        overrideAccess: true,
        data: {
          status: dead ? "dead" : "pending",
          attempts,
          lastError: err instanceof Error ? err.message.slice(0, 1000) : String(err),
          runAfter: new Date(Date.now() + backoffMs(attempts)).toISOString(),
        },
      });
      if (dead) {
        summary.dead++;
        payload.logger.error({ msg: "Outbox job is dead", id, kind: job.kind });
        const { reportError } = await import("./report-error");
        await reportError(new Error(`Outbox job ${id} (${job.kind}) failed ${attempts} times`), {
          kind: "outbox",
        });
      } else summary.retried++;
    }
  }
  return summary;
}
