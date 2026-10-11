import "server-only";
import { sql } from "@payloadcms/db-postgres";
import type { Where } from "payload";
import { payload } from "@/lib/cms/payload";
import type { Application, Employee, Lead, Project } from "@/payload-types";
import type { OfficeUser } from "./session";

/**
 * Read layer for the Company dashboard. Record lists go through Payload as the
 * signed-in user (each role sees only what its access rules allow); counts and
 * analytics are SQL aggregates.
 */
const db = async () => (await payload()).db.drizzle;
const rows = async <T>(q: ReturnType<typeof sql>) => (await (await db()).execute(q)).rows as T[];

import { leadWhere, type LeadKind } from "@/collections/Leads";

export { leadWhere, type LeadKind };
export function leadKind(l: Pick<Lead, "department" | "product">): LeadKind {
  if (l.product) return "demo";
  return l.department === "sales" ? "service" : "message";
}
export async function listLeads(
  user: OfficeUser,
  kind: LeadKind,
  opts: { q?: string; limit?: number } = {},
) {
  const p = await payload();
  const and: Where[] = [leadWhere(kind)];
  if (opts.q)
    and.push({
      or: [
        { name: { like: opts.q } },
        { email: { like: opts.q } },
        { company: { like: opts.q } },
        { ref: { like: opts.q } },
      ],
    });
  const res = await p.find({
    collection: "leads",
    where: { and },
    sort: "-createdAt",
    limit: opts.limit ?? 300,
    depth: 1,
    user,
    overrideAccess: false,
  });
  return res.docs as Lead[];
}

export async function listApplications(
  user: OfficeUser,
  type: Application["type"],
  opts: { q?: string } = {},
) {
  const p = await payload();
  const and: Where[] = [{ type: { equals: type } }];
  if (opts.q)
    and.push({
      or: [
        { name: { like: opts.q } },
        { email: { like: opts.q } },
        { ref: { like: opts.q } },
        { subject: { like: opts.q } },
      ],
    });
  const res = await p.find({
    collection: "applications",
    where: { and },
    sort: "-createdAt",
    limit: 300,
    depth: 1,
    user,
    overrideAccess: false,
  });
  return res.docs as Application[];
}

export async function listProjects(user: OfficeUser) {
  const p = await payload();
  const res = await p.find({
    collection: "projects",
    sort: "dueDate",
    limit: 200,
    depth: 1,
    user,
    overrideAccess: false,
  });
  return res.docs as Project[];
}

export async function listEmployees(user: OfficeUser) {
  const p = await payload();
  const res = await p.find({
    collection: "employees",
    sort: "name",
    limit: 500,
    depth: 1,
    user,
    overrideAccess: false,
  });
  return res.docs as Employee[];
}

export async function staffUsers() {
  const p = await payload();
  const res = await p.find({
    collection: "users",
    limit: 200,
    depth: 0,
    overrideAccess: true,
    select: { name: true, email: true } as never,
  });
  return (res.docs as { id: number; name?: string; email: string }[]).map((u) => ({
    id: u.id,
    name: u.name || u.email,
  }));
}

// ---- Overview ------------------------------------------------------------------

const KIND_SQL = {
  service: sql`department = 'sales' and coalesce(product, '') = ''`,
  demo: sql`coalesce(product, '') <> ''`,
  message: sql`department <> 'sales' and coalesce(product, '') = ''`,
};

export async function overviewNumbers() {
  const [leads] = await rows<Record<string, number>>(sql`
    select
      count(*) filter (where ${KIND_SQL.service} and created_at > now() - interval '7 days')::int as service_7,
      count(*) filter (where ${KIND_SQL.service} and created_at between now() - interval '14 days' and now() - interval '7 days')::int as service_prev,
      count(*) filter (where ${KIND_SQL.demo} and created_at > now() - interval '7 days')::int as demo_7,
      count(*) filter (where ${KIND_SQL.demo} and created_at between now() - interval '14 days' and now() - interval '7 days')::int as demo_prev,
      count(*) filter (where ${KIND_SQL.message} and created_at > now() - interval '7 days')::int as message_7,
      count(*) filter (where ${KIND_SQL.message} and created_at between now() - interval '14 days' and now() - interval '7 days')::int as message_prev,
      count(*) filter (where status = 'new' and created_at < now() - interval '24 hours')::int as overdue_reply,
      count(*) filter (where next_follow_up_at < now() and status not in ('won','lost'))::int as overdue_followup,
      coalesce(sum(value) filter (where status not in ('won','lost')), 0)::float as pipeline_value,
      coalesce(sum(value) filter (where status = 'won' and updated_at > now() - interval '30 days'), 0)::float as won_30,
      coalesce(avg(extract(epoch from first_response_at - created_at) / 3600) filter (where first_response_at is not null and created_at > now() - interval '30 days'), 0)::float as reply_hours
    from leads`);
  const [apps] = await rows<Record<string, number>>(sql`
    select
      count(*) filter (where created_at > now() - interval '7 days')::int as new_7,
      count(*) filter (where created_at between now() - interval '14 days' and now() - interval '7 days')::int as new_prev,
      count(*) filter (where status = 'received' and created_at < now() - interval '3 days')::int as waiting,
      count(*) filter (where status in ('received','review','shortlisted'))::int as open
    from applications`);
  const [subs] = await rows<Record<string, number>>(sql`
    select count(*) filter (where confirmed_at is not null and unsubscribed_at is null)::int as active,
           count(*) filter (where confirmed_at > now() - interval '30 days')::int as new_30
    from subscribers`);
  const [projects] = await rows<Record<string, number>>(sql`
    select count(*) filter (where status = 'active')::int as active,
           count(*) filter (where health <> 'on-track' and status = 'active')::int as at_risk,
           count(*) filter (where due_date < now() and status not in ('done','cancelled'))::int as overdue
    from projects`);
  const [visits] = await rows<Record<string, number>>(sql`
    select count(distinct visitor) filter (where created_at > now() - interval '7 days')::int as visitors_7,
           count(distinct visitor) filter (where created_at between now() - interval '14 days' and now() - interval '7 days')::int as visitors_prev
    from page_views`);
  return { leads: leads!, apps: apps!, subs: subs!, projects: projects!, visits: visits! };
}

/** Requests per day by kind (and applications), for the overview chart. */
export async function activitySeries(days = 30) {
  return rows<{
    day: string;
    service: number;
    demo: number;
    message: number;
    applications: number;
  }>(sql`
    with d as (select generate_series(current_date - (${days - 1} * interval '1 day'), current_date, interval '1 day')::date as day)
    select to_char(d.day, 'YYYY-MM-DD') as day,
      (select count(*)::int from leads l where l.created_at::date = d.day and ${KIND_SQL.service}) as service,
      (select count(*)::int from leads l where l.created_at::date = d.day and ${KIND_SQL.demo}) as demo,
      (select count(*)::int from leads l where l.created_at::date = d.day and ${KIND_SQL.message}) as message,
      (select count(*)::int from applications a where a.created_at::date = d.day) as applications
    from d order by d.day`);
}

export async function attention(user: OfficeUser) {
  const p = await payload();
  const day = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const [stale, followUps, waiting, recent] = await Promise.all([
    p
      .find({
        collection: "leads",
        where: { and: [{ status: { equals: "new" } }, { createdAt: { less_than: day } }] },
        sort: "createdAt",
        limit: 6,
        depth: 0,
        user,
        overrideAccess: false,
      })
      .catch(() => ({ docs: [] })),
    p
      .find({
        collection: "leads",
        where: {
          and: [
            { nextFollowUpAt: { less_than: new Date().toISOString() } },
            { status: { not_in: ["won", "lost"] } },
          ],
        },
        sort: "nextFollowUpAt",
        limit: 6,
        depth: 0,
        user,
        overrideAccess: false,
      })
      .catch(() => ({ docs: [] })),
    p
      .find({
        collection: "applications",
        where: {
          and: [
            { status: { equals: "received" } },
            { createdAt: { less_than: new Date(Date.now() - 3 * 86400000).toISOString() } },
          ],
        },
        sort: "createdAt",
        limit: 6,
        depth: 0,
        user,
        overrideAccess: false,
      })
      .catch(() => ({ docs: [] })),
    p
      .find({ collection: "audit-log", sort: "-at", limit: 12, depth: 1, overrideAccess: true })
      .catch(() => ({ docs: [] })),
  ]);
  return {
    stale: stale.docs as Lead[],
    followUps: followUps.docs as Lead[],
    waiting: waiting.docs as Application[],
    recent: recent.docs as {
      id: number;
      at: string;
      action: string;
      entity: string;
      entityId?: string;
      actor?: { name?: string; email?: string } | number;
    }[],
  };
}

// ---- Analytics ------------------------------------------------------------------

export type Range = 7 | 30 | 90;

/** This site's host: a referrer from it is a move within the site, not a source. */
const OWN_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
})();

export async function analytics(range: Range) {
  const since = sql`now() - (${range} * interval '1 day')`;
  const prev = sql`now() - (${range * 2} * interval '1 day')`;
  const [
    series,
    totals,
    previous,
    pages,
    sources,
    countries,
    devices,
    browsers,
    locales,
    conversions,
  ] = await Promise.all([
    rows<{ day: string; visitors: number; views: number }>(sql`
      with d as (select generate_series(current_date - (${range - 1} * interval '1 day'), current_date, interval '1 day')::date as day)
      select to_char(d.day, 'YYYY-MM-DD') as day,
        coalesce(count(distinct v.visitor), 0)::int as visitors, count(v.id)::int as views
      from d left join page_views v on v.created_at::date = d.day group by d.day order by d.day`),
    rows<{
      visitors: number;
      views: number;
      sessions: number;
      bounces: number;
      avg_seconds: number;
    }>(sql`
      with s as (
        select session, count(*) as n,
          extract(epoch from max(updated_at) - min(created_at)) as secs
        from page_views where created_at > ${since} and session is not null group by session)
      select (select count(distinct visitor) from page_views where created_at > ${since})::int as visitors,
             (select count(*) from page_views where created_at > ${since})::int as views,
             (select count(*) from s)::int as sessions,
             -- A bounce: one page, left within 10 s (pings show who stayed to read).
             (select count(*) from s where n = 1 and secs < 10)::int as bounces,
             coalesce((select avg(secs) from s), 0)::float as avg_seconds`),
    rows<{ visitors: number; views: number }>(sql`
      select count(distinct visitor)::int as visitors, count(*)::int as views
      from page_views where created_at between ${prev} and ${since}`),
    rows<{ label: string; value: number; visitors: number }>(sql`
      select path as label, count(*)::int as value, count(distinct visitor)::int as visitors
      from page_views where created_at > ${since} group by path order by value desc limit 10`),
    rows<{ label: string; value: number }>(sql`
      select coalesce(nullif(utm_source, ''), nullif(nullif(referrer, ''), ${OWN_HOST}), 'Direct') as label, count(distinct visitor)::int as value
      from page_views where created_at > ${since} group by 1 order by value desc limit 10`),
    rows<{ label: string; value: number }>(sql`
      select coalesce(nullif(country, ''), '—') as label, count(distinct visitor)::int as value
      from page_views where created_at > ${since} group by 1 order by value desc limit 10`),
    rows<{ label: string; value: number }>(sql`
      select coalesce(device, 'desktop') as label, count(distinct visitor)::int as value
      from page_views where created_at > ${since} group by 1 order by value desc`),
    rows<{ label: string; value: number }>(sql`
      select coalesce(browser, 'Other') as label, count(distinct visitor)::int as value
      from page_views where created_at > ${since} group by 1 order by value desc limit 6`),
    rows<{ label: string; value: number }>(sql`
      select coalesce(nullif(locale, ''), 'en') as label, count(distinct visitor)::int as value
      from page_views where created_at > ${since} group by 1 order by value desc`),
    rows<{ leads: number; applications: number }>(sql`
      select (select count(*) from leads where created_at > ${since})::int as leads,
             (select count(*) from applications where created_at > ${since})::int as applications`),
  ]);
  return {
    series,
    totals: totals[0]!,
    previous: previous[0]!,
    pages,
    sources,
    countries,
    devices,
    browsers,
    locales,
    conversions: conversions[0]!,
  };
}

/**
 * Who is on the site now: visitors whose open page pinged (or loaded) in the last two
 * minutes (the tracker pings every 30 s while the page is visible), and the page
 * each of them is on.
 */
export async function realtimeVisitors() {
  const [r] = await rows<{ now: number; pages: { path: string; n: number }[] | null }>(sql`
    with live as (
      select distinct on (visitor) visitor, path from page_views
      where updated_at > now() - interval '2 minutes'
      order by visitor, updated_at desc)
    select (select count(*) from live)::int as now,
      (select json_agg(t) from (
        select path, count(*)::int as n from live group by path order by n desc, path limit 5) t) as pages`);
  return { now: r?.now ?? 0, pages: r?.pages ?? [] };
}
