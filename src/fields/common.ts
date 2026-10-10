import type { CollectionConfig, Field } from "payload";
import { previewFor } from "@/lib/live-edit/paths";
import { publishedOrEditor, roleAccess, type Role } from "@/access/roles";
import { revalidateCollection } from "@/lib/cms/revalidate";

export const slugify = (input: string) =>
  input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/** SEO-06: lowercase, hyphenated, unique; generated from the title if empty. */
export const slugField = (from = "title"): Field => ({
  name: "slug",
  type: "text",
  required: true,
  unique: true,
  index: true,
  admin: { position: "sidebar", description: "URL part. Lowercase letters, numbers and hyphens." },
  hooks: {
    beforeValidate: [
      ({ value, data }) => {
        const source = value || (data?.[from] as string | undefined);
        return typeof source === "string" ? slugify(source) : value;
      },
    ],
  },
  validate: (v: unknown) =>
    (typeof v === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) ||
    "Use lowercase letters, numbers and hyphens.",
});

/** CMS-10: per-document SEO fields. */
export const seoField: Field = {
  name: "seo",
  type: "group",
  admin: { description: "Leave empty to use the title and summary." },
  fields: [
    { name: "title", type: "text", localized: true, maxLength: 60 },
    { name: "description", type: "textarea", localized: true, maxLength: 155 },
    { name: "image", type: "upload", relationTo: "media" },
    {
      name: "canonical",
      type: "text",
      admin: { description: "Only for content first published elsewhere." },
    },
    { name: "noindex", type: "checkbox" },
  ],
};

export const orderField: Field = {
  name: "order",
  type: "number",
  defaultValue: 100,
  admin: { position: "sidebar", description: "Lower numbers appear first." },
};

/**
 * Standard content collection: drafts + scheduled publishing + version history
 * (CMS-06), public read of published docs only, revalidation on publish (CMS-08).
 */
export function contentCollection(
  config: Omit<CollectionConfig, "access" | "versions"> & { editors?: Role[] },
): CollectionConfig {
  const { editors = ["editor"], hooks, ...rest } = config;
  const reval = revalidateCollection(config.slug);
  return {
    ...rest,
    // CMS-07: "Preview" opens the document on the live site, ready to edit in place.
    admin: { ...rest.admin, preview: rest.admin?.preview ?? previewFor(config.slug) },
    access: {
      read: publishedOrEditor,
      create: roleAccess(...editors),
      update: roleAccess(...editors),
      delete: roleAccess("editor"),
    },
    versions: { drafts: { schedulePublish: true, autosave: { interval: 1500 } }, maxPerDoc: 50 },
    hooks: {
      ...hooks,
      afterChange: [...(hooks?.afterChange ?? []), reval.afterChange],
      afterDelete: [...(hooks?.afterDelete ?? []), reval.afterDelete],
    },
  };
}

/** Taxonomy / reference collection without drafts (technologies, clients…). */
export function referenceCollection(config: Omit<CollectionConfig, "access">): CollectionConfig {
  const reval = revalidateCollection(config.slug);
  return {
    ...config,
    access: {
      read: () => true,
      create: roleAccess("editor"),
      update: roleAccess("editor"),
      delete: roleAccess("editor"),
    },
    hooks: {
      ...config.hooks,
      afterChange: [...(config.hooks?.afterChange ?? []), reval.afterChange],
      afterDelete: [...(config.hooks?.afterDelete ?? []), reval.afterDelete],
    },
  };
}
