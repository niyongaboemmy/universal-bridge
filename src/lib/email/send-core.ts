import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type OutgoingEmail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

type Transport = { sendMail(m: Record<string, unknown>): Promise<{ messageId: string }> };
let smtp: Transport | undefined;

/** One pooled SMTP connection per process (cPanel mail: SMTP_HOST etc.). */
async function smtpTransport(): Promise<Transport> {
  if (!smtp) {
    const nodemailer = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT || 465);
    smtp = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // 465 is implicit TLS; 587 upgrades with STARTTLS.
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD ?? "" }
        : undefined,
      pool: true,
      maxConnections: 2,
    });
  }
  return smtp;
}

/**
 * INT-01 (no server-only marker: Payload's email adapter loads this from scripts too).
 * Sends through Resend when RESEND_API_KEY is set, otherwise through SMTP when
 * SMTP_HOST is set (e.g. the cPanel mailbox). Otherwise (local development, CI)
 * the email is written to .data/mail/ so tests can assert on it. Replies go to
 * the message's replyTo, else EMAIL_REPLY_TO (a no-reply sender can point
 * replies at a real inbox). Throws on failure so the outbox retries (NFR-REL-02).
 */
export async function sendEmail(email: OutgoingEmail): Promise<{ id: string }> {
  const { settings } = await import("@/lib/settings");
  const from = (await settings()).emailFrom;
  const replyTo = email.replyTo || process.env.EMAIL_REPLY_TO || undefined;
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({ from, ...email, replyTo });
    if (error || !data) throw new Error(`Resend: ${error?.message ?? "no response"}`);
    return { id: data.id };
  }
  if (process.env.SMTP_HOST) {
    const info = await (await smtpTransport()).sendMail({ from, ...email, replyTo });
    return { id: info.messageId };
  }
  const dir = path.resolve(".data/mail");
  await mkdir(dir, { recursive: true });
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await writeFile(
    path.join(dir, `${id}.json`),
    JSON.stringify({ id, from, ...email, replyTo, at: new Date().toISOString() }, null, 2),
  );
  console.info(`[email] (dev mailbox) → ${[email.to].flat().join(", ")}: ${email.subject}`);
  return { id };
}
