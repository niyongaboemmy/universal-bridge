import type { CollectionConfig } from "payload";
import { nobody } from "@/access/roles";

export const NOTIFICATION_KINDS = [
  "request",
  "demo",
  "message",
  "application",
  "assignment",
  "opening",
  "project",
  "account",
  "system",
] as const;

const own = ({ req }: { req: { user?: { id: unknown; collection?: string } | null } }) =>
  req.user?.collection === "users" ? { user: { equals: req.user.id } } : false;

// In-app notifications for staff (bell in the office). Written by the server only;
// each person reads, marks and clears their own.
export const Notifications: CollectionConfig = {
  slug: "notifications",
  admin: { group: "Settings", hidden: true },
  access: { read: own as never, update: own as never, delete: own as never, create: nobody },
  fields: [
    { name: "user", type: "relationship", relationTo: "users", required: true, index: true },
    {
      name: "kind",
      type: "select",
      required: true,
      index: true,
      options: NOTIFICATION_KINDS.map((v) => ({ label: v, value: v })),
    },
    { name: "title", type: "text", required: true },
    { name: "body", type: "text" },
    { name: "href", type: "text" },
    { name: "readAt", type: "date", index: true },
  ],
};
