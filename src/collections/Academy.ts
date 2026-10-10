import type { CollectionConfig } from "payload";
import { anyone, roleAccess } from "@/access/roles";
import { contentCollection, orderField, seoField, slugField } from "@/fields/common";
import { revalidateCollection } from "@/lib/cms/revalidate";
import { ICON_NAMES } from "@/lib/icons";

export const PROGRAM_MODES = ["online", "in-person", "hybrid"] as const;
export const PROGRAM_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export const PROGRAM_CATEGORIES = [
  "coding",
  "ai-robotics",
  "drones-iot",
  "design",
  "it-support",
  "science",
  "leadership",
] as const;

// SRS §11 Program + FR-ACA-02/03.
export const Programs: CollectionConfig = contentCollection({
  slug: "programs",
  editors: ["editor", "academy"],
  admin: {
    group: "Academy",
    useAsTitle: "title",
    defaultColumns: ["title", "category", "mode", "_status"],
  },
  defaultSort: "order",
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    slugField(),
    orderField,
    {
      type: "row",
      fields: [
        {
          name: "category",
          type: "select",
          required: true,
          options: PROGRAM_CATEGORIES.map((v) => ({ label: v, value: v })),
        },
        {
          name: "mode",
          type: "select",
          required: true,
          enumName: "enum_programs_delivery",
          options: PROGRAM_MODES.map((v) => ({ label: v, value: v })),
        },
        {
          name: "level",
          type: "select",
          required: true,
          options: PROGRAM_LEVELS.map((v) => ({ label: v, value: v })),
        },
      ],
    },
    { name: "icon", type: "select", options: ICON_NAMES.map((v) => ({ label: v, value: v })) },
    { name: "summary", type: "textarea", required: true, localized: true },
    {
      name: "outcomes",
      type: "array",
      localized: true,
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      type: "row",
      fields: [
        { name: "durationWeeks", type: "number", required: true, min: 1 },
        { name: "hoursPerWeek", type: "number" },
        {
          name: "schedule",
          type: "text",
          localized: true,
          admin: { description: "e.g. “Mon, Wed, Fri · 18:00–20:00”" },
        },
      ],
    },
    {
      name: "fee",
      type: "group",
      fields: [
        { name: "isFree", type: "checkbox", label: "Free or sponsored" },
        { name: "amount", type: "number", admin: { condition: (_, s) => !s?.isFree } },
        {
          name: "currency",
          type: "select",
          defaultValue: "RWF",
          options: ["RWF", "USD"].map((v) => ({ label: v, value: v })),
          admin: { condition: (_, s) => !s?.isFree },
        },
        {
          name: "note",
          type: "text",
          localized: true,
          admin: { description: "e.g. “Pay in 3 instalments”" },
        },
      ],
    },
    { name: "location", type: "text", localized: true },
    {
      name: "prerequisites",
      type: "array",
      localized: true,
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "curriculum",
      type: "array",
      localized: true,
      fields: [
        { name: "module", type: "text", required: true },
        { name: "weeks", type: "text", admin: { description: "e.g. “Weeks 1–2”" } },
        { name: "topics", type: "textarea", admin: { description: "One topic per line" } },
      ],
    },
    { name: "instructors", type: "relationship", relationTo: "team-members", hasMany: true },
    { name: "faqs", type: "relationship", relationTo: "faqs", hasMany: true },
    { name: "cover", type: "upload", relationTo: "media" },
    seoField,
  ],
});

/**
 * SRS §11 Intake + FR-ACA-06: capacity drives "seats left" (IX-12) and the
 * automatic switch to waitlist. `accepted` is maintained from applications.
 */
const intakeReval = revalidateCollection("intakes");
export const Intakes: CollectionConfig = {
  slug: "intakes",
  admin: {
    group: "Academy",
    useAsTitle: "label",
    defaultColumns: ["label", "program", "startDate", "applicationDeadline", "status"],
  },
  access: {
    read: anyone,
    create: roleAccess("academy"),
    update: roleAccess("academy"),
    delete: roleAccess("academy"),
  },
  hooks: {
    afterChange: [
      intakeReval.afterChange,
      async ({ doc }) => {
        const { revalidateTags } = await import("@/lib/cms/revalidate");
        await revalidateTags(["programs"]);
        return doc;
      },
    ],
    afterDelete: [intakeReval.afterDelete],
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      admin: { description: "e.g. “February 2027 — evening cohort”" },
    },
    { name: "program", type: "relationship", relationTo: "programs", required: true, index: true },
    {
      type: "row",
      fields: [
        { name: "startDate", type: "date", required: true },
        { name: "endDate", type: "date" },
        { name: "applicationDeadline", type: "date", required: true },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "capacity", type: "number", required: true, min: 1 },
        {
          name: "accepted",
          type: "number",
          defaultValue: 0,
          admin: { readOnly: true, description: "Counted from accepted applications" },
        },
      ],
    },
    {
      name: "status",
      type: "select",
      defaultValue: "open",
      enumName: "enum_intakes_state",
      options: ["open", "closed"].map((v) => ({ label: v, value: v })),
      admin: {
        description: "“Full” is computed from capacity; close manually to stop applications.",
      },
    },
  ],
};

// SRS §11 TeamMember (instructors now; leadership page in S5). FR-TEAM-03: no personal contacts.
export const TeamMembers: CollectionConfig = {
  slug: "team-members",
  admin: {
    group: "Company",
    useAsTitle: "name",
    defaultColumns: ["name", "title", "isLeadership"],
  },
  access: {
    read: anyone,
    create: roleAccess("editor", "hr"),
    update: roleAccess("editor", "hr"),
    delete: roleAccess("editor", "hr"),
  },
  hooks: {
    afterChange: [revalidateCollection("team-members").afterChange],
    afterDelete: [revalidateCollection("team-members").afterDelete],
  },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true },
    { name: "title", type: "text", localized: true },
    { name: "bio", type: "textarea", localized: true },
    { name: "photo", type: "upload", relationTo: "media" },
    { name: "linkedinUrl", type: "text" },
    { name: "isLeadership", type: "checkbox" },
    orderField,
  ],
};
