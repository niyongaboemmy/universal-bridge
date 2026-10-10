import type { CollectionConfig } from "payload";
import {
  referenceCollection,
  contentCollection,
  orderField,
  seoField,
  slugField,
} from "@/fields/common";
import { ICON_NAMES } from "@/lib/icons";

// FR-LAB-01…03: innovation hubs.
export const Hubs: CollectionConfig = contentCollection({
  slug: "hubs",
  admin: { group: "Content", useAsTitle: "name", defaultColumns: ["name", "_status", "order"] },
  defaultSort: "order",
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    slugField("name"),
    orderField,
    { name: "icon", type: "select", options: ICON_NAMES.map((v) => ({ label: v, value: v })) },
    { name: "tagline", type: "text", required: true, localized: true },
    { name: "summary", type: "textarea", required: true, localized: true },
    { name: "cover", type: "upload", relationTo: "media" },
    {
      name: "focusAreas",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea" },
        { name: "icon", type: "select", options: ICON_NAMES.map((v) => ({ label: v, value: v })) },
      ],
    },
    {
      name: "equipment",
      type: "array",
      localized: true,
      fields: [{ name: "text", type: "text", required: true }],
    },
    {
      name: "projects",
      type: "array",
      localized: true,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea" },
        {
          name: "status",
          type: "select",
          options: ["exploring", "prototype", "pilot", "live"].map((v) => ({ label: v, value: v })),
        },
      ],
    },
    { name: "people", type: "relationship", relationTo: "team-members", hasMany: true },
    seoField,
  ],
});

export const Categories: CollectionConfig = referenceCollection({
  slug: "categories",
  admin: { group: "Insights", useAsTitle: "title" },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    slugField(),
    orderField,
  ],
});

// FR-BLOG-01…04.
export const Posts: CollectionConfig = contentCollection({
  slug: "posts",
  admin: {
    group: "Insights",
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "_status"],
  },
  defaultSort: "-publishedAt",
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    slugField(),
    { name: "excerpt", type: "textarea", required: true, localized: true, maxLength: 240 },
    { name: "cover", type: "upload", relationTo: "media" },
    { name: "body", type: "richText", required: true, localized: true },
    {
      type: "row",
      fields: [
        { name: "author", type: "relationship", relationTo: "team-members" },
        {
          name: "publishedAt",
          type: "date",
          required: true,
          defaultValue: () => new Date().toISOString(),
        },
      ],
    },
    { name: "categories", type: "relationship", relationTo: "categories", hasMany: true },
    { name: "tags", type: "text", hasMany: true },
    { name: "featured", type: "checkbox", admin: { position: "sidebar" } },
    seoField,
  ],
});

// FR-EVT-01.
export const Events: CollectionConfig = contentCollection({
  slug: "events",
  admin: {
    group: "Company",
    useAsTitle: "title",
    defaultColumns: ["title", "startAt", "kind", "_status"],
  },
  defaultSort: "-startAt",
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    slugField(),
    {
      type: "row",
      fields: [
        {
          name: "kind",
          type: "select",
          required: true,
          options: ["hackathon", "workshop", "meetup", "webinar"].map((v) => ({
            label: v,
            value: v,
          })),
        },
        {
          name: "startAt",
          type: "date",
          required: true,
          admin: { date: { pickerAppearance: "dayAndTime" } },
        },
        { name: "endAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" } } },
      ],
    },
    { name: "summary", type: "textarea", required: true, localized: true },
    { name: "body", type: "richText", localized: true },
    {
      name: "venue",
      type: "group",
      fields: [
        { name: "online", type: "checkbox" },
        { name: "name", type: "text" },
        { name: "address", type: "text" },
      ],
    },
    { name: "cover", type: "upload", relationTo: "media" },
    {
      name: "agenda",
      type: "array",
      localized: true,
      fields: [
        { name: "time", type: "text", required: true },
        { name: "title", type: "text", required: true },
      ],
    },
    {
      name: "registration",
      type: "group",
      fields: [
        { name: "open", type: "checkbox", defaultValue: true },
        { name: "capacity", type: "number" },
        { name: "teams", type: "checkbox", label: "Ask for a team name (hackathons)" },
      ],
    },
    { name: "gallery", type: "upload", relationTo: "media", hasMany: true },
    seoField,
  ],
});

// FR-PRS-01.
export const PressItems: CollectionConfig = referenceCollection({
  slug: "press-items",
  labels: { singular: "Press item", plural: "Press" },
  admin: {
    group: "Company",
    useAsTitle: "title",
    defaultColumns: ["title", "outlet", "date", "kind"],
  },
  defaultSort: "-date",
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    {
      name: "kind",
      type: "select",
      required: true,
      options: ["news", "mention"].map((v) => ({ label: v, value: v })),
    },
    { name: "outlet", type: "text" },
    { name: "date", type: "date", required: true },
    { name: "url", type: "text" },
    { name: "summary", type: "textarea", localized: true },
  ],
});
