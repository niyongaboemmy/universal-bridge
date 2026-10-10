import type { CollectionConfig } from "payload";
import { allow, nobody } from "@/access/roles";
import { auditHooks } from "@/lib/audit";
import { certificateCode, signCertificate } from "@/lib/certificates/sign";

// SRS §11 Certificate + FR-CERT-01…04, ADM-07. Kept permanently (retention policy).
export const Certificates: CollectionConfig = {
  slug: "certificates",
  admin: {
    group: "Academy",
    useAsTitle: "code",
    defaultColumns: ["code", "holderName", "programTitle", "issuedAt", "status"],
    listSearchableFields: ["code", "holderName", "programTitle"],
    components: { beforeListTable: ["@/components/admin/CertificateImport#CertificateImport"] },
  },
  // Public lookups go through the rate-limited verify page, never the REST API.
  access: {
    read: allow("content.academy"),
    create: allow("content.academy"),
    update: allow("content.academy"),
    delete: nobody,
  },
  hooks: {
    ...auditHooks("certificates"),
    beforeValidate: [
      async ({ data, originalDoc, operation }) => {
        if (!data) return data;
        if (operation === "create" && !data.code)
          data.code = certificateCode(new Date(data.issuedAt ?? Date.now()).getFullYear());
        const merged = { ...originalDoc, ...data };
        if (merged.code && merged.holderName && merged.issuedAt) {
          data.signature = await signCertificate({
            code: merged.code,
            holderName: merged.holderName,
            issuedAt: String(merged.issuedAt),
          });
        }
        if (merged.status === "revoked" && !merged.revokedReason)
          throw new Error("Give a reason when revoking a certificate.");
        return data;
      },
    ],
  },
  fields: [
    {
      name: "code",
      type: "text",
      unique: true,
      index: true,
      admin: { readOnly: true, description: "Generated: UB-YYYY- + 10 random characters" },
    },
    { name: "holderName", type: "text", required: true },
    {
      type: "row",
      fields: [
        {
          name: "kind",
          type: "select",
          required: true,
          defaultValue: "internship",
          options: ["internship", "training"].map((v) => ({ label: v, value: v })),
        },
        {
          name: "programTitle",
          type: "text",
          required: true,
          admin: { description: "e.g. “Software Engineering Internship”" },
        },
        { name: "role", type: "text", admin: { description: "e.g. “Marketing Intern”" } },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "startDate", type: "date", required: true },
        { name: "endDate", type: "date", required: true },
        {
          name: "issuedAt",
          type: "date",
          required: true,
          defaultValue: () => new Date().toISOString(),
        },
      ],
    },
    {
      type: "row",
      fields: [
        { name: "signatoryName", type: "text", required: true },
        { name: "signatoryTitle", type: "text", required: true },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "valid",
          enumName: "enum_certificates_state",
          options: ["valid", "revoked"].map((v) => ({ label: v, value: v })),
        },
        {
          name: "revokedReason",
          type: "text",
          admin: { condition: (d) => d?.status === "revoked" },
        },
      ],
    },
    {
      name: "signature",
      type: "text",
      admin: { readOnly: true, description: "Ed25519 signature carried in the QR code (IX-05)" },
    },
    {
      name: "pdf",
      type: "ui",
      admin: { components: { Field: "@/components/admin/CertificatePdfLink#CertificatePdfLink" } },
    },
  ],
};
