import type { Access, CollectionConfig, Where } from "payload";
import { nobody, roleAccess, type Role } from "@/access/roles";
import { APPLICATION_TYPES, applicationTypesFor } from "./Applications";

/**
 * ADR-004 / NFR-SEC-06: CVs and portfolios. Never public. Staff download only
 * files from the application types their role handles, and only once the virus
 * scan has passed; pending or infected files are visible to super admins only.
 * With S3 configured they live in a private bucket behind 5-minute signed URLs.
 */
const scopedRead: Access = ({ req }) => {
  const types = applicationTypesFor(req.user as { roles?: Role[] } | null);
  if (types === "all") return true;
  if (!types.length) return false;
  const where: Where = {
    and: [{ applicationType: { in: types } }, { scanStatus: { in: ["clean", "skipped"] } }],
  };
  return where;
};

export const PrivateFiles: CollectionConfig = {
  slug: "private-files",
  labels: { singular: "Private file", plural: "Private files" },
  admin: {
    group: "Inbox",
    useAsTitle: "filename",
    defaultColumns: ["filename", "applicationType", "scanStatus", "createdAt"],
  },
  access: {
    read: scopedRead,
    create: nobody,
    update: roleAccess("super"),
    delete: roleAccess("super"),
  },
  upload: {
    staticDir: ".data/private",
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  fields: [
    {
      name: "scanStatus",
      type: "select",
      defaultValue: "pending",
      index: true,
      options: ["pending", "clean", "infected", "skipped"].map((v) => ({ label: v, value: v })),
      admin: {
        readOnly: true,
        description: "“skipped” means no virus scanner is configured (development only).",
      },
    },
    {
      name: "applicationType",
      type: "select",
      index: true,
      options: APPLICATION_TYPES.map((v) => ({ label: v, value: v })),
      admin: {
        readOnly: true,
        description: "Which inbox this file belongs to (decides who can download it).",
      },
    },
  ],
};
