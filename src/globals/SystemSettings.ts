import type { GlobalConfig } from "payload";
import { allow } from "@/access/roles";
import { audit } from "@/lib/audit";
import { revalidateTags } from "@/lib/cms/revalidate";

const email = (name: string, label: string) => ({ name, label, type: "email" as const });

// System configuration managed in the office (Settings). Values that change with the
// business live here instead of environment variables; secrets (keys, passwords,
// database and storage credentials) stay in the environment. Every value falls back to
// its old environment variable, then to a default (src/lib/settings.ts).
export const SystemSettings: GlobalConfig = {
  slug: "system-settings",
  label: "System settings",
  admin: {
    group: "Settings",
    description: "Easier to manage in the office under Settings.",
  },
  // Webhook URLs can carry tokens: readable by settings managers only (the server reads it directly).
  access: { read: allow("settings.manage"), update: allow("settings.manage") },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const { clearSettingsCache } = await import("@/lib/settings");
        clearSettingsCache();
        await revalidateTags(["global:system-settings"]);
        const changed = Object.keys(doc).filter(
          (k) =>
            !["updatedAt", "createdAt", "globalType", "id"].includes(k) &&
            JSON.stringify(doc[k]) !== JSON.stringify(previousDoc?.[k]),
        );
        if (req.user && changed.length)
          await audit(req, {
            action: "settings.update",
            entity: "system-settings",
            meta: { sections: changed },
          });
        return doc;
      },
    ],
  },
  fields: [
    {
      name: "email",
      type: "group",
      fields: [
        { name: "fromName", type: "text", defaultValue: "Universal Bridge" },
        { name: "fromAddress", type: "email" },
        {
          name: "inboxes",
          type: "group",
          fields: [
            email("sales", "Sales & projects"),
            email("academy", "Academy"),
            email("careers", "Careers"),
            email("partnerships", "Partnerships"),
            email("press", "Press"),
            email("support", "Support"),
            email("events", "Events"),
          ],
        },
      ],
    },
    {
      name: "accounts",
      type: "group",
      fields: [
        { name: "registrationOpen", type: "checkbox", defaultValue: true },
        {
          name: "defaultMemberRole",
          type: "relationship",
          relationTo: "roles",
          filterOptions: { audience: { equals: "member" } },
        },
        {
          name: "applicantRole",
          type: "relationship",
          relationTo: "roles",
          filterOptions: { audience: { equals: "member" } },
        },
        {
          name: "staffLanding",
          type: "select",
          defaultValue: "office",
          options: [
            { label: "Company office", value: "office" },
            { label: "Content (CMS)", value: "cms" },
          ],
        },
        { name: "ssoDomains", type: "text" },
      ],
    },
    {
      name: "workflow",
      type: "group",
      fields: [
        { name: "responseHours", type: "number", defaultValue: 24, min: 1 },
        { name: "followUpDays", type: "number", defaultValue: 3, min: 1 },
        { name: "notifyApplicants", type: "checkbox", defaultValue: true },
        { name: "boardLimit", type: "number", defaultValue: 40, min: 10, max: 200 },
        { name: "defaultCurrency", type: "text", defaultValue: "RWF" },
      ],
    },
    {
      name: "uploads",
      type: "group",
      fields: [
        { name: "maxMb", type: "number", defaultValue: 5, min: 1, max: 25 },
        { name: "clamavHost", type: "text" },
      ],
    },
    {
      name: "integrations",
      type: "group",
      fields: [
        { name: "plausibleDomain", type: "text" },
        // Google Analytics 4: on by default with the company's web stream (GA_DEFAULT_ID).
        { name: "gaEnabled", type: "checkbox", defaultValue: true },
        {
          // Another GA4 web stream (G-XXXXXXX); empty = NEXT_PUBLIC_GA_MEASUREMENT_ID, else the default.
          name: "gaMeasurementId",
          type: "text",
          validate: (v: unknown) =>
            !v || /^G-[A-Z0-9]{4,20}$/.test(String(v)) || "Use the GA4 measurement ID (G-XXXXXXX).",
        },
        { name: "calLink", type: "text" },
        { name: "crmWebhookUrl", type: "text" },
        { name: "teamWebhookUrl", type: "text" },
      ],
    },
    {
      name: "retention",
      type: "group",
      fields: [
        { name: "leadsMonths", type: "number", defaultValue: 24, min: 1 },
        { name: "applicationsMonths", type: "number", defaultValue: 12, min: 1 },
        { name: "pageViewsMonths", type: "number", defaultValue: 13, min: 1 },
        { name: "orphanFilesDays", type: "number", defaultValue: 30, min: 1 },
        { name: "subscribersDays", type: "number", defaultValue: 30, min: 1 },
      ],
    },
    {
      name: "site",
      type: "group",
      fields: [
        { name: "noindex", type: "checkbox", defaultValue: false },
        // Maintenance: visitors see a holding page (HTTP 503); signed-in staff see the site.
        { name: "maintenance", type: "checkbox", defaultValue: false },
        { name: "maintenanceMessage", type: "textarea" },
        { name: "maintenanceUntil", type: "date" },
      ],
    },
  ],
};
