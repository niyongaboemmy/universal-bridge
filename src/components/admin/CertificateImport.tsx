"use client";

import { useState } from "react";

type Result = {
  ok: boolean;
  rows?: number;
  created?: number;
  errors?: { line: number; message: string }[];
  error?: string;
  dryRun?: boolean;
};

const TEMPLATE =
  "holderName,kind,programTitle,role,startDate,endDate,signatoryName,signatoryTitle,issuedAt\n" +
  "Jane Mukamana,internship,Software Engineering Internship,Backend Intern,2026-05-01,2026-07-31,Emmanuel Niyongabo,Managing Director,2026-08-05\n";

/** Admin: bulk-import certificates from CSV with a dry run first (FR-CERT-04). */
export function CertificateImport() {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(dryRun: boolean) {
    setBusy(true);
    try {
      const res = await fetch(`/api/certificate-tools/import${dryRun ? "?dryRun=1" : ""}`, {
        method: "POST",
        headers: { "content-type": "text/csv" },
        body: csv,
        credentials: "include",
      });
      setResult(await res.json());
    } finally {
      setBusy(false);
    }
  }

  return (
    <details
      style={{
        margin: "0 0 24px",
        padding: 16,
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: 8,
      }}
    >
      <summary style={{ cursor: "pointer", fontWeight: 600 }}>Bulk import from CSV</summary>
      <p style={{ margin: "12px 0" }}>
        Paste CSV with these columns (dates as YYYY-MM-DD). Check it first; nothing is created until
        you import, and either every row is created or none.{" "}
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE)}`}
          download="certificates-template.csv"
        >
          Download a template
        </a>
      </p>
      <textarea
        aria-label="CSV"
        value={csv}
        onChange={(e) => {
          setCsv(e.target.value);
          setResult(null);
        }}
        rows={6}
        style={{ width: "100%", fontFamily: "monospace", padding: 8 }}
        placeholder={TEMPLATE.split("\n")[0]}
      />
      <input
        type="file"
        accept=".csv,text/csv"
        aria-label="CSV file"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) setCsv(await f.text());
        }}
        style={{ margin: "8px 0" }}
      />
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          className="btn btn--style-secondary btn--size-small"
          disabled={!csv || busy}
          onClick={() => send(true)}
        >
          Check
        </button>
        <button
          type="button"
          className="btn btn--style-primary btn--size-small"
          disabled={!csv || busy || !result?.ok || !result.dryRun}
          onClick={() => send(false)}
        >
          Import {result?.ok && result.dryRun ? `${result.rows} certificates` : ""}
        </button>
      </div>
      {result && (
        <div role="status" style={{ marginTop: 12 }}>
          {result.created !== undefined && (
            <p>✓ Created {result.created} certificates. Reload the list to see them.</p>
          )}
          {result.dryRun && result.ok && <p>✓ {result.rows} rows are valid.</p>}
          {result.errors?.map((e) => (
            <p key={e.line} style={{ color: "var(--theme-error-500)" }}>
              Line {e.line}: {e.message}
            </p>
          ))}
          {result.error && <p style={{ color: "var(--theme-error-500)" }}>{result.error}</p>}
        </div>
      )}
    </details>
  );
}
