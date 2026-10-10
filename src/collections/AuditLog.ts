import type { CollectionConfig } from "payload";
import { nobody, roleAccess } from "@/access/roles";

// ADM-08: append-only record of admin actions and personal-data exports.
export const AuditLog: CollectionConfig = {
  slug: "audit-log",
  labels: { singular: "Audit entry", plural: "Audit log" },
  admin: {
    group: "Settings",
    useAsTitle: "action",
    defaultColumns: ["at", "actor", "action", "entity", "entityId"],
  },
  access: { read: roleAccess("super"), create: nobody, update: nobody, delete: nobody },
  fields: [
    { name: "at", type: "date", required: true, index: true },
    { name: "actor", type: "relationship", relationTo: "users" },
    { name: "action", type: "text", required: true, index: true },
    { name: "entity", type: "text", required: true, index: true },
    { name: "entityId", type: "text", index: true },
    { name: "meta", type: "json" },
  ],
};
