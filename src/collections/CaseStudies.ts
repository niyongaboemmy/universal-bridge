import type { CollectionConfig } from "payload";
import { contentCollection, seoField, slugField } from "@/fields/common";

export const REGIONS = [
  "rwanda",
  "east-africa",
  "africa",
  "europe",
  "north-america",
  "middle-east",
  "global",
] as const;

// SRS §11 CaseStudy + FR-WORK-01…04.
export const CaseStudies: CollectionConfig = contentCollection({
  slug: "case-studies",
  labels: { singular: "Case study", plural: "Case studies" },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "industry", "featured", "_status"],
  },
  defaultSort: "-publishedAt",
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    slugField(),
    {
      name: "client",
      type: "group",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          admin: { description: "Shown only if not anonymised." },
        },
        {
          name: "anonymised",
          type: "checkbox",
          admin: { description: "FR-WORK-03: NDA — show the label below instead." },
        },
        {
          name: "label",
          type: "text",
          localized: true,
          admin: { description: "e.g. “Leading East African bank”" },
        },
        { name: "logo", type: "upload", relationTo: "media" },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "industry", type: "relationship", relationTo: "industries" },
        { name: "region", type: "select", options: REGIONS.map((r) => ({ label: r, value: r })) },
        { name: "year", type: "number" },
      ],
    },
    { name: "services", type: "relationship", relationTo: "services", hasMany: true },
    { name: "technologies", type: "relationship", relationTo: "technologies", hasMany: true },
    { name: "summary", type: "textarea", required: true, localized: true },
    { name: "cover", type: "upload", relationTo: "media" },
    {
      name: "results",
      type: "array",
      maxRows: 4,
      admin: { description: "Numeric outcomes. The first is the headline result on cards." },
      fields: [
        {
          name: "value",
          type: "text",
          required: true,
          admin: { description: "e.g. 38%, 3×, 12k" },
        },
        { name: "label", type: "text", required: true, localized: true },
      ],
    },
    { name: "challenge", type: "richText", localized: true },
    { name: "solution", type: "richText", localized: true },
    { name: "gallery", type: "upload", relationTo: "media", hasMany: true },
    { name: "testimonial", type: "relationship", relationTo: "testimonials" },
    { name: "team", type: "array", fields: [{ name: "role", type: "text", localized: true }] },
    { name: "featured", type: "checkbox", admin: { position: "sidebar" } },
    {
      name: "publishedAt",
      type: "date",
      admin: { position: "sidebar" },
      defaultValue: () => new Date().toISOString(),
    },
    seoField,
  ],
});
