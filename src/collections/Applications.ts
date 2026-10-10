import type { CollectionConfig } from "payload";
import { nobody, roleAccess, type Role } from "@/access/roles";
import { auditHooks } from "@/lib/audit";

export const APPLICATION_TYPES = ["academy", "internship", "job", "partner", "event"] as const;
export const APPLICATION_STATUSES = [
  "received",
  "review",
  "shortlisted",
  "accepted",
  "rejected",
  "waitlisted",
] as const;

/** Which staff role sees which application type (SRS §3.2, least privilege). */
export const ROLE_FOR: Record<(typeof APPLICATION_TYPES)[number], Role[]> = {
  academy: ["academy"],
  internship: ["academy", "hr"],
  job: ["hr"],
  partner: ["sales"],
  event: ["editor", "academy"],
};

/** Application types a user may see (super: all). */
export function applicationTypesFor(user: { roles?: Role[] } | null | undefined): string[] | "all" {
  if (!user?.roles) return [];
  if (user.roles.includes("super")) return "all";
  return Object.entries(ROLE_FOR)
    .filter(([, roles]) => roles.some((r) => user.roles!.includes(r)))
    .map(([type]) => type);
}

const scopedRead = ({ req }: { req: { user?: unknown } }) => {
  const types = applicationTypesFor(req.user as { roles?: Role[] } | null);
  if (types === "all") return true;
  return types.length ? { type: { in: types } } : false;
};

// SRS §11 Application + ADM-02/03/04. One inbox, filtered per role.
export const Applications: CollectionConfig = {
  slug: "applications",
  admin: {
    components: { beforeListTable: ["@/components/admin/ExportCsv#ExportCsv"] },
    group: "Inbox",
    useAsTitle: "name",
    defaultColumns: ["ref", "type", "name", "subject", "status", "createdAt"],
    listSearchableFields: ["name", "email", "ref", "subject"],
    description: "Academy, internship, job and partner applications (ADM-02). Personal data.",
  },
  access: {
    read: scopedRead,
    update: scopedRead,
    delete: roleAccess("super"),
    create: nobody,
  },
  hooks: {
    ...auditHooks("applications"),
    afterChange: [
      ...auditHooks("applications").afterChange,
      // ADM-05: tell the applicant when staff move their application on.
      async ({ doc, previousDoc, operation, req }) => {
        const notify = ["shortlisted", "accepted", "rejected", "waitlisted"];
        if (
          operation !== "update" ||
          !req.user ||
          doc.notifyApplicant === false ||
          doc.status === previousDoc?.status ||
          !notify.includes(doc.status)
        )
          return doc;
        const locale = ["en", "fr", "rw"].includes(doc.tracking?.locale)
          ? doc.tracking.locale
          : "en";
        await req.payload.create({
          collection: "outbox",
          overrideAccess: true,
          req,
          data: {
            kind: "send-email",
            payload: {
              template: "application-status",
              to: doc.email,
              data: {
                ref: doc.ref,
                name: doc.name,
                subject: doc.subject ?? doc.type,
                locale,
                status: doc.status,
              },
            },
            status: "pending",
            attempts: 0,
            runAfter: new Date().toISOString(),
          },
        });
        try {
          const { after } = await import("next/server");
          after(async () => {
            const { processOutbox } = await import("@/lib/outbox");
            await processOutbox(req.payload, { limit: 5 });
          });
        } catch {
          // Outside a request: the cron sends it.
        }
        return doc;
      },
      // Keep the intake's accepted count in sync (FR-ACA-06).
      async ({ doc, previousDoc, req }) => {
        if (doc.type !== "academy" || !doc.intake || doc.status === previousDoc?.status) return doc;
        if (doc.status !== "accepted" && previousDoc?.status !== "accepted") return doc;
        const intakeId = typeof doc.intake === "object" ? doc.intake.id : doc.intake;
        const accepted = await req.payload.count({
          collection: "applications",
          where: { intake: { equals: intakeId }, status: { equals: "accepted" } },
          overrideAccess: true,
          req,
        });
        await req.payload.update({
          collection: "intakes",
          id: intakeId,
          data: { accepted: accepted.totalDocs },
          overrideAccess: true,
          req,
        });
        return doc;
      },
    ],
  },
  fields: [
    {
      type: "row",
      fields: [
        {
          name: "ref",
          type: "text",
          required: true,
          unique: true,
          index: true,
          admin: { readOnly: true, width: "25%" },
        },
        {
          name: "type",
          type: "select",
          required: true,
          index: true,
          options: APPLICATION_TYPES.map((v) => ({ label: v, value: v })),
          admin: { width: "25%" },
        },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "received",
          index: true,
          enumName: "enum_applications_state",
          options: APPLICATION_STATUSES.map((v) => ({ label: v, value: v })),
          admin: { width: "25%" },
        },
        { name: "assignee", type: "relationship", relationTo: "users", admin: { width: "25%" } },
      ],
    },
    {
      name: "subject",
      type: "text",
      admin: { description: "Program, track, job or tier applied for" },
    },
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true },
        { name: "email", type: "email", required: true, index: true },
        { name: "phone", type: "text" },
      ],
    },
    { name: "program", type: "relationship", relationTo: "programs" },
    { name: "intake", type: "relationship", relationTo: "intakes" },
    { name: "job", type: "relationship", relationTo: "jobs" },
    { name: "event", type: "relationship", relationTo: "events" },
    {
      name: "data",
      type: "json",
      required: true,
      admin: { description: "All answers, validated by the form schema" },
    },
    { name: "files", type: "relationship", relationTo: "private-files", hasMany: true },
    {
      name: "notes",
      type: "array",
      fields: [
        { name: "body", type: "textarea", required: true },
        { name: "author", type: "relationship", relationTo: "users" },
        { name: "at", type: "date", defaultValue: () => new Date().toISOString() },
      ],
    },
    {
      name: "consent",
      type: "group",
      fields: [
        { name: "text", type: "textarea" },
        { name: "version", type: "text" },
        { name: "at", type: "date" },
        {
          name: "guardian",
          type: "text",
          admin: { description: "Parent/guardian name when the applicant is under 18 (PRV-08)" },
        },
      ],
    },
    {
      name: "tracking",
      type: "group",
      fields: [
        { name: "utm", type: "json" },
        { name: "referrer", type: "text" },
        { name: "locale", type: "text" },
      ],
    },
    {
      name: "botCheck",
      type: "select",
      defaultValue: "passed",
      enumName: "enum_applications_bot",
      options: ["passed", "missing"].map((v) => ({ label: v, value: v })),
      admin: { position: "sidebar" },
    },
    { name: "firstResponseAt", type: "date", admin: { position: "sidebar", readOnly: true } },
    {
      name: "notifyApplicant",
      label: "Email the applicant about status changes",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description:
          "Shortlisted, accepted, rejected and waitlisted send a short email in their language.",
      },
    },
  ],
};
