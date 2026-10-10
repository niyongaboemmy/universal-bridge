import type { CollectionConfig } from "payload";
import { nobody, roleAccess } from "@/access/roles";

// SRS §11 Subscriber + §7.2 newsletter (double opt-in).
export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  admin: {
    components: { beforeListTable: ["@/components/admin/ExportCsv#ExportCsv"] },
    group: "Inbox",
    useAsTitle: "email",
    defaultColumns: ["email", "locale", "confirmedAt", "unsubscribedAt"],
  },
  access: {
    read: roleAccess("editor", "sales"),
    update: roleAccess("super"),
    delete: roleAccess("super"),
    create: nobody,
  },
  fields: [
    { name: "email", type: "email", required: true, unique: true, index: true },
    { name: "locale", type: "text" },
    { name: "token", type: "text", index: true, admin: { readOnly: true, hidden: true } },
    { name: "confirmedAt", type: "date", admin: { readOnly: true } },
    { name: "unsubscribedAt", type: "date", admin: { readOnly: true } },
    {
      name: "consent",
      type: "group",
      fields: [
        { name: "text", type: "textarea" },
        { name: "version", type: "text" },
        { name: "at", type: "date" },
      ],
    },
  ],
};
