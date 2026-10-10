import type { CollectionConfig } from "payload";
import { orderField, referenceCollection, slugField } from "@/fields/common";
import { ICON_NAMES } from "@/lib/icons";

// FR-SRV-04 technology taxonomy.
export const Technologies: CollectionConfig = referenceCollection({
  slug: "technologies",
  admin: { group: "Taxonomy", useAsTitle: "name", defaultColumns: ["name", "category"] },
  fields: [
    { name: "name", type: "text", required: true },
    slugField("name"),
    {
      name: "category",
      type: "select",
      required: true,
      options: ["frontend", "mobile", "backend", "data", "cloud", "ai", "hardware", "design"].map(
        (v) => ({ label: v, value: v }),
      ),
    },
    { name: "logo", type: "upload", relationTo: "media" },
    orderField,
  ],
});

// Logo cloud (FR-HOME-02). showOnSite requires written permission (OI-13).
export const Clients: CollectionConfig = referenceCollection({
  slug: "clients",
  admin: { group: "Taxonomy", useAsTitle: "name" },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "url", type: "text" },
    {
      name: "country",
      type: "text",
      admin: { description: "ISO code, e.g. RW, DE — used for Kigali → World" },
    },
    {
      name: "showOnSite",
      type: "checkbox",
      defaultValue: false,
      label: "Permission to show publicly",
    },
    orderField,
  ],
});

// FR-HOME-07 / CNT-05: only approved quotes are ever rendered.
export const Testimonials: CollectionConfig = referenceCollection({
  slug: "testimonials",
  admin: {
    group: "Content",
    useAsTitle: "personName",
    defaultColumns: ["personName", "company", "approved"],
  },
  fields: [
    { name: "quote", type: "textarea", required: true, localized: true },
    { name: "personName", type: "text", required: true },
    { name: "role", type: "text", localized: true },
    { name: "company", type: "text" },
    { name: "photo", type: "upload", relationTo: "media" },
    {
      type: "row",
      fields: [
        { name: "approved", type: "checkbox", label: "Written approval received" },
        { name: "consentDate", type: "date", admin: { condition: (d) => Boolean(d?.approved) } },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.approved && !data.consentDate)
          throw new Error("Add the date written approval was received (CNT-05).");
        return data;
      },
    ],
  },
});

export const Faqs: CollectionConfig = referenceCollection({
  slug: "faqs",
  labels: { singular: "FAQ", plural: "FAQs" },
  admin: { group: "Content", useAsTitle: "question" },
  fields: [
    { name: "question", type: "text", required: true, localized: true },
    { name: "answer", type: "textarea", required: true, localized: true },
    {
      name: "topic",
      type: "select",
      options: ["general", "services", "academy", "careers", "engagement"].map((v) => ({
        label: v,
        value: v,
      })),
    },
    orderField,
  ],
});

/**
 * IX-01 Proof Ledger: every number on the site has a source, an as-of date and
 * a verifier. Stats older than 18 months stop rendering (CNT-04).
 */
export const Stats: CollectionConfig = referenceCollection({
  slug: "stats",
  admin: {
    group: "Content",
    useAsTitle: "key",
    defaultColumns: ["key", "value", "asOf", "public"],
  },
  fields: [
    {
      name: "key",
      type: "text",
      required: true,
      unique: true,
      admin: { description: "Internal id, e.g. projects-delivered" },
    },
    {
      type: "row",
      fields: [
        { name: "value", type: "number", required: true },
        { name: "prefix", type: "text", admin: { width: "20%" } },
        { name: "suffix", type: "text", admin: { width: "20%", description: "e.g. + or %" } },
      ],
    },
    { name: "label", type: "text", required: true, localized: true },
    { name: "icon", type: "select", options: ICON_NAMES.map((v) => ({ label: v, value: v })) },
    {
      type: "row",
      fields: [
        { name: "asOf", type: "date", required: true },
        { name: "verifiedBy", type: "text", required: true },
      ],
    },
    {
      name: "source",
      type: "textarea",
      required: true,
      admin: { description: "How this number was counted. Internal only." },
    },
    {
      name: "public",
      type: "checkbox",
      defaultValue: false,
      label: "Verified and approved for the website",
    },
    orderField,
  ],
});
