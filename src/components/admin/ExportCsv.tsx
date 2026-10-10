"use client";

import { usePathname, useSearchParams } from "next/navigation";

/**
 * ADM-06: "Export CSV" above an inbox list. Carries the list's status/type filter
 * (Payload's `where[...][equals]` query) into the export; access and audit are
 * enforced by /api/staff/export.
 */
export function ExportCsv() {
  const params = useSearchParams();
  const collectionSlug = usePathname().match(/\/collections\/([\w-]+)/)?.[1];
  if (!collectionSlug) return null;
  const q = new URLSearchParams();
  for (const field of ["status", "type"]) {
    const v =
      params.get(`where[${field}][equals]`) ?? params.get(`where[or][0][and][0][${field}][equals]`);
    if (v) q.set(field, v);
  }
  const href = `/api/staff/export/${collectionSlug}${q.size ? `?${q}` : ""}`;
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
      <a
        href={href}
        className="btn btn--style-secondary btn--size-small"
        style={{ margin: 0 }}
        download
      >
        Export CSV{q.size ? " (filtered)" : ""}
      </a>
    </div>
  );
}
