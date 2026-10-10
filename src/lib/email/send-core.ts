import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type OutgoingEmail = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

/**
 * INT-01 (no server-only marker: Payload's email adapter loads this from scripts too). Sends through Resend when RESEND_API_KEY is set. Otherwise (local
 * development, CI) the email is written to .data/mail/ so tests can assert on it.
 * Throws on failure so the outbox retries (NFR-REL-02).
 */
export async function sendEmail(email: OutgoingEmail): Promise<{ id: string }> {
  const { settings } = await import("@/lib/settings");
  const from = (await settings()).emailFrom;
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({ from, ...email });
    if (error || !data) throw new Error(`Resend: ${error?.message ?? "no response"}`);
    return { id: data.id };
  }
  const dir = path.resolve(".data/mail");
  await mkdir(dir, { recursive: true });
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await writeFile(
    path.join(dir, `${id}.json`),
    JSON.stringify({ id, from, ...email, at: new Date().toISOString() }, null, 2),
  );
  console.info(`[email] (dev mailbox) → ${[email.to].flat().join(", ")}: ${email.subject}`);
  return { id };
}
