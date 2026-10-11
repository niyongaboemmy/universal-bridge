"use server";

import { randomBytes } from "node:crypto";
import { render, Text } from "@react-email/components";
import { getTranslations } from "next-intl/server";
import { EmailActions, EmailButton, EmailLayout, emailText, LinkFallback } from "@/emails/Layout";
import { handleSubmission } from "@/lib/forms/submit";
import { CONSENT_VERSION, type FormState } from "@/lib/forms/types";
import { enqueue } from "@/lib/outbox";
import { siteUrl } from "@/lib/utils";
import { newsletterSchema } from "./schema";

/**
 * Newsletter sign-up with double opt-in (SRS §7.2). The response never says
 * whether an address was already subscribed (no enumeration).
 */
export async function subscribeNewsletter(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  return handleSubmission({
    formData,
    schema: newsletterSchema,
    scope: "newsletter",
    emailField: "email",
    save: async ({ data, req, meta }) => {
      const email = data.email.toLowerCase();
      const found = await req.payload.find({
        collection: "subscribers",
        where: { email: { equals: email } },
        limit: 1,
        overrideAccess: true,
        req,
      });
      const existing = found.docs[0];
      if (existing?.confirmedAt && !existing.unsubscribedAt) return "N-OK";
      const token = randomBytes(24).toString("base64url");
      const consent = {
        text: "Newsletter: one email a month",
        version: CONSENT_VERSION,
        at: new Date().toISOString(),
      };
      if (existing) {
        await req.payload.update({
          collection: "subscribers",
          id: existing.id,
          data: { token, locale: meta.locale, unsubscribedAt: null, consent },
          overrideAccess: true,
          req,
        });
      } else {
        await req.payload.create({
          collection: "subscribers",
          data: { email, token, locale: meta.locale, consent },
          overrideAccess: true,
          req,
        });
      }
      const t = await getTranslations({ locale: meta.locale, namespace: "newsletter" });
      const e = await getTranslations({ locale: meta.locale, namespace: "emails" });
      const link = siteUrl(`/api/newsletter/confirm?token=${token}`);
      const el = (
        <EmailLayout
          lang={meta.locale}
          preview={t("emailSubject")}
          eyebrow={e("newsletter.eyebrow")}
          title={t("emailSubject")}
          privacy={e("privacy")}
        >
          <Text style={emailText}>{t("emailBody")}</Text>
          <EmailActions>
            <EmailButton href={link}>{t("emailButton")}</EmailButton>
          </EmailActions>
          <LinkFallback href={link} label={e("linkFallback")} />
        </EmailLayout>
      );
      await enqueue(req, {
        kind: "send-email",
        payload: {
          template: "raw",
          to: email,
          subject: t("emailSubject"),
          html: await render(el),
          text: await render(el, { plainText: true }),
        },
      });
      return "N-OK";
    },
  });
}
