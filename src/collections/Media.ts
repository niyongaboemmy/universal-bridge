import type { CollectionConfig } from "payload";
import { allow, anyone } from "@/access/roles";

// CMS-09: alt text required, focal point, responsive sizes, WebP/AVIF.
export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "Content", useAsTitle: "alt" },
  access: {
    read: anyone,
    create: allow("content.media"),
    update: allow("content.media"),
    delete: allow("content.media"),
  },
  upload: {
    staticDir: ".data/media",
    mimeTypes: ["image/*", "application/pdf", "application/zip"],
    focalPoint: true,
    crop: true,
    formatOptions: { format: "webp", options: { quality: 82 } },
    imageSizes: [
      { name: "thumb", width: 480, formatOptions: { format: "webp", options: { quality: 78 } } },
      { name: "card", width: 960, formatOptions: { format: "webp", options: { quality: 80 } } },
      { name: "hero", width: 1920, formatOptions: { format: "webp", options: { quality: 80 } } },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      localized: true,
      admin: {
        description: "Describe the image for people who can't see it. Required (NFR-A11Y-06).",
      },
    },
    {
      name: "decorative",
      type: "checkbox",
      admin: { description: "Purely decorative images render with empty alt text." },
    },
    {
      name: "isConcept",
      type: "checkbox",
      label: "Concept render (AI or 3D) — labelled as “Concept” on the site",
      admin: {
        description: "SRS OI-06: renders must never be shown as real facilities or products.",
      },
    },
    { name: "credit", type: "text" },
  ],
};
