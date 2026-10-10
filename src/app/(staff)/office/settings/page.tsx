import {
  CheckCircle2,
  CircleDashed,
  Clock3,
  Globe,
  KeyRound,
  Mail,
  Plug,
  ShieldCheck,
  Upload,
  UserPlus,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SettingsForm, type SettingField } from "@/components/office/SettingsForm";
import { Card, PageHeader } from "@/components/office/ui";
import { requireArea } from "@/features/office/session";
import { mfaMode, ssoEnabled } from "@/lib/auth/mfa-proof";
import { payload } from "@/lib/cms/payload";
import { GA_DEFAULT_ID, resolveSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import type { Role, SystemSetting } from "@/payload-types";

export const metadata = { title: "Settings" };

const env = (k: string) => Boolean(process.env[k]);

export default async function Settings({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  await requireArea("settings");
  const p = await payload();
  const [doc, roles] = await Promise.all([
    p.findGlobal({ slug: "system-settings", depth: 0 }) as Promise<SystemSetting>,
    p.find({ collection: "roles", where: { audience: { equals: "member" } }, depth: 0, limit: 50 }),
  ]);
  const fromEnv = resolveSettings(null); // what applies when a field is left empty
  const live = resolveSettings(doc);
  const memberRoles = [
    { value: "", label: "Default (built-in)" },
    ...(roles.docs as Role[]).map((r) => ({ value: String(r.id), label: r.name })),
  ];
  const ib = doc.email?.inboxes ?? {};
  const inbox = (k: keyof typeof live.inbox, label: string): SettingField => ({
    name: `inboxes.${k}`,
    label,
    type: "email",
    value: (ib as Record<string, string | null>)[k],
    fallback: fromEnv.inbox[k] ?? null,
    half: true,
  });

  const SECTIONS: {
    key: string;
    label: string;
    icon: ReactNode;
    intro: string;
    fields: SettingField[];
    aside?: ReactNode;
  }[] = [
    {
      key: "email",
      label: "Email & inboxes",
      icon: <Mail />,
      intro: "Who emails come from, and which team inbox gets each form.",
      fields: [
        {
          name: "fromName",
          label: "Sender name",
          type: "text",
          value: doc.email?.fromName,
          half: true,
        },
        {
          name: "fromAddress",
          label: "Sender address",
          type: "email",
          value: doc.email?.fromAddress,
          fallback: fromEnv.emailFrom,
          half: true,
          help: "Must be a verified sender at the email provider.",
        },
        inbox("sales", "Sales & projects"),
        inbox("academy", "Academy"),
        inbox("careers", "Careers"),
        inbox("partnerships", "Partnerships"),
        inbox("press", "Press"),
        inbox("support", "Support"),
        inbox("events", "Events"),
      ],
      aside: (
        <ul className="grid gap-2 text-body-sm">
          {Object.entries(live.inbox).map(([k, v]) => (
            <li key={k} className="grid min-w-0 gap-0.5 sm:flex sm:items-center sm:gap-2">
              <span className="shrink-0 text-[0.75rem] text-fg-muted capitalize sm:w-24 sm:text-body-sm">
                {k}
              </span>
              <span className="hidden h-px min-w-4 flex-1 border-t border-dashed border-strong sm:block" />
              <span
                title={v ?? undefined}
                className={cn("min-w-0 truncate font-medium", !v && "text-danger")}
              >
                {v ?? "not set"}
              </span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "accounts",
      label: "Accounts & sign-in",
      icon: <UserPlus />,
      intro: "Website registration and where staff land after signing in.",
      fields: [
        {
          name: "registrationOpen",
          label: "People can register on the website",
          type: "checkbox",
          value: doc.accounts?.registrationOpen ?? true,
          help: "New accounts get the default member role; it changes to the applicant role on their first application.",
        },
        {
          name: "defaultMemberRole",
          label: "Role for new members",
          type: "select",
          value: doc.accounts?.defaultMemberRole ?? "",
          options: memberRoles,
          half: true,
        },
        {
          name: "applicantRole",
          label: "Role after a first application",
          type: "select",
          value: doc.accounts?.applicantRole ?? "",
          options: memberRoles,
          half: true,
        },
        {
          name: "staffLanding",
          label: "Staff open… (each person can change theirs)",
          type: "select",
          value: doc.accounts?.staffLanding ?? "office",
          options: [
            { value: "office", label: "The company office" },
            { value: "cms", label: "The content admin (CMS)" },
          ],
          half: true,
        },
        {
          name: "ssoDomains",
          label: "Single sign-on email domains",
          type: "text",
          value: doc.accounts?.ssoDomains,
          fallback: fromEnv.ssoDomains.join(", ") || null,
          placeholder: "universalbridge.rw",
          half: true,
          help: "Comma separated. Empty: any domain with a staff account.",
        },
      ],
    },
    {
      key: "workflow",
      label: "Workflow",
      icon: <Workflow />,
      intro: "Response targets and how boards behave.",
      fields: [
        {
          name: "responseHours",
          label: "First reply within",
          type: "range",
          min: 1,
          max: 72,
          unit: "hours",
          value: live.responseHours,
          half: true,
          help: "Cards turn amber, then red, as they pass this.",
        },
        {
          name: "followUpDays",
          label: "Default follow-up after",
          type: "range",
          min: 1,
          max: 14,
          unit: "days",
          value: live.followUpDays,
          half: true,
        },
        {
          name: "boardLimit",
          label: "Cards per board column",
          type: "range",
          min: 10,
          max: 200,
          step: 10,
          unit: "cards",
          value: live.boardLimit,
          half: true,
        },
        {
          name: "defaultCurrency",
          label: "Currency for deal values",
          type: "select",
          value: live.currency,
          options: ["RWF", "USD", "EUR", "KES", "UGX"].map((c) => ({ value: c, label: c })),
          half: true,
        },
        {
          name: "notifyApplicants",
          label: "Email applicants when their stage changes",
          type: "checkbox",
          value: live.notifyApplicants,
          help: "Shortlisted, accepted, rejected and waitlisted. Can still be switched off per applicant.",
        },
      ],
    },
    {
      key: "uploads",
      label: "Uploads",
      icon: <Upload />,
      intro: "CV and document uploads on the website's forms.",
      fields: [
        {
          name: "maxMb",
          label: "Largest file",
          type: "range",
          min: 1,
          max: 25,
          unit: "MB",
          value: doc.uploads?.maxMb ?? 5,
        },
        {
          name: "clamavHost",
          label: "Virus scanner (ClamAV) host",
          type: "text",
          value: doc.uploads?.clamavHost,
          fallback: fromEnv.clamavHost ?? null,
          placeholder: "clamav.internal:3310",
          help: "In production, uploads stay pending until a scanner is set.",
        },
      ],
    },
    {
      key: "integrations",
      label: "Integrations",
      icon: <Plug />,
      intro: "Analytics, booking and the webhooks that tell other tools about new requests.",
      fields: [
        {
          name: "plausibleDomain",
          label: "Plausible analytics domain",
          type: "text",
          value: doc.integrations?.plausibleDomain,
          fallback: fromEnv.plausibleDomain ?? null,
          placeholder: "universalbridge.rw",
          half: true,
        },
        {
          name: "gaEnabled",
          label: "Google Analytics",
          type: "checkbox",
          value: doc.integrations?.gaEnabled ?? true,
          help: "Loads only for visitors who accept analytics in the cookie banner.",
          half: true,
        },
        {
          name: "gaMeasurementId",
          label: "Google Analytics measurement ID",
          type: "text",
          value: doc.integrations?.gaMeasurementId,
          fallback: fromEnv.gaMeasurementId ?? GA_DEFAULT_ID,
          placeholder: GA_DEFAULT_ID,
          help: "GA4 web stream. Leave empty to use the company's stream.",
          half: true,
        },
        {
          name: "calLink",
          label: "Booking link (Cal.com)",
          type: "text",
          value: doc.integrations?.calLink,
          fallback: fromEnv.calLink ?? null,
          placeholder: "universal-bridge/intro",
          half: true,
        },
        {
          name: "crmWebhookUrl",
          label: "CRM webhook",
          type: "url",
          value: doc.integrations?.crmWebhookUrl,
          fallback: fromEnv.crmWebhookUrl ? "the environment value" : null,
          help: "HubSpot or Zoho workflow URL; receives each new request.",
        },
        {
          name: "teamWebhookUrl",
          label: "Team alerts webhook",
          type: "url",
          value: doc.integrations?.teamWebhookUrl,
          fallback: fromEnv.teamWebhookUrl ? "the environment value" : null,
          help: "Slack, Teams or Telegram incoming webhook.",
        },
      ],
      aside: (
        <ul className="grid gap-2 text-body-sm">
          {[
            ["Plausible", live.plausibleDomain],
            ["Google Analytics", live.gaMeasurementId],
            ["Booking", live.calLink],
            ["CRM", live.crmWebhookUrl],
            ["Team alerts", live.teamWebhookUrl],
          ].map(([k, v]) => (
            <li key={k} className="flex items-center gap-2">
              {v ? (
                <CheckCircle2 className="size-4 text-success" aria-hidden />
              ) : (
                <CircleDashed className="size-4 text-fg-muted" aria-hidden />
              )}
              <span className="flex-1">{k}</span>
              <span className={v ? "text-success" : "text-fg-muted"}>
                {v ? "connected" : "off"}
              </span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "retention",
      label: "Privacy & retention",
      icon: <Clock3 />,
      intro: "How long personal data is kept before the monthly clean-up removes it.",
      fields: [
        {
          name: "leadsMonths",
          label: "Requests & messages",
          type: "range",
          min: 6,
          max: 60,
          unit: "months",
          value: live.retention.leadsMonths,
          half: true,
        },
        {
          name: "applicationsMonths",
          label: "Unsuccessful applications",
          type: "range",
          min: 3,
          max: 36,
          unit: "months",
          value: live.retention.applicationsMonths,
          half: true,
        },
        {
          name: "pageViewsMonths",
          label: "Page views (analytics)",
          type: "range",
          min: 1,
          max: 26,
          unit: "months",
          value: live.retention.pageViewsMonths,
          half: true,
        },
        {
          name: "orphanFilesDays",
          label: "Abandoned uploads",
          type: "range",
          min: 7,
          max: 90,
          unit: "days",
          value: live.retention.orphanFilesDays,
          half: true,
        },
        {
          name: "subscribersDays",
          label: "Unconfirmed sign-ups",
          type: "range",
          min: 7,
          max: 90,
          unit: "days",
          value: live.retention.subscribersDays,
          half: true,
        },
      ],
      aside: (
        <ul className="grid gap-3 text-body-sm">
          {[
            ["Requests", live.retention.leadsMonths * 30],
            ["Applications", live.retention.applicationsMonths * 30],
            ["Page views", live.retention.pageViewsMonths * 30],
            ["Uploads", live.retention.orphanFilesDays],
            ["Sign-ups", live.retention.subscribersDays],
          ].map(([k, days]) => (
            <li key={k as string}>
              <div className="flex justify-between text-[0.75rem] text-fg-muted">
                <span>{k}</span>
                <span className="tabular-nums">
                  {Number(days) >= 60 ? `${Math.round(Number(days) / 30)} mo` : `${days} d`}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-primary)_10%,transparent)]">
                <div
                  className="office-bar h-full rounded-full bg-gradient-to-r from-[#0145b8] to-[#fe760d]"
                  style={{ width: `${Math.min(100, (Number(days) / 1800) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "site",
      label: "Website",
      icon: <Globe />,
      intro: "Maintenance mode and search engines.",
      fields: [
        {
          name: "maintenance",
          label: "Maintenance mode",
          type: "checkbox",
          value: doc.site?.maintenance ?? false,
          help: "Visitors see a “back soon” page (HTTP 503, search engines wait). Signed-in staff still see the site, and the office keeps working.",
        },
        {
          name: "maintenanceMessage",
          label: "Message for visitors",
          type: "textarea",
          value: doc.site?.maintenanceMessage,
          placeholder: "Universal Bridge is getting an update. Please check back shortly.",
        },
        {
          name: "maintenanceUntil",
          label: "Expected back (Kigali time)",
          type: "datetime",
          value: doc.site?.maintenanceUntil,
          half: true,
        },
        {
          name: "noindex",
          label: "Hide the website from search engines",
          type: "checkbox",
          value: doc.site?.noindex ?? false,
          help: "For a staging copy. Leave off for the live site.",
        },
      ],
    },
  ];

  const sp = await searchParams;
  const current = SECTIONS.find((s) => s.key === sp.s) ?? SECTIONS[0]!;
  const checks: [string, boolean, string][] = [
    ["Email delivery", env("RESEND_API_KEY"), "RESEND_API_KEY"],
    ["File storage", env("S3_BUCKET"), "S3_*"],
    ["Spam protection", env("TURNSTILE_SECRET_KEY"), "TURNSTILE_SECRET_KEY"],
    ["Rate limiting", env("UPSTASH_REDIS_REST_URL"), "UPSTASH_REDIS_*"],
    ["Error tracking", env("SENTRY_DSN"), "SENTRY_DSN"],
    ["Certificate signing", env("CERT_SIGNING_KEY"), "CERT_SIGNING_KEY"],
    ["Two-step verification", mfaMode() !== "off", "MFA_ENFORCEMENT"],
    ["Single sign-on", ssoEnabled(), "SSO_ENABLED"],
  ];
  const ok = checks.filter((c) => c[1]).length;

  return (
    <div className="office-page grid gap-5">
      <PageHeader
        title="Settings"
        subtitle="System configuration. Secrets (keys, passwords, database and storage credentials) stay in the server environment."
      />
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <nav
          aria-label="Settings sections"
          className="grid gap-1 max-lg:flex max-lg:overflow-x-auto max-lg:pb-1"
        >
          {SECTIONS.map((s) => (
            <Link
              key={s.key}
              href={`/office/settings?s=${s.key}`}
              aria-current={s.key === current.key ? "page" : undefined}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-body-sm whitespace-nowrap text-fg-secondary transition-colors hover:bg-surface hover:text-fg aria-[current=page]:bg-surface aria-[current=page]:font-semibold aria-[current=page]:text-fg aria-[current=page]:shadow-1 [&_svg]:size-4 aria-[current=page]:[&_svg]:text-accent"
            >
              {s.icon}
              {s.label}
            </Link>
          ))}
          <Link
            href="/office/settings?s=environment"
            aria-current={sp.s === "environment" ? "page" : undefined}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-body-sm whitespace-nowrap text-fg-secondary transition-colors hover:bg-surface hover:text-fg aria-[current=page]:bg-surface aria-[current=page]:font-semibold aria-[current=page]:text-fg aria-[current=page]:shadow-1 [&_svg]:size-4"
          >
            <KeyRound />
            Server environment
          </Link>
        </nav>

        {sp.s === "environment" ? (
          <Card title="Server environment" key="environment">
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 36 36" className="size-16 -rotate-90" aria-hidden>
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  strokeWidth="4"
                  className="stroke-[color-mix(in_oklab,var(--text-primary)_10%,transparent)]"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="#0f8a6a"
                  pathLength={1}
                  strokeDasharray={`${ok / checks.length} 1`}
                  className="office-draw"
                />
              </svg>
              <div>
                <p className="font-display text-heading-lg">
                  {ok}/{checks.length}
                </p>
                <p className="text-body-sm text-fg-secondary">services configured on the server</p>
              </div>
            </div>
            <ul className="office-stagger mt-5 grid gap-2 sm:grid-cols-2">
              {checks.map(([label, on, key]) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-subtle px-3.5 py-2.5"
                >
                  {on ? (
                    <ShieldCheck className="size-4 text-success" aria-hidden />
                  ) : (
                    <CircleDashed className="size-4 text-fg-muted" aria-hidden />
                  )}
                  <span className="flex-1 text-body-sm font-medium">{label}</span>
                  <code className="font-mono text-[0.6875rem] text-fg-muted">{key}</code>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.8125rem] text-fg-muted">
              Values are never shown here. They are changed in the hosting provider&apos;s
              environment settings, followed by a redeploy.
            </p>
          </Card>
        ) : (
          <div
            className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]"
            key={current.key}
          >
            <Card title={current.label}>
              <p className="-mt-1 mb-5 text-body-sm text-fg-secondary">{current.intro}</p>
              <SettingsForm section={current.key} fields={current.fields} />
            </Card>
            {current.aside && (
              <Card title="In effect now" className="min-w-0">
                {current.aside}
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
