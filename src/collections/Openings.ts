import type { Access, CollectionConfig } from "payload";
import { allow, can, actingFromReq } from "@/access/roles";
import { auditHooks } from "@/lib/audit";
import { revalidateTags } from "@/lib/cms/revalidate";
import { APPLICATION_TYPES } from "./Applications";

export const OPENING_STATUSES = ["draft", "open", "paused", "closed"] as const;
export const OPENING_MODES = ["onsite", "remote", "hybrid"] as const;
export const FIELD_TYPES = [
  "text",
  "textarea",
  "email",
  "tel",
  "number",
  "url",
  "date",
  "select",
  "radio",
  "checkbox",
  "file",
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

/** One question on an opening's application form (built in the office). */
export type OpeningField = {
  id?: string | null;
  key: string;
  label: string;
  type: FieldType;
  required?: boolean | null;
  help?: string | null;
  options?: string | null; // one per line (select, radio)
  width?: "full" | "half" | null;
};

const staffRead: Access = ({ req }) => {
  if (
    req.user?.collection === "users" &&
    can(actingFromReq(req), "openings.view", "openings.manage")
  )
    return true;
  // The public sees openings that are open (closed ones keep their page, without the form).
  return { status: { in: ["open", "closed"] } };
};

// Openings: what people can apply to (an Academy intake, an internship round, a job, a
// partner programme, an event). Each one carries its own dates, seats and application
// form; applications made through it are linked back for the office's board.
export const Openings: CollectionConfig = {
  slug: "openings",
  labels: { singular: "Opening", plural: "Openings" },
  admin: {
    group: "Inbox",
    useAsTitle: "title",
    defaultColumns: ["title", "kind", "status", "closesAt"],
    description: "Easier to manage in the office under Openings.",
  },
  access: {
    read: staffRead,
    create: allow("openings.manage"),
    update: allow("openings.manage"),
    delete: allow("openings.manage"),
  },
  hooks: {
    ...auditHooks("openings"),
    afterChange: [
      ...auditHooks("openings").afterChange,
      async ({ doc }) => {
        await revalidateTags(["openings", `openings:${doc.slug}`]);
        return doc;
      },
    ],
    afterDelete: [
      ...auditHooks("openings").afterDelete,
      async ({ doc }) => {
        await revalidateTags(["openings", `openings:${doc.slug}`]);
        return doc;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    {
      type: "row",
      fields: [
        {
          name: "kind",
          type: "select",
          required: true,
          index: true,
          options: APPLICATION_TYPES.map((v) => ({ label: v, value: v })),
        },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "draft",
          index: true,
          options: OPENING_STATUSES.map((v) => ({ label: v, value: v })),
        },
        {
          name: "mode",
          type: "select",
          defaultValue: "onsite",
          options: OPENING_MODES.map((v) => ({ label: v, value: v })),
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "opensAt", type: "date" },
        { name: "closesAt", type: "date", index: true },
        { name: "startsAt", type: "date" },
        { name: "seats", type: "number", min: 0 },
      ],
    },
    { name: "location", type: "text", localized: true },
    { name: "summary", type: "textarea", localized: true },
    { name: "description", type: "textarea", localized: true },
    { name: "cover", type: "upload", relationTo: "media" },
    {
      type: "row",
      fields: [
        { name: "program", type: "relationship", relationTo: "programs" },
        { name: "intake", type: "relationship", relationTo: "intakes" },
        { name: "job", type: "relationship", relationTo: "jobs" },
        { name: "event", type: "relationship", relationTo: "events" },
      ],
    },
    { name: "owner", type: "relationship", relationTo: "users" },
    {
      name: "requireAccount",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Applicants sign in (or register) before applying." },
    },
    { name: "featured", type: "checkbox", defaultValue: false },
    {
      name: "fields",
      label: "Application form",
      type: "array",
      fields: [
        {
          type: "row",
          fields: [
            { name: "key", type: "text", required: true },
            { name: "label", type: "text", required: true, localized: true },
            {
              name: "type",
              type: "select",
              required: true,
              defaultValue: "text",
              options: FIELD_TYPES.map((v) => ({ label: v, value: v })),
            },
            { name: "required", type: "checkbox", defaultValue: false },
            {
              name: "width",
              type: "select",
              defaultValue: "full",
              options: [
                { label: "Full", value: "full" },
                { label: "Half", value: "half" },
              ],
            },
          ],
        },
        { name: "help", type: "text", localized: true },
        { name: "options", type: "textarea", admin: { description: "One per line" } },
      ],
    },
  ],
};
