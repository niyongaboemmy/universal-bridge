import type { EmailAdapter } from "payload";
import { sendEmail } from "./send-core";

/**
 * Payload's own emails (password reset, staff invitations) go through the same
 * sender as the site: Resend or SMTP in deployed environments, .data/mail locally.
 */
export const ubEmailAdapter: EmailAdapter = () => ({
  name: "ub-email",
  defaultFromAddress: "hello@universalbridge.rw",
  defaultFromName: "Universal Bridge",
  sendEmail: async (message) => {
    const to = [message.to]
      .flat()
      .map((t) => (typeof t === "string" ? t : t?.address))
      .filter(Boolean) as string[];
    const html = String(message.html ?? "");
    // Plain-text part from the branded HTML (skips the <head> styles, keeps link URLs).
    const { toPlainText } = await import("@react-email/components");
    return sendEmail({
      to,
      subject: String(message.subject ?? ""),
      html,
      text: String(message.text ?? toPlainText(html)),
    });
  },
});
