import type { GlobalConfig, Field } from "payload";
import { anyone, roleAccess } from "@/access/roles";
import { ICON_NAMES } from "@/lib/icons";
import { revalidateGlobal } from "@/lib/cms/revalidate";

const link: Field[] = [
  { name: "label", type: "text", required: true, localized: true },
  {
    name: "href",
    type: "text",
    required: true,
    admin: { description: "Path without locale, e.g. /services/cloud-devops" },
  },
];

// CMS-03 navigation + FR-GL-02 mega-menu content (icon, title, one-liner).
export const Navigation: GlobalConfig = {
  slug: "navigation",
  admin: { group: "Settings" },
  access: { read: anyone, update: roleAccess("editor") },
  hooks: { afterChange: [revalidateGlobal("navigation")] },
  fields: [
    {
      name: "items",
      type: "array",
      maxRows: 8,
      fields: [
        ...link,
        {
          name: "children",
          type: "array",
          admin: { description: "Adding children turns this item into a mega-menu." },
          fields: [
            ...link,
            { name: "description", type: "text", localized: true },
            {
              name: "icon",
              type: "select",
              options: ICON_NAMES.map((v) => ({ label: v, value: v })),
            },
          ],
        },
        {
          name: "feature",
          type: "group",
          admin: { description: "Optional highlight panel on the right of the mega-menu." },
          fields: [
            { name: "eyebrow", type: "text", localized: true },
            { name: "title", type: "text", localized: true },
            { name: "body", type: "textarea", localized: true },
            { name: "href", type: "text" },
            { name: "cta", type: "text", localized: true },
          ],
        },
      ],
    },
    {
      name: "footerColumns",
      type: "array",
      maxRows: 4,
      fields: [
        { name: "title", type: "text", required: true, localized: true },
        { name: "links", type: "array", fields: link },
      ],
    },
  ],
};
