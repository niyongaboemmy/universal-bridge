/** Minimal RFC 4180 CSV parser (quotes, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

/** "2026-02-30" and "2026-13-01" are rejected, not silently rolled over. */
export function isRealDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export const CERT_COLUMNS = [
  "holderName",
  "kind",
  "programTitle",
  "role",
  "startDate",
  "endDate",
  "signatoryName",
  "signatoryTitle",
  "issuedAt",
] as const;
const REQUIRED = [
  "holderName",
  "kind",
  "programTitle",
  "startDate",
  "endDate",
  "signatoryName",
  "signatoryTitle",
];

export type CertRow = Record<(typeof CERT_COLUMNS)[number], string>;

/** Validate rows; returns per-row errors (1-based line numbers incl. header). */
export function validateCertRows(rows: string[][]): {
  valid: CertRow[];
  errors: { line: number; message: string }[];
} {
  const [header, ...data] = rows;
  const errors: { line: number; message: string }[] = [];
  if (!header) return { valid: [], errors: [{ line: 1, message: "Empty file" }] };
  const cols = header.map((h) => h.trim());
  const missing = REQUIRED.filter((c) => !cols.includes(c));
  if (missing.length)
    return { valid: [], errors: [{ line: 1, message: `Missing columns: ${missing.join(", ")}` }] };
  const valid: CertRow[] = [];
  data.forEach((r, i) => {
    const line = i + 2;
    const row = Object.fromEntries(
      CERT_COLUMNS.map((c) => [c, (r[cols.indexOf(c)] ?? "").trim()]),
    ) as CertRow;
    const problems: string[] = [];
    for (const c of REQUIRED) if (!row[c as keyof CertRow]) problems.push(`${c} is empty`);
    if (row.kind && !["internship", "training"].includes(row.kind))
      problems.push("kind must be internship or training");
    for (const c of ["startDate", "endDate", "issuedAt"] as const) {
      if (row[c] && !isRealDate(row[c])) problems.push(`${c} must be a real date as YYYY-MM-DD`);
    }
    if (isRealDate(row.startDate) && isRealDate(row.endDate) && row.startDate > row.endDate)
      problems.push("endDate is before startDate");
    if (problems.length) errors.push({ line, message: problems.join("; ") });
    else valid.push(row);
  });
  return { valid, errors };
}
