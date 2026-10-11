import { render, Text } from "@react-email/components";
import type { Locale } from "@/i18n/routing";
import {
  Details,
  EmailActions,
  EmailButton,
  EmailLayout,
  emailText,
  Panel,
  SignOff,
  Steps,
} from "./Layout";
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
      eyebrow={t("applicationConfirmation.eyebrow")}
      title={t("applicationConfirmation.title")}
      privacy={t("privacy")}
    >
      <Text style={emailText}>
        {t("applicationConfirmation.greeting", { name: a.name.split(" ")[0] ?? a.name })}
      </Text>
      <Text style={emailText}>{t("applicationConfirmation.body", { subject: a.subject })}</Text>
      {a.waitlisted && <Panel tone="warn">{t("applicationConfirmation.waitlist")}</Panel>}
      <Text style={{ ...emailText, fontWeight: 700, margin: "4px 0 12px" }}>
        {t("applicationConfirmation.nextTitle")}
      </Text>
      <Steps
        current={0}
        items={[
          t("applicationConfirmation.next1"),
          t("applicationConfirmation.next2"),
          t("applicationConfirmation.next3"),
        ]}
      />
      <SignOff
        text={t("applicationConfirmation.signoff")}
        reference={f("reference", { ref: a.ref })}
      />
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
      eyebrow={`New ${a.type} application`}
      title={a.name}
      intro={a.subject}
      footer="Internal notification — do not forward outside UB."
    >
      {a.botCheck === "missing" && (
        <Panel tone="warn">⚠ Sent without JavaScript (no bot check). Review before replying.</Panel>
      )}
      {a.waitlisted && <Panel tone="warn">Intake full — added to the waitlist.</Panel>}
      <Details
        rows={[
          ["Reference", a.ref],
          ["Type", a.type],
          ["Applying for", a.subject],
          ["Name", a.name],
          ["Email", a.email],
          ...a.summary,
        ]}
      />
      <EmailActions>
        <EmailButton href={adminUrl}>Open in the inbox</EmailButton>
      </EmailActions>
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

const STATUS_TONE = {
  shortlisted: "info",
  accepted: "success",
  waitlisted: "warn",
  rejected: "neutral",
} as const;

/** ADM-05: status update to the applicant, in their language, with where they stand. */
export async function applicationStatusEmail(a: ApplicationStatusEmailData) {
  const t = emailTranslator(a.locale);
  const f = formTranslator(a.locale);
  // Progress: received → reviewed → shortlisted → decision.
  const current = { shortlisted: 2, accepted: 4, waitlisted: 1, rejected: undefined }[a.status];
  const el = (
    <EmailLayout
      lang={a.locale}
      preview={t("applicationStatus.preview")}
      eyebrow={t("applicationStatus.eyebrow")}
      title={t(`applicationStatus.title.${a.status}`)}
      privacy={t("privacy")}
    >
      <Text style={emailText}>
        {t("applicationStatus.greeting", { name: a.name.split(" ")[0] ?? a.name })}
      </Text>
      <Panel tone={STATUS_TONE[a.status]}>
        {t(`applicationStatus.${a.status}`, { subject: a.subject })}
      </Panel>
      {current !== undefined && (
        <Steps
          current={current}
          items={[
            t("applicationStatus.steps.received"),
            t("applicationStatus.steps.review"),
            t("applicationStatus.steps.shortlisted"),
            t("applicationStatus.steps.decision"),
          ]}
        />
      )}
      <SignOff text={t("applicationStatus.signoff")} reference={f("reference", { ref: a.ref })} />
    </EmailLayout>
  );
  return {
    subject: t("applicationStatus.subject", { ref: a.ref }),
    html: await render(el),
    text: await render(el, { plainText: true }),
  };
}
