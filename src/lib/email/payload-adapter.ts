import type { EmailAdapter } from "payload";
import { sendEmail } from "./send-core";

/**
 * Payload's own emails (password reset, staff invitations) go through the same
 * sender as the site: Resend in deployed environments, .data/mail locally.
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
    return sendEmail({
      to,
      subject: String(message.subject ?? ""),
      html: String(message.html ?? ""),
      text: String(
        message.text ??
          String(message.html ?? "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim(),
      ),
    });
  },
});
