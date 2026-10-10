import { Button, Text } from "@react-email/components";
import { render } from "@react-email/components";
import type { Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/utils";
import { EmailLayout, emailButton, emailMuted, emailText } from "./Layout";
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
      footer={t("footer")}
      privacy={t("privacy")}
    >
      <Text style={emailText}>
        {t("leadConfirmation.greeting", { name: lead.name.split(" ")[0] ?? lead.name })}
      </Text>
      <Text style={emailText}>
        {t("leadConfirmation.body", { department: department.toLowerCase() })}
      </Text>
      <Text style={{ ...emailMuted, fontWeight: 600 }}>{t("leadConfirmation.summary")}</Text>
      <Text
        style={{
          ...emailMuted,
          whiteSpace: "pre-wrap",
          borderLeft: "3px solid #FF7A00",
          paddingLeft: 12,
        }}
      >
        {lead.message}
      </Text>
      <Text style={emailText}>{t("leadConfirmation.next")}</Text>
      <Button href={bookUrl} style={emailButton}>
        {t("leadConfirmation.book")}
      </Button>
      <Text style={{ ...emailText, marginTop: 20 }}>{t("leadConfirmation.signoff")}</Text>
      <Text style={emailMuted}>{f("reference", { ref: lead.ref })}</Text>
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
      footer="Internal notification — do not forward outside UB."
    >
      {lead.botCheck === "missing" && (
        <Text style={{ ...emailText, color: "#B45309" }}>
          ⚠ Sent without JavaScript (no bot check). Review before replying.
        </Text>
      )}
      {rows
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <Text key={k} style={emailMuted}>
            <strong>{k}:</strong> {v}
          </Text>
        ))}
      <Text style={{ ...emailText, whiteSpace: "pre-wrap", marginTop: 12 }}>{lead.message}</Text>
      <Button href={adminUrl} style={emailButton}>
        Open in the inbox
      </Button>
    </EmailLayout>
  );
  return {
    subject: `New ${lead.department} inquiry from ${lead.name}${lead.company ? ` (${lead.company})` : ""} — ${lead.ref}`,
    html: await render(element),
    text: await render(element, { plainText: true }),
  };
}
