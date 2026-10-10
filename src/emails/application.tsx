import { render, Text, Button } from "@react-email/components";
import type { Locale } from "@/i18n/routing";
import { EmailLayout, emailButton, emailMuted, emailText } from "./Layout";
import { emailTranslator, formTranslator } from "./translator";

export type ApplicationEmailData = {
  ref: string;
  type: "academy" | "internship" | "job" | "partner" | "event";
  name: string;
  email: string;
  subject: string;
  locale: Locale;
  waitlisted?: boolean;
  summary: [string, string][];
  botCheck?: string;
};

/** Confirmation to the applicant, in their language (FR-FORM-05). */
export async function applicationConfirmationEmail(a: ApplicationEmailData) {
  const t = emailTranslator(a.locale);
  const f = formTranslator(a.locale);
  const el = (
    <EmailLayout
      lang={a.locale}
      preview={t("applicationConfirmation.preview")}
      footer={t("footer")}
      privacy={t("privacy")}
    >
      <Text style={emailText}>
        {t("applicationConfirmation.greeting", { name: a.name.split(" ")[0] ?? a.name })}
      </Text>
      <Text style={emailText}>{t("applicationConfirmation.body", { subject: a.subject })}</Text>
      {a.waitlisted && (
        <Text style={{ ...emailText, borderLeft: "3px solid #FE760D", paddingLeft: 12 }}>
          {t("applicationConfirmation.waitlist")}
        </Text>
      )}
      <Text style={{ ...emailMuted, fontWeight: 600 }}>
        {t("applicationConfirmation.nextTitle")}
      </Text>
      <Text style={emailMuted}>1. {t("applicationConfirmation.next1")}</Text>
      <Text style={emailMuted}>2. {t("applicationConfirmation.next2")}</Text>
      <Text style={emailMuted}>3. {t("applicationConfirmation.next3")}</Text>
      <Text style={{ ...emailText, marginTop: 20 }}>{t("applicationConfirmation.signoff")}</Text>
      <Text style={emailMuted}>{f("reference", { ref: a.ref })}</Text>
    </EmailLayout>
  );
  return {
    subject: t("applicationConfirmation.subject", { ref: a.ref }),
    html: await render(el),
    text: await render(el, { plainText: true }),
  };
}

/** Internal notification (English). Files are linked from the admin, never attached. */
export async function applicationNotificationEmail(a: ApplicationEmailData, adminUrl: string) {
  const el = (
    <EmailLayout
      lang="en"
      preview={`${a.type} application: ${a.name} — ${a.subject}`}
      footer="Internal notification — do not forward outside UB."
    >
      {a.botCheck === "missing" && (
        <Text style={{ ...emailText, color: "#B45309" }}>
          ⚠ Sent without JavaScript (no bot check). Review before replying.
        </Text>
      )}
      {a.waitlisted && (
        <Text style={{ ...emailText, color: "#B45309" }}>Intake full — added to the waitlist.</Text>
      )}
      {[
        ["Reference", a.ref],
        ["Type", a.type],
        ["Applying for", a.subject],
        ["Name", a.name],
        ["Email", a.email],
        ...a.summary,
      ].map(([k, v]) => (
        <Text key={k} style={emailMuted}>
          <strong>{k}:</strong> {v}
        </Text>
      ))}
      <Button href={adminUrl} style={emailButton}>
        Open in the inbox
      </Button>
    </EmailLayout>
  );
  return {
    subject: `New ${a.type} application: ${a.name} — ${a.subject} (${a.ref})`,
    html: await render(el),
    text: await render(el, { plainText: true }),
  };
}

export type ApplicationStatusEmailData = {
  ref: string;
  name: string;
  subject: string;
  locale: Locale;
  status: "shortlisted" | "accepted" | "rejected" | "waitlisted";
};

/** ADM-05: status update to the applicant, in their language. */
export async function applicationStatusEmail(a: ApplicationStatusEmailData) {
  const t = emailTranslator(a.locale);
  const f = formTranslator(a.locale);
  const el = (
    <EmailLayout
      lang={a.locale}
      preview={t("applicationStatus.preview")}
      footer={t("footer")}
      privacy={t("privacy")}
    >
      <Text style={emailText}>
        {t("applicationStatus.greeting", { name: a.name.split(" ")[0] ?? a.name })}
      </Text>
      <Text style={emailText}>{t(`applicationStatus.${a.status}`, { subject: a.subject })}</Text>
      <Text style={{ ...emailText, marginTop: 20 }}>{t("applicationStatus.signoff")}</Text>
      <Text style={emailMuted}>{f("reference", { ref: a.ref })}</Text>
    </EmailLayout>
  );
  return {
    subject: t("applicationStatus.subject", { ref: a.ref }),
    html: await render(el),
    text: await render(el, { plainText: true }),
  };
}
