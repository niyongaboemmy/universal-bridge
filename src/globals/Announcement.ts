import type { GlobalConfig } from "payload";
import { allow, anyone } from "@/access/roles";
import { revalidateGlobal } from "@/lib/cms/revalidate";

// FR-GL-12: CMS-controlled, dismissible announcement bar.
export const Announcement: GlobalConfig = {
  slug: "announcement",
  admin: { group: "Settings" },
  access: { read: anyone, update: allow("content.announcement") },
  hooks: { afterChange: [revalidateGlobal("announcement")] },
  fields: [
    { name: "enabled", type: "checkbox", defaultValue: false },
    {
      name: "text",
      type: "text",
      localized: true,
      admin: { condition: (d) => Boolean(d?.enabled) },
    },
    {
      name: "linkLabel",
      type: "text",
      localized: true,
      admin: { condition: (d) => Boolean(d?.enabled) },
    },
    { name: "href", type: "text", admin: { condition: (d) => Boolean(d?.enabled) } },
    {
      name: "version",
      type: "text",
      defaultValue: "1",
      admin: { description: "Change this to show a dismissed announcement again." },
    },
  ],
};
