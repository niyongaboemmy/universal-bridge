/**
 * Live (on-page) editing, CMS-07. A reference to "where this value lives in the
 * CMS": collection, document id, locale and a path inside the document. Rows in
 * arrays and blocks are addressed by their row id, never by index, so a path
 * stays correct when rows move. Only present while a staff member is editing;
 * for visitors every helper returns nothing, so the static HTML is unchanged.
 */
export type EditRef = {
  collection: string;
  id: string | number;
  locale: string;
  /** Path inside the document, dot-separated; row ids for array/block rows. */
  path: string;
  /** Version the editor started from (updatedAt), for conflict detection. */
  version?: string;
  /** "draft" when the latest version isn't published yet. */
  status?: string;
};

export type EditKind = "text" | "textarea" | "accent" | "image";

/** A reference one level deeper: child(ref, "cards", card.id). */
export function child(
  ref: EditRef | undefined,
  ...segments: (string | number | null | undefined)[]
): EditRef | undefined {
  if (!ref || segments.some((s) => s === null || s === undefined || s === "")) return undefined;
  return { ...ref, path: [ref.path, ...segments].filter(Boolean).join(".") };
}

/**
 * Attributes that mark one editable value. `raw` is the stored text (with
 * *accent* markers), which the editor shows while editing.
 */
export function editable(
  ref: EditRef | undefined,
  field: string,
  kind: EditKind,
  raw?: string | number | null,
): Record<string, string> {
  const target = child(ref, field);
  if (!target) return {};
  return {
    "data-edit": JSON.stringify({
      c: target.collection,
      id: target.id,
      l: target.locale,
      p: target.path,
      k: kind,
      v: target.version,
      s: target.status,
    }),
    ...(raw !== undefined && raw !== null ? { "data-edit-raw": String(raw) } : {}),
  };
}

/** Same-site page paths only (no protocol-relative, external, admin or API targets). */
export const safePath = (p: string | null | undefined) =>
  p && /^\/(?!\/)[^\s\\]*$/.test(p) && !p.startsWith("/api") && !p.startsWith("/admin") ? p : "/";
