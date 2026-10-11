import { render, Text } from "@react-email/components";
import type { Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/utils";
import {
  Details,
  EmailActions,
  EmailButton,
  EmailLayout,
  emailText,
  Panel,
  SignOff,
} from "./Layout";
import { emailTranslator, formTranslator } from "./translator";

export type LeadEmailData = {
  ref: string;
  name: string;
  email: string;
  company?: string | null;
  country?: string | null;
  phone?: string | null;
  department: string;
  services?: string[] | null;
  budgetRange?: string | null;
  timeline?: string | null;
  message: string;
  locale: Locale;
  botCheck?: string;
};

/** Confirmation to the person who wrote to us (FR-FORM-05), in their language. */
export async function leadConfirmationEmail(lead: LeadEmailData) {
  const t = emailTranslator(lead.locale);
  const f = formTranslator(lead.locale);
  const department = f(`departments.${lead.department}` as "departments.sales");
  const bookUrl = siteUrl(lead.locale === "en" ? "/book" : `/${lead.locale}/book`);
  const element = (
    <EmailLayout
      lang={lead.locale}
      preview={t("leadConfirmation.preview")}
      eyebrow={t("leadConfirmation.eyebrow")}
      title={t("leadConfirmation.title")}
      privacy={t("privacy")}
    >
      <Text style={emailText}>
        {t("leadConfirmation.greeting", { name: lead.name.split(" ")[0] ?? lead.name })}
      </Text>
      <Text style={emailText}>
        {t("leadConfirmation.body", { department: department.toLowerCase() })}
      </Text>
      <Panel title={t("leadConfirmation.summary")}>{lead.message}</Panel>
      <Text style={emailText}>{t("leadConfirmation.next")}</Text>
      <EmailActions>
        <EmailButton href={bookUrl}>{t("leadConfirmation.book")}</EmailButton>
      </EmailActions>
      <SignOff text={t("leadConfirmation.signoff")} reference={f("reference", { ref: lead.ref })} />
    </EmailLayout>
  );
  return {
    subject: t("leadConfirmation.subject", { ref: lead.ref }),
    html: await render(element),
    text: await render(element, { plainText: true }),
  };
}

/** Internal notification to the routed inbox (FR-FORM-05, FR-CON-02). English. */
export async function leadNotificationEmail(lead: LeadEmailData, adminUrl: string) {
  const rows: [string, string | null | undefined][] = [
    ["Reference", lead.ref],
    ["Name", lead.name],
    ["Email", lead.email],
    ["Company", lead.company],
    ["Country", lead.country],
    ["Phone", lead.phone],
    ["Services", lead.services?.join(", ")],
    ["Budget", lead.budgetRange],
    ["Timeline", lead.timeline],
    ["Language", lead.locale.toUpperCase()],
  ];
  const element = (
    <EmailLayout
      lang="en"
      preview={`${lead.name}: ${lead.message.slice(0, 90)}`}
      eyebrow={`New ${lead.department} inquiry`}
      title={lead.company ? `${lead.name} · ${lead.company}` : lead.name}
      footer="Internal notification — do not forward outside UB."
    >
      {lead.botCheck === "missing" && (
        <Panel tone="warn">⚠ Sent without JavaScript (no bot check). Review before replying.</Panel>
      )}
      <Details rows={rows} />
      <Panel title="Message">{lead.message}</Panel>
      <EmailActions>
        <EmailButton href={adminUrl}>Open in the inbox</EmailButton>
      </EmailActions>
    </EmailLayout>
  );
  return {
    subject: `New ${lead.department} inquiry from ${lead.name}${lead.company ? ` (${lead.company})` : ""} — ${lead.ref}`,
    html: await render(element),
    text: await render(element, { plainText: true }),
  };
}
