import "server-only";
import type { Field, Payload, PayloadRequest } from "payload";
import type { EditKind } from "./attrs";

/**
 * Applies on-page edits to Payload documents (CMS-07 live editing).
 *
 * Accuracy and safety:
 * - Every path is resolved against the collection's field config, row by row
 *   (array and block rows by id), so only real text, textarea and image fields
 *   can be written; anything else is rejected.
 * - Writes go through Payload as the signed-in user (access control, hooks,
 *   validation, versions). Edits are saved as a draft; Publish is separate.
 * - A version check (updatedAt) refuses to overwrite someone else's newer save.
 * - Editing a language that has no content of its own yet starts it from the
 *   English content (fresh row ids), instead of failing.
 */
export const LIVE_EDIT_COLLECTIONS = [
  "pages",
  "services",
  "industries",
  "products",
  "programs",
  "jobs",
  "case-studies",
  "hubs",
  "events",
  "posts",
] as const;

export type Change = {
  c: string;
  id: string | number;
  l: string;
  p: string;
  k: EditKind;
  v: string | number | null;
};

export class LiveEditError extends Error {
  constructor(
    message: string,
    public status = 400,
    public code = "invalid",
  ) {
    super(message);
  }
}

type Row = Record<string, unknown> & { id?: string; blockType?: string };

/** Technical fields stay in the admin: URLs, identifiers and SEO settings. */
const NOT_ON_PAGE = new Set([
  "slug",
  "anchor",
  "href",
  "url",
  "email",
  "phone",
  "ref",
  "code",
  "icon",
  "seo",
]);
type Leaf = Extract<Field, { type: "text" | "textarea" | "upload" }>;

/** A named field among `fields`, looking through rows, collapsibles and unnamed tabs. */
function findField(fields: Field[], name: string): Field | undefined {
  for (const f of fields) {
    if ("name" in f && f.name === name) return f;
    if (f.type === "row" || f.type === "collapsible") {
      const hit = findField(f.fields, name);
      if (hit) return hit;
    }
    if (f.type === "tabs") {
      for (const tab of f.tabs) {
        if ("name" in tab && tab.name === name) return { ...tab, type: "group" } as Field;
        if (!("name" in tab) || !tab.name) {
          const hit = findField(tab.fields, name);
          if (hit) return hit;
        }
      }
    }
  }
  return undefined;
}

/** Walk `segments` through config and data; return the leaf field and the object holding it. */
export function resolvePath(
  fields: Field[],
  data: Row,
  segments: string[],
): { field: Leaf; holder: Row; key: string } {
  let currentFields = fields;
  let current: Row = data;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const field = findField(currentFields, seg);
    if (!field) throw new LiveEditError(`Unknown field "${seg}"`);
    const admin = (field as { admin?: { readOnly?: boolean; hidden?: boolean } }).admin;
    if (NOT_ON_PAGE.has(seg) || admin?.readOnly || admin?.hidden)
      throw new LiveEditError(`"${seg}" is edited in the admin, not on the page`);
    const last = i === segments.length - 1;
    if (last) {
      if (field.type === "text" || field.type === "textarea")
        return { field, holder: current, key: seg };
      if (field.type === "upload" && field.relationTo === "media" && !field.hasMany)
        return { field, holder: current, key: seg };
      throw new LiveEditError(`"${seg}" can't be edited on the page`);
    }
    if (field.type === "group") {
      current[seg] ??= {};
      current = current[seg] as Row;
      currentFields = field.fields;
    } else if (field.type === "array" || field.type === "blocks") {
      const rowId = segments[++i];
      const rows = (current[seg] ?? []) as Row[];
      const row = rows.find((r) => String(r.id) === rowId);
      if (!row)
        throw new LiveEditError(
          "This section changed since the page loaded. Reload and try again.",
          409,
          "conflict",
        );
      if (field.type === "blocks") {
        const block = field.blocks.find((b) => b.slug === row.blockType);
        if (!block) throw new LiveEditError(`Unknown block "${row.blockType}"`);
        currentFields = block.fields;
      } else currentFields = field.fields;
      current = row;
    } else {
      throw new LiveEditError(`"${seg}" can't be edited on the page`);
    }
  }
  throw new LiveEditError("Empty path");
}

/** Check and normalise one value for its field. */
async function cleanValue(payload: Payload, field: Leaf, value: Change["v"]) {
  if (field.type === "upload") {
    if (value === null) {
      if (field.required) throw new LiveEditError("This image is required");
      return null;
    }
    const id = Number(value);
    if (!Number.isInteger(id)) throw new LiveEditError("Pick an image from the library");
    await payload.findByID({ collection: "media", id, depth: 0 }).catch(() => {
      throw new LiveEditError("That image no longer exists");
    });
    return id;
  }
  if (typeof value !== "string") throw new LiveEditError("Text expected");
  let text = value.replace(/ /g, " ").replace(/\r\n?/g, "\n");
  text =
    field.type === "text"
      ? text.replace(/\s*\n\s*/g, " ").trim()
      : text.replace(/[ \t]+\n/g, "\n").trim();
  const max = ("maxLength" in field && field.maxLength) || (field.type === "text" ? 400 : 5000);
  if (text.length > max) throw new LiveEditError(`Keep this under ${max} characters`);
  if (!text && field.required) throw new LiveEditError("This text can't be empty");
  return text || null;
}

function stripIds<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripIds) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (k !== "id") out[k] = stripIds(v);
    return out as T;
  }
  return value;
}

const isEmpty = (v: unknown) =>
  v === null || v === undefined || (Array.isArray(v) && v.length === 0);

/**
 * Save one document's changes as a draft. `base` is the version the editor
 * loaded; a newer save by someone else is a conflict unless `force`.
 */
export async function saveDraft(
  req: PayloadRequest,
  changes: Change[],
  { base, force = false }: { base?: string; force?: boolean },
) {
  const { payload } = req;
  const { c, id, l } = changes[0]!;
  if (!(LIVE_EDIT_COLLECTIONS as readonly string[]).includes(c))
    throw new LiveEditError("This content can't be edited on the page");
  const collection = payload.collections[c as (typeof LIVE_EDIT_COLLECTIONS)[number]];
  if (!collection) throw new LiveEditError("Unknown collection");
  const locales = (payload.config.localization && payload.config.localization.localeCodes) || [
    "en",
  ];
  if (!locales.includes(l)) throw new LiveEditError("Unknown language");
  const slug = c as (typeof LIVE_EDIT_COLLECTIONS)[number];

  const current = (await payload.findByID({
    collection: slug,
    id,
    locale: l as never,
    fallbackLocale: false as never,
    draft: true,
    depth: 0,
    user: req.user,
    overrideAccess: false,
  })) as unknown as Row & { updatedAt: string };
  if (!force && base && new Date(current.updatedAt).getTime() > new Date(base).getTime()) {
    throw new LiveEditError("Someone saved this page after you opened it.", 409, "stale");
  }

  // Top-level fields being edited; a language without its own content starts from English.
  let fallback: Row | null = null;
  let restarted = false;
  const tops: Record<string, unknown> = {};
  const work: Row = {};
  for (const change of changes) {
    const top = change.p.split(".")[0]!;
    if (top in work) continue;
    let value = current[top];
    if (isEmpty(value) && l !== "en") {
      fallback ??= (await payload.findByID({
        collection: slug,
        id,
        locale: "en",
        draft: true,
        depth: 0,
        user: req.user,
        overrideAccess: false,
      })) as unknown as Row;
      value = fallback[top];
      if (!isEmpty(value) && typeof value === "object") restarted = true;
    }
    work[top] = structuredClone(value);
  }
  for (const change of changes) {
    const { field, holder, key } = resolvePath(collection.config.fields, work, change.p.split("."));
    holder[key] = await cleanValue(payload, field, change.v);
  }
  for (const top of Object.keys(work)) tops[top] = restarted ? stripIds(work[top]) : work[top];

  const saved = (await payload.update({
    collection: slug,
    id,
    locale: l as never,
    data: tops as never,
    draft: true,
    depth: 0,
    user: req.user,
    overrideAccess: false,
    context: { liveEdit: true },
  })) as unknown as { updatedAt: string; _status?: string };
  return { updatedAt: saved.updatedAt, status: saved._status ?? "draft", reload: restarted };
}

const SYSTEM_KEYS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "_status",
  "sizes",
  "url",
  "thumbnailURL",
]);

/**
 * Publish this language's latest draft: everything saved as draft (from the
 * page or the admin) goes live, and the publish hooks refresh the public pages.
 */
export async function publishDoc(
  req: PayloadRequest,
  ref: { c: string; id: string | number; l: string },
) {
  const { payload } = req;
  if (!(LIVE_EDIT_COLLECTIONS as readonly string[]).includes(ref.c))
    throw new LiveEditError("This content can't be edited on the page");
  const slug = ref.c as (typeof LIVE_EDIT_COLLECTIONS)[number];
  const draft = (await payload.findByID({
    collection: slug,
    id: ref.id,
    locale: ref.l as never,
    fallbackLocale: false as never,
    draft: true,
    depth: 0,
    user: req.user,
    overrideAccess: false,
  })) as unknown as Row;
  const data: Record<string, unknown> = { _status: "published" };
  for (const [k, v] of Object.entries(draft))
    if (!SYSTEM_KEYS.has(k) && v !== null && v !== undefined) data[k] = v;
  const published = (await payload.update({
    collection: slug,
    id: ref.id,
    locale: ref.l as never,
    data: data as never,
    draft: false,
    depth: 0,
    user: req.user,
    overrideAccess: false,
    context: { liveEdit: true },
  })) as unknown as { updatedAt: string };
  return { updatedAt: published.updatedAt, status: "published" };
}
