import "server-only";
import { sql } from "@payloadcms/db-postgres";
import type { CollectionSlug, Where } from "payload";
import { payload } from "@/lib/cms/payload";
import type { OfficeUser } from "./session";

/** URL search params of a list page (all optional strings). */
export type Params = Record<string, string | undefined>;

export const PAGE_SIZES = [10, 25, 50, 100] as const;

/** Page, page size and sort from the URL, with safe defaults. */
export function listParams(sp: Params, sorts: Record<string, string>, defaultSort: string) {
  const per = Number(sp.per);
  const limit = (PAGE_SIZES as readonly number[]).includes(per) ? per : 25;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const sort = sorts[sp.sort ?? ""] ?? sorts[defaultSort]!;
  return { limit, page, sort };
}

/** createdAt between two YYYY-MM-DD dates (inclusive, Kigali days are close enough to UTC+2). */
export function dateRange(sp: Params, field = "createdAt"): Where[] {
  const out: Where[] = [];
  if (sp.from && /^\d{4}-\d{2}-\d{2}$/.test(sp.from))
    out.push({
      [field]: { greater_than_equal: new Date(`${sp.from}T00:00:00+02:00`).toISOString() },
    });
  if (sp.to && /^\d{4}-\d{2}-\d{2}$/.test(sp.to))
    out.push({
      [field]: {
        less_than: new Date(
          new Date(`${sp.to}T00:00:00+02:00`).getTime() + 86_400_000,
        ).toISOString(),
      },
    });
  return out;
}

/** Free-text search over several fields. */
export function textSearch(q: string | undefined, fields: string[]): Where[] {
  const t = q?.trim().slice(0, 80);
  return t ? [{ or: fields.map((f) => ({ [f]: { like: t } })) }] : [];
}

/** Lead ids whose selected services (JSON) include a service slug. */
export async function leadIdsWithService(slug: string): Promise<number[]> {
  const db = (await payload()).db.drizzle;
  const res = await db.execute(
    sql`select id from leads where services::text like ${`%"${slug.replace(/[^a-z0-9-]/g, "")}"%`}`,
  );
  return (res.rows as { id: number }[]).map((r) => r.id);
}

/** One page of records, read as the signed-in user (role access applies). */
export async function findPage<T>(
  user: OfficeUser,
  collection: CollectionSlug,
  {
    where,
    sort,
    page,
    limit,
    depth = 1,
  }: { where: Where[]; sort: string; page: number; limit: number; depth?: number },
) {
  const p = await payload();
  const res = await p.find({
    collection,
    where: where.length ? { and: where } : undefined,
    sort,
    page,
    limit,
    depth,
    user,
    overrideAccess: false,
  });
  return {
    docs: res.docs as T[],
    totalDocs: res.totalDocs,
    totalPages: Math.max(1, res.totalPages),
    page: res.page ?? page,
    limit,
  };
}

/** Build a list URL from params, dropping empty values. */
export function listHref(path: string, params: Params) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  return q.size ? `${path}?${q}` : path;
}
