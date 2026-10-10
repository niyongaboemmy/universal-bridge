import "server-only";
import { createHash } from "node:crypto";
import { sql } from "@payloadcms/db-postgres";
import type { Payload, PayloadRequest } from "payload";
import { settings, type Settings } from "@/lib/settings";
import { audit } from "@/lib/audit";

/**
 * SRS §11 retention and ADM-09 / PRV-05 data-subject requests.
 *
 * Retention (monthly, /api/cron/retention):
 * - leads: 24 months after the last contact (last update);
 * - unsuccessful applications (rejected, waitlisted) and their CVs: 12 months;
 * - CVs no application points to (abandoned uploads): 30 days;
 * - newsletter sign-ups never confirmed, or unsubscribed: 30 days;
 * - finished outbox jobs (they hold names and emails): 30 days; dead jobs: 90 days;
 * - anonymous page views (Company dashboard analytics): 13 months.
 * Certificates are kept permanently, as the privacy policy states.
 */
const MONTH = 30 * 24 * 60 * 60 * 1000;
const DAY = 24 * 60 * 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

/** Emails are hashed in the audit log: the log proves a request was handled without keeping the data. */
export const emailRef = (email: string) =>
  createHash("sha256").update(`ub-dsr:${email.trim().toLowerCase()}`).digest("hex").slice(0, 16);

type Ids = (number | string)[];

async function ids(
  payload: Payload,
  collection: "leads" | "applications" | "subscribers" | "private-files",
  where: object,
): Promise<Ids> {
  const res = await payload.find({
    collection,
    where: where as never,
    limit: 0,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  });
  return (res.docs as { id: number | string }[]).map((d) => d.id);
}

async function referencedFileIds(payload: Payload): Promise<Set<string>> {
  const rows = await payload.db.drizzle.execute(
    sql`select distinct private_files_id as id from applications_rels where private_files_id is not null`,
  );
  return new Set((rows.rows as { id: number }[]).map((r) => String(r.id)));
}

async function deleteAll(
  payload: Payload,
  collection: "leads" | "applications" | "subscribers" | "private-files",
  list: Ids,
  req?: PayloadRequest,
) {
  for (const id of list) await payload.delete({ collection, id, overrideAccess: true, req });
}

/** Files attached to the given applications. */
async function filesOf(payload: Payload, applicationIds: Ids): Promise<Ids> {
  if (!applicationIds.length) return [];
  const apps = await payload.find({
    collection: "applications",
    where: { id: { in: applicationIds } },
    limit: 0,
    pagination: false,
    depth: 0,
    overrideAccess: true,
  });
  return apps.docs.flatMap((a) =>
    ((a.files ?? []) as (number | { id: number })[]).map((f) => (typeof f === "object" ? f.id : f)),
  );
}

export async function runRetention(
  payload: Payload,
  { dryRun = false, periods }: { dryRun?: boolean; periods?: Settings["retention"] } = {},
) {
  // Periods come from office → Settings (defaults above).
  const r = periods ?? (await settings()).retention;
  const leads = await ids(payload, "leads", { updatedAt: { less_than: ago(r.leadsMonths * MONTH) } });
  const applications = await ids(payload, "applications", {
    and: [
      { status: { in: ["rejected", "waitlisted"] } },
      { updatedAt: { less_than: ago(r.applicationsMonths * MONTH) } },
    ],
  });
  const applicationFiles = await filesOf(payload, applications);
  const referenced = await referencedFileIds(payload);
  const orphanFiles = (
    await ids(payload, "private-files", {
      createdAt: { less_than: ago(r.orphanFilesDays * DAY) },
    })
  ).filter((id) => !referenced.has(String(id)));
  const subscribers = await ids(payload, "subscribers", {
    or: [
      {
        and: [
          { confirmedAt: { exists: false } },
          { createdAt: { less_than: ago(r.subscribersDays * DAY) } },
        ],
      },
      { unsubscribedAt: { less_than: ago(r.subscribersDays * DAY) } },
    ],
  });
  const outboxRows = await payload.db.drizzle.execute(
    sql`select count(*)::int as n from outbox where (status = 'done' and updated_at < now() - interval '30 days') or (status = 'dead' and updated_at < now() - interval '90 days')`,
  );
  const report = {
    dryRun,
    leads: leads.length,
    applications: applications.length,
    files: applicationFiles.length + orphanFiles.length,
    subscribers: subscribers.length,
    outbox: (outboxRows.rows[0] as { n: number }).n,
  };
  if (!dryRun) {
    await deleteAll(payload, "leads", leads);
    await deleteAll(payload, "applications", applications);
    await deleteAll(payload, "private-files", [...new Set([...applicationFiles, ...orphanFiles])]);
    await deleteAll(payload, "subscribers", subscribers);
    await payload.db.drizzle.execute(
      sql`delete from page_views where created_at < now() - make_interval(months => ${r.pageViewsMonths})`,
    );
    await payload.db.drizzle.execute(
      sql`delete from outbox where (status = 'done' and updated_at < now() - interval '30 days') or (status = 'dead' and updated_at < now() - interval '90 days')`,
    );
    await audit({ payload, user: null, context: {} } as unknown as PayloadRequest, {
      action: "retention.purge",
      entity: "privacy",
      meta: report,
    });
  }
  return report;
}

/** ADM-09: everything held about one email address. */
export async function findPerson(payload: Payload, email: string) {
  const e = email.trim().toLowerCase();
  const where = { email: { equals: e } } as const;
  const [leads, applications, subscribers] = await Promise.all([
    payload.find({
      collection: "leads",
      where,
      limit: 0,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: "applications",
      where,
      limit: 0,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    }),
    payload.find({
      collection: "subscribers",
      where,
      limit: 0,
      pagination: false,
      depth: 0,
      overrideAccess: true,
    }),
  ]);
  // Certificates carry a holder name, not an email: match the names this person used.
  const names = [
    ...new Set([...leads.docs, ...applications.docs].map((d) => d.name).filter(Boolean)),
  ];
  const certificates = names.length
    ? await payload.find({
        collection: "certificates",
        where: { or: names.map((n) => ({ holderName: { like: n } })) },
        limit: 0,
        pagination: false,
        depth: 0,
        overrideAccess: true,
      })
    : { docs: [] };
  const outbox = await payload.db.drizzle.execute(
    sql`select id, kind, status, created_at from outbox where lower(payload::text) like ${`%${e}%`}`,
  );
  const files = await filesOf(
    payload,
    applications.docs.map((a) => a.id),
  );
  return {
    email: e,
    leads: leads.docs,
    applications: applications.docs,
    subscribers: subscribers.docs.map(({ token: _t, ...rest }) => rest),
    certificates: certificates.docs,
    files,
    outbox: outbox.rows as { id: number; kind: string; status: string }[],
  };
}

/**
 * ADM-09 erase. Removes leads, applications with their CVs, newsletter records
 * and queued emails. Certificates stay (legal basis: proof of qualification) and
 * are listed in the response so staff can tell the person.
 */
export async function erasePerson(req: PayloadRequest, email: string) {
  const { payload } = req;
  const found = await findPerson(payload, email);
  await deleteAll(
    payload,
    "leads",
    found.leads.map((d) => d.id),
    req,
  );
  await deleteAll(
    payload,
    "applications",
    found.applications.map((d) => d.id),
    req,
  );
  await deleteAll(payload, "private-files", found.files, req);
  await deleteAll(
    payload,
    "subscribers",
    found.subscribers.map((d) => d.id as number),
    req,
  );
  if (found.outbox.length) {
    await payload.db.drizzle.execute(
      sql`delete from outbox where id in (${sql.join(
        found.outbox.map((o) => sql`${o.id}`),
        sql`, `,
      )})`,
    );
  }
  const summary = {
    leads: found.leads.length,
    applications: found.applications.length,
    files: found.files.length,
    subscribers: found.subscribers.length,
    outbox: found.outbox.length,
    certificatesKept: found.certificates.length,
  };
  await audit(req, {
    action: "privacy.erase",
    entity: "privacy",
    meta: { ref: emailRef(email), ...summary },
  });
  return summary;
}

/** ADM-06 CSV: one row per document, nested values flattened, formulas neutralised. */
export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const cell = (v: unknown) => {
    let s =
      v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // CSV injection guard
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const get = (row: Record<string, unknown>, path: string) =>
    path
      .split(".")
      .reduce<unknown>(
        (o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined),
        row,
      );
  return (
    [columns.join(","), ...rows.map((r) => columns.map((c) => cell(get(r, c))).join(","))].join(
      "\r\n",
    ) + "\r\n"
  );
}

export function cronAuthorized(authorization: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && authorization === `Bearer ${secret}`;
}
