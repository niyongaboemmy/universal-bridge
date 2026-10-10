import type { CollectionConfig } from "payload";
import { contentCollection, orderField, seoField, slugField } from "@/fields/common";
import { ICON_NAMES } from "@/lib/icons";

// SRS §11 Industry + FR-SOL-01/02.
export const Industries: CollectionConfig = contentCollection({
  slug: "industries",
  admin: { group: "Content", useAsTitle: "title", defaultColumns: ["title", "_status", "order"] },
  defaultSort: "order",
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    slugField(),
    orderField,
    { name: "icon", type: "select", options: ICON_NAMES.map((v) => ({ label: v, value: v })) },
    { name: "summary", type: "textarea", required: true, localized: true },
    {
      name: "challenges",
      type: "array",
      localized: true,
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "solutions",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea" },
      ],
    },
    { name: "services", type: "relationship", relationTo: "services", hasMany: true },
    seoField,
  ],
});
