"use client";

import { useDocumentInfo } from "@payloadcms/ui";

/** Admin: download the print-ready certificate PDF (FR-CERT-04). */
export function CertificatePdfLink() {
  const { id } = useDocumentInfo();
  if (!id) return <p style={{ opacity: 0.7 }}>Save the certificate to download its PDF.</p>;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", margin: "8px 0 24px" }}>
      <a
        className="btn btn--style-primary btn--size-medium"
        href={`/api/certificate-tools/pdf/${id}`}
      >
        Download PDF with QR code
      </a>
    </div>
  );
}
