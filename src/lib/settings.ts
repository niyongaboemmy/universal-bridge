import type { SystemSetting } from "@/payload-types";

/**
 * System settings (office → Settings) with environment fallbacks. Not `server-only`
 * on purpose: the outbox and email code also run from scripts. Values are held in
 * memory for 30 s; saving the settings clears this process's copy at once.
 */
export { CURRENCIES } from "./currencies";

export type Settings = {
  emailFrom: string;
  inbox: Record<
    "sales" | "academy" | "careers" | "partnerships" | "press" | "support" | "events",
    string | undefined
  >;
  registrationOpen: boolean;
  defaultMemberRole?: number;
  applicantRole?: number;
  staffLanding: "office" | "cms";
  ssoDomains: string[];
  responseHours: number;
  followUpDays: number;
  notifyApplicants: boolean;
  boardLimit: number;
  currency: string;
  maxUploadBytes: number;
  clamavHost?: string;
  plausibleDomain?: string;
  gaMeasurementId?: string;
  calLink?: string;
  crmWebhookUrl?: string;
  teamWebhookUrl?: string;
  retention: {
    leadsMonths: number;
    applicationsMonths: number;
    pageViewsMonths: number;
    orphanFilesDays: number;
    subscribersDays: number;
  };
  noindex: boolean;
  maintenance: { on: boolean; message: string | null; until: string | null };
};

const env = (k: string) => process.env[k] || undefined;
/** Universal Bridge's Google Analytics 4 web stream (public: it is in every page that loads GA). */
export const GA_DEFAULT_ID = "G-110J66XQ0H";
const id = (v: unknown) =>
  typeof v === "number" ? v : typeof v === "object" && v ? (v as { id: number }).id : undefined;

/** Merge the stored global over the environment and defaults. Pure (unit tested). */
export function resolveSettings(s: Partial<SystemSetting> | null | undefined): Settings {
  const e = s?.email;
  const ib = e?.inboxes;
  const fromAddress = e?.fromAddress;
  const sales = ib?.sales || env("INBOX_SALES");
  const academy = ib?.academy || env("INBOX_ACADEMY");
  return {
    emailFrom: fromAddress
      ? `${e?.fromName || "Universal Bridge"} <${fromAddress}>`
      : (env("EMAIL_FROM") ?? "Universal Bridge <hello@universalbridge.rw>"),
    inbox: {
      sales,
      academy,
      careers: ib?.careers || env("INBOX_CAREERS"),
      partnerships: ib?.partnerships || env("INBOX_PARTNERS"),
      press: ib?.press || env("INBOX_PRESS"),
      support: ib?.support || env("INBOX_SUPPORT"),
      events: ib?.events || env("INBOX_EVENTS") || academy,
    },
    registrationOpen: s?.accounts?.registrationOpen ?? true,
    defaultMemberRole: id(s?.accounts?.defaultMemberRole),
    applicantRole: id(s?.accounts?.applicantRole),
    staffLanding: s?.accounts?.staffLanding === "cms" ? "cms" : "office",
    ssoDomains: (s?.accounts?.ssoDomains || env("SSO_ALLOWED_DOMAINS") || "")
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean),
    responseHours: s?.workflow?.responseHours ?? 24,
    followUpDays: s?.workflow?.followUpDays ?? 3,
    notifyApplicants: s?.workflow?.notifyApplicants ?? true,
    boardLimit: s?.workflow?.boardLimit ?? 40,
    currency: s?.workflow?.defaultCurrency || "RWF",
    maxUploadBytes: (s?.uploads?.maxMb ?? 5) * 1024 * 1024,
    clamavHost: s?.uploads?.clamavHost || env("CLAMAV_HOST"),
    plausibleDomain: s?.integrations?.plausibleDomain || env("NEXT_PUBLIC_PLAUSIBLE_DOMAIN"),
    // Google Analytics loads only after a visitor accepts analytics (CookieConsent).
    gaMeasurementId:
      s?.integrations?.gaEnabled === false
        ? undefined
        : s?.integrations?.gaMeasurementId || env("NEXT_PUBLIC_GA_MEASUREMENT_ID") || GA_DEFAULT_ID,
    calLink: s?.integrations?.calLink || env("NEXT_PUBLIC_CAL_LINK"),
    crmWebhookUrl: s?.integrations?.crmWebhookUrl || env("CRM_WEBHOOK_URL"),
    teamWebhookUrl: s?.integrations?.teamWebhookUrl || env("TEAM_ALERT_WEBHOOK_URL"),
    retention: {
      leadsMonths: s?.retention?.leadsMonths ?? 24,
      applicationsMonths: s?.retention?.applicationsMonths ?? 12,
      pageViewsMonths: s?.retention?.pageViewsMonths ?? 13,
      orphanFilesDays: s?.retention?.orphanFilesDays ?? 30,
      subscribersDays: s?.retention?.subscribersDays ?? 30,
    },
    noindex: Boolean(s?.site?.noindex) || env("NOINDEX") === "1",
    maintenance: {
      on: Boolean(s?.site?.maintenance),
      message: s?.site?.maintenanceMessage || null,
      until: s?.site?.maintenanceUntil || null,
    },
  };
}

let memo: { at: number; value: Promise<Settings> } | null = null;

export function clearSettingsCache() {
  memo = null;
}

/** Settings read straight from the database (no cache): for the few places that must not lag. */
export async function freshSettings(): Promise<Settings> {
  clearSettingsCache();
  return settings();
}

/**
 * Current settings. Falls back to the environment when the database can't be read.
 * Cached for 30 s per server bundle; a save clears the copy in the bundle that saved.
 */
export function settings(): Promise<Settings> {
  if (memo && Date.now() - memo.at < 30_000) return memo.value;
  const value = (async () => {
    try {
      const { getPayload } = await import("payload");
      const config = (await import("@payload-config")).default;
      const p = await getPayload({ config });
      const doc = await p.findGlobal({ slug: "system-settings", depth: 0 });
      return resolveSettings(doc);
    } catch {
      memo = null;
      return resolveSettings(null);
    }
  })();
  memo = { at: Date.now(), value };
  return value;
}
