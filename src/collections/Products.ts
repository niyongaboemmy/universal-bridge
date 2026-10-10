import type { CollectionConfig } from "payload";
import { contentCollection, orderField, seoField, slugField } from "@/fields/common";
import { ICON_NAMES } from "@/lib/icons";

// SRS §11 Product + FR-PRD-01…04. Concept products stay "soon" until OI-05.
export const Products: CollectionConfig = contentCollection({
  slug: "products",
  admin: { group: "Content", useAsTitle: "name", defaultColumns: ["name", "status", "_status"] },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true },
    slugField("name"),
    orderField,
    {
      name: "status",
      // Distinct from the drafts `_status` enum, which would otherwise share the name.
      enumName: "enum_products_lifecycle",
      type: "select",
      required: true,
      defaultValue: "soon",
      options: ["live", "beta", "soon"].map((v) => ({ label: v, value: v })),
    },
    { name: "tagline", type: "text", required: true, localized: true },
    { name: "summary", type: "textarea", localized: true },
    { name: "audience", type: "textarea", localized: true },
    {
      name: "features",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea" },
        { name: "icon", type: "select", options: ICON_NAMES.map((v) => ({ label: v, value: v })) },
      ],
    },
    { name: "screenshots", type: "upload", relationTo: "media", hasMany: true },
    { name: "externalUrl", type: "text" },
    {
      name: "ctas",
      type: "array",
      localized: true,
      admin: { description: "Extra calls to action, e.g. “Join as a tailor” (FR-PRD-03)." },
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
      ],
    },
    seoField,
  ],
});
