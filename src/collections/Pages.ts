import type { CollectionConfig } from "payload";
import { blocks } from "@/blocks/config";
import { contentCollection, seoField, slugField } from "@/fields/common";

// CMS-01/04: marketing pages built from blocks. The home page is slug "home".
export const Pages: CollectionConfig = contentCollection({
  slug: "pages",
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "_status", "updatedAt"],
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    slugField(),
    { name: "layout", type: "blocks", blocks, localized: true },
    seoField,
  ],
});
