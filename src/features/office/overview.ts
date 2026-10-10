import "server-only";
import { sql } from "@payloadcms/db-postgres";
import { payload } from "@/lib/cms/payload";

/** Data for the overview's sections (SQL aggregates; each section loads on its own). */
const rows = async <T>(q: ReturnType<typeof sql>) =>
  ((await (await payload()).db.drizzle.execute(q)).rows as T[]);

const SERVICE = sql`department = 'sales' and coalesce(product, '') = ''`;
const DEMO = sql`coalesce(product, '') <> ''`;
const MESSAGE = sql`department <> 'sales' and coalesce(product, '') = ''`;

/** Daily counts for the last `days` days: requests by kind, applications, visitors. */
export async function dailySeries(days = 14) {
  return rows<{ day: string; service: number; demo: number; message: number; applications: number; visitors: number }>(sql`
    with d as (select generate_series(current_date - (${days - 1} * interval '1 day'), current_date, interval '1 day')::date as day)
    select to_char(d.day, 'YYYY-MM-DD') as day,
      (select count(*)::int from leads l where l.created_at::date = d.day and ${SERVICE}) as service,
      (select count(*)::int from leads l where l.created_at::date = d.day and ${DEMO}) as demo,
      (select count(*)::int from leads l where l.created_at::date = d.day and ${MESSAGE}) as message,
      (select count(*)::int from applications a where a.created_at::date = d.day) as applications,
      (select count(distinct visitor)::int from page_views v where v.created_at::date = d.day) as visitors
    from d order by d.day`);
}

export async function clientsData() {
  const [stages, totals, services] = await Promise.all([
    rows<{ status: string; n: number; value: number }>(sql`
      select status, count(*)::int as n, coalesce(sum(value), 0)::float as value
      from leads where ${SERVICE} group by 1`),
    rows<{
      won: number;
      lost: number;
      reply_hours: number;
      replied_in_target: number;
      replied: number;
      won_value: number;
      service_30: number;
      demo_30: number;
      message_30: number;
    }>(sql`
      select
        count(*) filter (where status = 'won' and updated_at > now() - interval '90 days')::int as won,
        count(*) filter (where status = 'lost' and updated_at > now() - interval '90 days')::int as lost,
        coalesce(avg(extract(epoch from first_response_at - created_at) / 3600) filter (where first_response_at is not null and created_at > now() - interval '30 days'), 0)::float as reply_hours,
        count(*) filter (where first_response_at is not null and created_at > now() - interval '30 days' and first_response_at - created_at < interval '24 hours')::int as replied_in_target,
        count(*) filter (where first_response_at is not null and created_at > now() - interval '30 days')::int as replied,
        coalesce(sum(value) filter (where status = 'won' and updated_at > now() - interval '30 days'), 0)::float as won_value,
        count(*) filter (where ${SERVICE} and created_at > now() - interval '30 days')::int as service_30,
        count(*) filter (where ${DEMO} and created_at > now() - interval '30 days')::int as demo_30,
        count(*) filter (where ${MESSAGE} and created_at > now() - interval '30 days')::int as message_30
      from leads`),
    rows<{ svc: string; n: number }>(sql`
      select svc, count(*)::int as n from leads l, jsonb_array_elements_text(coalesce(l.services, '[]'::jsonb)) svc
      where l.created_at > now() - interval '90 days' group by 1 order by 2 desc limit 5`),
  ]);
  return { stages, totals: totals[0]!, services };
}

export async function talentData(types: string[]) {
  if (!types.length) return null;
  const inTypes = sql.join(types.map((t) => sql`${t}`), sql`, `);
  const [byStage, byType, openings] = await Promise.all([
    rows<{ status: string; n: number }>(sql`
      select status, count(*)::int as n from applications where type in (${inTypes}) group by 1`),
    rows<{ type: string; n: number; prev: number }>(sql`
      select type,
        count(*) filter (where created_at > now() - interval '30 days')::int as n,
        count(*) filter (where created_at between now() - interval '60 days' and now() - interval '30 days')::int as prev
      from applications where type in (${inTypes}) group by 1`),
    rows<{ id: number; title: string; kind: string; closes_at: string | null; seats: number | null; applied: number; accepted: number }>(sql`
      select o.id, l.title, o.kind, o.closes_at, o.seats,
        (select count(*) from applications a where a.opening_id = o.id)::int as applied,
        (select count(*) from applications a where a.opening_id = o.id and a.status = 'accepted')::int as accepted
      from openings o join openings_locales l on l._parent_id = o.id and l._locale = 'en'
      where o.status = 'open' and o.kind in (${inTypes})
      order by o.closes_at nulls last limit 5`),
  ]);
  return { byStage, byType, openings };
}

export async function workData() {
  const [health, active] = await Promise.all([
    rows<{ health: string; n: number }>(sql`
      select health, count(*)::int as n from projects where status in ('planning','active','on-hold') group by 1`),
    rows<{ id: number; name: string; progress: number; due_date: string | null; health: string; kind: string }>(sql`
      select id, name, coalesce(progress, 0)::int as progress, due_date, health, kind from projects
      where status in ('active','planning') order by due_date nulls last limit 6`),
  ]);
  return { health, active };
}

export async function peopleData() {
  const [depts, totals] = await Promise.all([
    rows<{ d: string; n: number }>(sql`
      select department as d, count(*)::int as n from employees where status <> 'left' group by 1 order by 2 desc`),
    rows<{ headcount: number; on_leave: number; joined: number; interns: number }>(sql`
      select count(*) filter (where status <> 'left')::int as headcount,
        count(*) filter (where status = 'on-leave')::int as on_leave,
        count(*) filter (where start_date > now() - interval '90 days')::int as joined,
        count(*) filter (where employment = 'intern' and status <> 'left')::int as interns
      from employees`),
  ]);
  return { depts, totals: totals[0]! };
}

export async function websiteData() {
  const [series, pages, totals] = await Promise.all([
    rows<{ day: string; visitors: number; views: number }>(sql`
      with d as (select generate_series(current_date - interval '29 days', current_date, interval '1 day')::date as day)
      select to_char(d.day, 'YYYY-MM-DD') as day, count(distinct v.visitor)::int as visitors, count(v.id)::int as views
      from d left join page_views v on v.created_at::date = d.day group by d.day order by d.day`),
    rows<{ label: string; value: number }>(sql`
      select path as label, count(distinct visitor)::int as value from page_views
      where created_at > now() - interval '30 days' group by 1 order by 2 desc limit 5`),
    rows<{ now: number; leads: number; visitors: number }>(sql`
      select (select count(distinct visitor) from page_views where created_at > now() - interval '5 minutes')::int as now,
        (select count(*) from leads where created_at > now() - interval '30 days')::int as leads,
        (select count(distinct visitor) from page_views where created_at > now() - interval '30 days')::int as visitors`),
  ]);
  return { series, pages, totals: totals[0]! };
}
