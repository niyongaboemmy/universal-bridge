import type { CollectionConfig } from "payload";
import { contentCollection, orderField, seoField, slugField } from "@/fields/common";
import { ICON_NAMES } from "@/lib/icons";

export const PILLARS = ["engineering", "technology", "innovation", "consulting"] as const;
export const ENGAGEMENT_MODELS = [
  "fixed-scope",
  "dedicated-team",
  "staff-augmentation",
  "retainer",
] as const;

// SRS §11 Service + FR-SRV-01…05.
export const Services: CollectionConfig = contentCollection({
  slug: "services",
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "pillar", "_status", "order"],
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
          name: "pillar",
          type: "select",
          required: true,
          options: PILLARS.map((p) => ({ label: p, value: p })),
        },
        { name: "icon", type: "select", options: ICON_NAMES.map((v) => ({ label: v, value: v })) },
      ],
    },
    {
      name: "summary",
      type: "textarea",
      required: true,
      localized: true,
      admin: { description: "One line for cards and menus." },
    },
    {
      name: "outcome",
      type: "textarea",
      localized: true,
      admin: { description: "Hero statement: the outcome the client gets." },
    },
    {
      name: "problem",
      type: "textarea",
      localized: true,
      admin: { description: "The problem this service solves." },
    },
    {
      name: "deliverables",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "text" },
      ],
    },
    {
      name: "process",
      type: "array",
      localized: true,
      admin: { description: "How it works (stepper)." },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea" },
      ],
    },
    {
      name: "engagementModels",
      type: "select",
      hasMany: true,
      options: ENGAGEMENT_MODELS.map((m) => ({ label: m, value: m })),
    },
    { name: "technologies", type: "relationship", relationTo: "technologies", hasMany: true },
    { name: "faqs", type: "relationship", relationTo: "faqs", hasMany: true },
    seoField,
  ],
});
