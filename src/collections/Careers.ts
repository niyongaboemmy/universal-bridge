import type { CollectionConfig } from "payload";
import { contentCollection, seoField, slugField } from "@/fields/common";

// SRS §11 Job + FR-CAR-01/02.
export const Jobs: CollectionConfig = contentCollection({
  slug: "jobs",
  editors: ["content.careers"],
  admin: {
    group: "Company",
    useAsTitle: "title",
    defaultColumns: ["title", "department", "location", "_status"],
  },
  defaultSort: "-createdAt",
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    slugField(),
    {
      type: "row",
      fields: [
        {
          name: "department",
          type: "select",
          required: true,
          options: ["engineering", "design", "academy", "sales", "operations"].map((v) => ({
            label: v,
            value: v,
          })),
        },
        {
          name: "employmentType",
          type: "select",
          required: true,
          options: ["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN"].map((v) => ({
            label: v,
            value: v,
          })),
        },
        {
          name: "remotePolicy",
          type: "select",
          required: true,
          options: ["onsite", "hybrid", "remote"].map((v) => ({ label: v, value: v })),
        },
      ],
    },
    { name: "location", type: "text", required: true, defaultValue: "Kigali, Rwanda" },
    { name: "summary", type: "textarea", required: true, localized: true },
    {
      name: "responsibilities",
      type: "array",
      localized: true,
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "requirements",
      type: "array",
      localized: true,
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "niceToHave",
      type: "array",
      localized: true,
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "salary",
      type: "group",
      admin: { description: "Optional. Shown and added to JobPosting JSON-LD when set." },
      fields: [
        { name: "min", type: "number" },
        { name: "max", type: "number" },
        {
          name: "currency",
          type: "select",
          defaultValue: "RWF",
          options: ["RWF", "USD"].map((v) => ({ label: v, value: v })),
        },
        {
          name: "period",
          type: "select",
          defaultValue: "MONTH",
          options: ["MONTH", "YEAR"].map((v) => ({ label: v, value: v })),
        },
      ],
    },
    { name: "validThrough", type: "date", required: true },
    seoField,
  ],
});
