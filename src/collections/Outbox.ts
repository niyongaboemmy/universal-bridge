import type { CollectionConfig } from "payload";
import { nobody, roleAccess } from "@/access/roles";

// ADR-002: transactional outbox for emails, CRM sync and team alerts.
export const Outbox: CollectionConfig = {
  slug: "outbox",
  labels: { singular: "Outbox job", plural: "Outbox" },
  admin: {
    group: "Settings",
    useAsTitle: "kind",
    defaultColumns: ["kind", "status", "attempts", "runAfter", "updatedAt"],
    description: "Background jobs. “dead” jobs failed 5 times and need attention.",
  },
  access: {
    read: roleAccess("super"),
    update: roleAccess("super"),
    delete: roleAccess("super"),
    create: nobody,
  },
  fields: [
    {
      name: "kind",
      type: "select",
      required: true,
      index: true,
      options: ["send-email", "crm-sync", "notify-team", "scan-upload", "staff-invite"].map(
        (v) => ({
          label: v,
          value: v,
        }),
      ),
    },
    { name: "payload", type: "json", required: true },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      index: true,
      options: ["pending", "running", "done", "dead"].map((v) => ({ label: v, value: v })),
    },
    { name: "attempts", type: "number", defaultValue: 0 },
    { name: "runAfter", type: "date", index: true, defaultValue: () => new Date().toISOString() },
    { name: "lastError", type: "textarea" },
  ],
};
