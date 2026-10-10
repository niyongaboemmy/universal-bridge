import type { CollectionConfig } from "payload";
import { roleAccess, nobody } from "@/access/roles";
import { auditHooks } from "@/lib/audit";

// SRS §11 Lead + ADM-02/03 inbox and status workflow.
export const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"] as const;
export const DEPARTMENTS = [
  "sales",
  "academy",
  "careers",
  "partnerships",
  "press",
  "support",
] as const;

export const Leads: CollectionConfig = {
  slug: "leads",
  labels: { singular: "Lead", plural: "Leads" },
  admin: {
    components: { beforeListTable: ["@/components/admin/ExportCsv#ExportCsv"] },
    group: "Inbox",
    useAsTitle: "name",
    defaultColumns: ["ref", "name", "company", "department", "status", "createdAt"],
    listSearchableFields: ["name", "email", "company", "ref"],
    description:
      "Project inquiries and contact messages (ADM-02). Personal data — handle under the privacy policy.",
  },
  access: {
    read: roleAccess("sales"),
    update: roleAccess("sales"),
    delete: roleAccess("super"),
    create: nobody, // only the public form (server action) creates leads
  },
  hooks: auditHooks("leads"),
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "ref",
          type: "text",
          required: true,
          unique: true,
          index: true,
          admin: { readOnly: true, width: "33%" },
        },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "new",
          index: true,
          options: LEAD_STATUSES.map((s) => ({
            label: s[0]!.toUpperCase() + s.slice(1),
            value: s,
          })),
          admin: { width: "33%" },
        },
        { name: "assignee", type: "relationship", relationTo: "users", admin: { width: "33%" } },
      ],
    },
    {
      name: "department",
      type: "select",
      required: true,
      index: true,
      options: DEPARTMENTS.map((d) => ({ label: d[0]!.toUpperCase() + d.slice(1), value: d })),
    },
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "email", type: "email", required: true, index: true },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "company", type: "text" },
        { name: "country", type: "text" },
        { name: "phone", type: "text", admin: { description: "E.164" } },
      ],
    },
    {
      name: "services",
      type: "json",
      admin: { description: "Service slugs selected on the form" },
    },
    {
      name: "product",
      type: "text",
      admin: { description: "Set when sent from a product's “Request a demo” form (FR-PRD-02)" },
    },
    {
      type: "row",
      fields: [
        { name: "budgetRange", type: "text" },
        { name: "timeline", type: "text" },
        { name: "source", type: "text", label: "How they heard about us" },
      ],
    },
    { name: "message", type: "textarea", required: true },
    {
      name: "notes",
      type: "array",
      admin: { description: "Internal notes (ADM-04). Never shown to the submitter." },
      fields: [
        { name: "body", type: "textarea", required: true },
        { name: "author", type: "relationship", relationTo: "users" },
        { name: "at", type: "date", defaultValue: () => new Date().toISOString() },
      ],
    },
    {
      name: "tracking",
      type: "group",
      admin: { description: "FR-FORM-09" },
      fields: [
        { name: "utm", type: "json" },
        { name: "referrer", type: "text" },
        { name: "landingPage", type: "text" },
        { name: "locale", type: "text" },
      ],
    },
    {
      name: "consent",
      type: "group",
      admin: { description: "FR-FORM-04 / PRV-03" },
      fields: [
        { name: "text", type: "textarea" },
        { name: "version", type: "text" },
        { name: "at", type: "date" },
        { name: "marketing", type: "checkbox" },
      ],
    },
    {
      name: "botCheck",
      type: "select",
      defaultValue: "passed",
      options: ["passed", "missing", "skipped"].map((v) => ({ label: v, value: v })),
      admin: {
        position: "sidebar",
        description: "“missing” = submitted without JavaScript; review before replying.",
      },
    },
    {
      name: "firstResponseAt",
      type: "date",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Set when status first leaves “New” (IX-10).",
      },
    },
  ],
};
