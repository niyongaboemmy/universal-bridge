import type { CollectionConfig } from "payload";
import { allow, isSuper, nobody } from "@/access/roles";
import { CURRENCIES } from "@/lib/currencies";
import { auditHooks } from "@/lib/audit";

/**
 * Company management (the /office dashboard): people, projects and tools, and
 * first-party website analytics. Content stays in the other collections.
 */

export const DEPARTMENTS_STAFF = [
  "leadership",
  "engineering",
  "design",
  "academy",
  "sales",
  "operations",
  "labs",
] as const;
export const EMPLOYMENT = ["full-time", "part-time", "contract", "intern"] as const;

// HR directory. Personal data: HR and super admins only.
export const Employees: CollectionConfig = {
  slug: "employees",
  labels: { singular: "Employee", plural: "Employees" },
  admin: {
    group: "Company",
    useAsTitle: "name",
    defaultColumns: ["name", "jobTitle", "department", "status", "startDate"],
    description: "Staff directory, managed from the Company dashboard (/office/people).",
  },
  access: {
    read: allow("people.view", "people.manage"),
    create: allow("people.manage"),
    update: allow("people.manage"),
    delete: isSuper,
  },
  hooks: auditHooks("employees"),
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "jobTitle", type: "text", required: true },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "department",
          type: "select",
          required: true,
          index: true,
          options: DEPARTMENTS_STAFF.map((v) => ({ label: v, value: v })),
        },
        {
          name: "employment",
          type: "select",
          required: true,
          defaultValue: "full-time",
          options: EMPLOYMENT.map((v) => ({ label: v, value: v })),
        },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "active",
          index: true,
          options: ["active", "on-leave", "left"].map((v) => ({ label: v, value: v })),
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "email", type: "email", required: true, unique: true },
        { name: "phone", type: "text" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "startDate", type: "date", required: true },
        { name: "endDate", type: "date" },
      ],
    },
    { name: "manager", type: "relationship", relationTo: "employees" },
    { name: "skills", type: "text", hasMany: true },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      admin: { description: "Their admin account, if any" },
    },
    {
      name: "notes",
      type: "textarea",
      admin: { description: "HR notes (not shown to the employee)" },
    },
  ],
};

export const PROJECT_STATUSES = ["planning", "active", "on-hold", "done", "cancelled"] as const;
export const PROJECT_KINDS = ["client", "internal-tool", "product"] as const;

// Delivery tracking: client projects, internal tools and UB products.
export const Projects: CollectionConfig = {
  slug: "projects",
  labels: { singular: "Project", plural: "Projects" },
  admin: {
    group: "Company",
    useAsTitle: "name",
    defaultColumns: ["name", "kind", "status", "health", "progress", "dueDate"],
    description: "Client projects, internal tools and products, managed from /office/projects.",
  },
  access: {
    read: allow("projects.view", "projects.manage"),
    create: allow("projects.manage"),
    update: allow("projects.manage"),
    delete: isSuper,
  },
  hooks: {
    ...auditHooks("projects"),
    beforeChange: [
      ...auditHooks("projects").beforeChange,
      async ({ data, originalDoc }) => {
        if (!data.currency && !originalDoc?.currency)
          data.currency = (await (await import("@/lib/settings")).settings()).currency;
        return data;
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "code", type: "text", admin: { description: "Short code, e.g. NYB" } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "kind",
          type: "select",
          required: true,
          defaultValue: "client",
          index: true,
          options: PROJECT_KINDS.map((v) => ({ label: v, value: v })),
        },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "planning",
          index: true,
          options: PROJECT_STATUSES.map((v) => ({ label: v, value: v })),
        },
        {
          name: "health",
          type: "select",
          required: true,
          defaultValue: "on-track",
          options: ["on-track", "at-risk", "off-track"].map((v) => ({ label: v, value: v })),
        },
      ],
    },
    { name: "summary", type: "textarea" },
    {
      type: "row",
      fields: [
        { name: "client", type: "text", admin: { description: "Client or owner" } },
        {
          name: "lead",
          type: "relationship",
          relationTo: "leads",
          admin: { description: "The request it came from" },
        },
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          admin: { description: "For product work" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "startDate", type: "date" },
        { name: "dueDate", type: "date", index: true },
        { name: "progress", type: "number", min: 0, max: 100, defaultValue: 0 },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "budget", type: "number", min: 0 },
        {
          name: "currency",
          type: "select",
          options: CURRENCIES.map((v) => ({ label: v, value: v })),
        },
      ],
    },
    { name: "owner", type: "relationship", relationTo: "employees" },
    { name: "team", type: "relationship", relationTo: "employees", hasMany: true },
    {
      name: "milestones",
      type: "array",
      fields: [
        {
          type: "row",
          fields: [
            { name: "title", type: "text", required: true },
            { name: "due", type: "date" },
            { name: "done", type: "checkbox" },
          ],
        },
      ],
    },
    {
      name: "links",
      type: "array",
      fields: [
        {
          type: "row",
          fields: [
            { name: "label", type: "text", required: true },
            { name: "url", type: "text", required: true },
          ],
        },
      ],
    },
  ],
};

// First-party, cookieless page views (only recorded after analytics consent).
export const PageViews: CollectionConfig = {
  slug: "page-views",
  admin: { group: "Settings", hidden: true },
  access: {
    read: allow("analytics.view"),
    create: nobody,
    update: nobody,
    delete: isSuper,
  },
  timestamps: true,
  fields: [
    { name: "path", type: "text", required: true, index: true },
    { name: "locale", type: "text" },
    { name: "referrer", type: "text", index: true },
    { name: "utmSource", type: "text" },
    { name: "utmMedium", type: "text" },
    { name: "utmCampaign", type: "text" },
    { name: "country", type: "text", index: true },
    { name: "device", type: "text" },
    { name: "browser", type: "text" },
    { name: "os", type: "text" },
    {
      name: "visitor",
      type: "text",
      index: true,
      admin: { description: "Daily-rotating hash; no IP or cookie stored" },
    },
    { name: "session", type: "text", index: true },
    {
      // Who was browsing: a visitor, a signed-in website member, or staff.
      name: "audience",
      type: "select",
      defaultValue: "visitor",
      index: true,
      options: [
        { label: "Visitor", value: "visitor" },
        { label: "Website member", value: "member" },
        { label: "Staff", value: "staff" },
      ],
    },
  ],
};
