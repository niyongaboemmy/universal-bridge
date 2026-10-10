import type { CollectionConfig } from "payload";
import { allow, nobody } from "@/access/roles";

// ADM-08: append-only record of admin actions and personal-data exports.
export const AuditLog: CollectionConfig = {
  slug: "audit-log",
  labels: { singular: "Audit entry", plural: "Audit log" },
  admin: {
    group: "Settings",
    useAsTitle: "action",
    defaultColumns: ["at", "actor", "action", "entity", "entityId"],
  },
  access: { read: allow("audit.view"), create: nobody, update: nobody, delete: nobody },
  fields: [
    { name: "at", type: "date", required: true, index: true },
    { name: "actor", type: "relationship", relationTo: "users", index: true },
    { name: "member", type: "relationship", relationTo: "members" },
    {
      name: "actorType",
      type: "select",
      index: true,
      options: ["staff", "member", "public", "system"].map((v) => ({ label: v, value: v })),
    },
    // Kept when the account is later deleted.
    { name: "actorName", type: "text" },
    { name: "action", type: "text", required: true, index: true },
    { name: "entity", type: "text", required: true, index: true },
    { name: "entityId", type: "text", index: true },
    { name: "label", type: "text" },
    { name: "meta", type: "json" },
    { name: "ip", type: "text" },
    { name: "device", type: "text" },
  ],
};
