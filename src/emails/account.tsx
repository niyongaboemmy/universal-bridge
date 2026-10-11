import { render, Text } from "@react-email/components";
import type { ReactElement } from "react";
import { isLocale, localizePath, type Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/utils";
import {
  Details,
  EmailActions,
  EmailButton,
  EmailLayout,
  emailText,
  LinkFallback,
  SecurityNote,
  Steps,
} from "./Layout";
import { emailTranslator } from "./translator";

/** How long the links in these emails work. */
export const INVITE_HOURS = 72;
export const RESET_HOURS = 1;

/** "Chrome on macOS" from a user agent, for the "requested from" line. */
export function deviceLabel(ua: string | null | undefined): string | null {
  if (!ua) return null;
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Safari\//.test(ua)
            ? "Safari"
            : null;
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  if (!browser && !os) return null;
  return [browser, os].filter(Boolean).join(" · ");
}

const when = (locale: Locale, d = new Date()) =>
  new Intl.DateTimeFormat(locale === "rw" ? "en-GB" : locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Kigali",
    timeZoneName: "short",
  }).format(d);

const firstName = (name: string | null | undefined, email: string) =>
  (name?.trim() || email.split("@")[0] || "").split(/\s+/)[0] ?? "";

const done = async (subject: string, el: ReactElement) => ({
  subject,
  html: await render(el),
  text: await render(el, { plainText: true }),
});

/** ADM-01: a new staff member is invited and sets their own password. English (office language). */
export async function staffInviteEmail(a: {
  token: string;
  name?: string | null;
  email: string;
  roles?: string[];
  invitedBy?: string | null;
}) {
  const link = siteUrl(`/login/reset?token=${encodeURIComponent(a.token)}&invite=1`);
  const subject = "You're invited to Universal Bridge Office";
  return done(
    subject,
    <EmailLayout
      lang="en"
      preview={`${a.invitedBy ? `${a.invitedBy} invited you` : "You're invited"} — set your password to get started.`}
      eyebrow="Invitation"
      title="Welcome to the team"
      intro="Your Universal Bridge staff account is ready. Set a password to open the office and the CMS."
      footer="Universal Bridge Ltd · Maison Voisin Building, 11 KN 89 St, Kigali, Rwanda"
    >
      <Text style={emailText}>Hi {firstName(a.name, a.email)},</Text>
      <Text style={emailText}>
        {a.invitedBy ? <strong>{a.invitedBy}</strong> : "An administrator"} has created a staff
        account for you. One step left: choose your password.
      </Text>
      <Details
        rows={[
          ["Sign-in email", a.email],
          ["Role", a.roles?.length ? a.roles.join(", ") : null],
          ["Invited by", a.invitedBy],
          ["Link expires", `In ${INVITE_HOURS / 24} days`],
        ]}
      />
      <EmailActions>
        <EmailButton href={link}>Accept invitation &amp; set password</EmailButton>
      </EmailActions>
      <Text style={{ ...emailText, fontWeight: 700, margin: "4px 0 12px" }}>Getting started</Text>
      <Steps
        current={0}
        items={[
          "Set your password (at least 12 characters)",
          "Sign in to the office at universalbridge.rw/login",
          "Add your photo and details on your profile",
        ]}
      />
      <LinkFallback href={link} label="Button not working? Paste this link into your browser:" />
      <SecurityNote>
        The link works once. Not expecting this invitation? Ignore this email — no account is
        activated until a password is set.
      </SecurityNote>
    </EmailLayout>,
  );
}

/** Forgot password, staff account (office and CMS). English. */
export async function staffResetEmail(a: {
  token: string;
  name?: string | null;
  email: string;
  device?: string | null;
}) {
  const link = siteUrl(`/login/reset?token=${encodeURIComponent(a.token)}`);
  const subject = "Reset your Universal Bridge password";
  return done(
    subject,
    <EmailLayout
      lang="en"
      preview="Use this link within an hour to choose a new password."
      eyebrow="Account security"
      title="Reset your password"
      intro="Someone asked to reset the password of your staff account."
      footer="Universal Bridge Ltd · Maison Voisin Building, 11 KN 89 St, Kigali, Rwanda"
    >
      <Text style={emailText}>Hi {firstName(a.name, a.email)},</Text>
      <Text style={emailText}>
        Use the button below to choose a new password. The link works once and expires in one hour.
      </Text>
      <EmailActions>
        <EmailButton href={link}>Choose a new password</EmailButton>
      </EmailActions>
      <Details
        rows={[
          ["Account", a.email],
          ["Requested", when("en")],
          ["From", a.device],
        ]}
      />
      <LinkFallback href={link} label="Button not working? Paste this link into your browser:" />
      <SecurityNote>
        Didn&apos;t ask for this? Ignore this email — your password stays the same. If it keeps
        happening, tell an administrator.
      </SecurityNote>
    </EmailLayout>,
  );
}

/** Forgot password, website account (applicants, students, partners), in their language. */
export async function memberResetEmail(a: {
  token: string;
  name?: string | null;
  email: string;
  locale?: string | null;
  device?: string | null;
}) {
  const locale: Locale = a.locale && isLocale(a.locale) ? a.locale : "en";
  const t = emailTranslator(locale);
  const link = siteUrl(
    `${localizePath("/account/reset", locale)}?token=${encodeURIComponent(a.token)}`,
  );
  return done(
    t("passwordReset.subject"),
    <EmailLayout
      lang={locale}
      preview={t("passwordReset.preview")}
      eyebrow={t("passwordReset.eyebrow")}
      title={t("passwordReset.title")}
      intro={t("passwordReset.intro")}
    >
      <Text style={emailText}>
        {t("passwordReset.greeting", { name: firstName(a.name, a.email) })}
      </Text>
      <Text style={emailText}>{t("passwordReset.body")}</Text>
      <EmailActions>
        <EmailButton href={link}>{t("passwordReset.button")}</EmailButton>
      </EmailActions>
      <Details
        rows={[
          [t("passwordReset.account"), a.email],
          [t("passwordReset.requested"), when(locale)],
          [t("passwordReset.from"), a.device],
        ]}
      />
      <LinkFallback href={link} label={t("linkFallback")} />
      <SecurityNote>{t("passwordReset.ignore")}</SecurityNote>
    </EmailLayout>,
  );
}
