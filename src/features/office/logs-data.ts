import "server-only";
import { sql } from "@payloadcms/db-postgres";

type SQL = ReturnType<typeof sql>;
import { payload } from "@/lib/cms/payload";
import { LOG_CATEGORIES, type LogCategory, type LogEntry } from "./logs";

// Same rules as categoryOf() in logs.ts, in SQL (filters and charts).
const CATEGORY = sql.raw(`case
  when a.action like 'auth.%' then 'security'
  when a.action = 'member.register' then 'public'
  when a.action like 'user.%' or a.action like 'role.%' or a.action like 'member.%' then 'accounts'
  when a.action like 'privacy.%' or a.action = 'export.csv' then 'privacy'
  when a.action like 'settings.%' then 'settings'
  when a.action in ('submit', 'apply') then 'public'
  when a.action like 'retention.%' or a.action like 'job.%' then 'system'
  when a.action like 'live-edit.%' or a.entity not in ('leads','applications','projects','employees','openings') then 'content'
  else 'records' end`);

export type LogFilters = {
  q?: string;
  actor?: number;
  category?: LogCategory;
  entity?: string;
  entityId?: string;
  from?: string;
  to?: string;
  alerts?: boolean;
};

function where(f: LogFilters): SQL {
  const parts: SQL[] = [sql`true`];
  if (f.actor) parts.push(sql`a.actor_id = ${f.actor}`);
  if (f.category) parts.push(sql`(${CATEGORY}) = ${f.category}`);
  if (f.entity) parts.push(sql`a.entity = ${f.entity}`);
  if (f.entityId) parts.push(sql`a.entity_id = ${f.entityId}`);
  if (f.from) parts.push(sql`a.at >= ${new Date(f.from).toISOString()}`);
  if (f.to)
    parts.push(sql`a.at < ${new Date(new Date(f.to).getTime() + 86_400_000).toISOString()}`);
  if (f.alerts)
    parts.push(
      sql`a.action in ('auth.login-throttled','auth.mfa-failed','privacy.erase','user.delete','role.delete','delete')`,
    );
  if (f.q) {
    const like = `%${f.q}%`;
    parts.push(
      sql`(a.label ilike ${like} or a.entity_id = ${f.q} or a.action ilike ${like} or coalesce(a.actor_name, u.name, u.email) ilike ${like})`,
    );
  }
  return sql.join(parts, sql` and `);
}

type Row = {
  id: number;
  at: string | Date;
  action: string;
  entity: string;
  entity_id: string | null;
  label: string | null;
  actor_id: number | null;
  actor_name: string | null;
  actor_type: string | null;
  meta: Record<string, unknown> | null;
  ip: string | null;
  device: string | null;
};

export async function listLogs(f: LogFilters, page = 1, limit = 60) {
  const db = (await payload()).db.drizzle;
  const w = where(f);
  const [rows, count] = await Promise.all([
    db.execute(sql`
      select a.id, a.at, a.action, a.entity, a.entity_id, a.label, a.actor_id,
             coalesce(a.actor_name, u.name, u.email) as actor_name,
             coalesce(a.actor_type::text, case when a.actor_id is not null then 'staff'
               when a.action = 'submit' then 'public' else 'system' end) as actor_type,
             a.meta, a.ip, a.device
      from audit_log a left join users u on u.id = a.actor_id
      where ${w}
      order by a.at desc, a.id desc
      limit ${limit} offset ${(page - 1) * limit}`),
    db.execute(
      sql`select count(*)::int as n from audit_log a left join users u on u.id = a.actor_id where ${w}`,
    ),
  ]);
  const total = (count.rows[0] as { n: number }).n;
  const entries = (rows.rows as Row[]).map((r): LogEntry & { actorId: number | null } => ({
    id: r.id,
    at: new Date(r.at).toISOString(),
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id,
    label: r.label,
    actorId: r.actor_id,
    actorName: r.actor_name,
    actorType: r.actor_type,
    meta: r.meta,
    ip: r.ip,
    device: r.device,
  }));
  return { entries, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

/** Daily counts per category, totals and the most active people (for the charts). */
export async function logStats(f: LogFilters, days = 14) {
  const db = (await payload()).db.drizzle;
  const w = where({ ...f, from: undefined, to: undefined });
  const [series, totals, actors, entities] = await Promise.all([
    db.execute(sql`
      select to_char(d, 'YYYY-MM-DD') as day, c as category, coalesce(n, 0)::int as n
      from generate_series(date_trunc('day', now() - make_interval(days => ${days - 1})), date_trunc('day', now()), interval '1 day') d
      cross join unnest(array['security','records','content','accounts','privacy','settings','public','system']) c
      left join (
        select date_trunc('day', a.at) as day, (${CATEGORY}) as category, count(*) as n
        from audit_log a left join users u on u.id = a.actor_id
        where ${w} and a.at > now() - make_interval(days => ${days})
        group by 1, 2
      ) x on x.day = d and x.category = c
      order by 1`),
    db.execute(sql`
      select
        count(*) filter (where a.at > date_trunc('day', now()))::int as today,
        count(*) filter (where a.at > now() - interval '7 days')::int as week,
        count(distinct a.actor_id) filter (where a.at > now() - interval '7 days')::int as people,
        count(*) filter (where a.at > now() - interval '7 days' and a.action in ('auth.login-throttled','auth.mfa-failed','privacy.erase','user.delete','role.delete','delete'))::int as alerts,
        count(*) filter (where a.at > now() - interval '7 days' and a.action = 'auth.login')::int as signins
      from audit_log a left join users u on u.id = a.actor_id where ${w}`),
    db.execute(sql`
      select a.actor_id as id, coalesce(max(a.actor_name), max(u.name), max(u.email)) as name, count(*)::int as n
      from audit_log a left join users u on u.id = a.actor_id
      where ${w} and a.actor_id is not null and a.at > now() - make_interval(days => ${days})
      group by 1 order by 3 desc limit 6`),
    db.execute(sql`
      select a.entity, count(*)::int as n from audit_log a left join users u on u.id = a.actor_id
      where ${w} and a.at > now() - make_interval(days => ${days}) group by 1 order by 2 desc limit 8`),
  ]);
  const byDay = new Map<string, Record<string, number | string>>();
  for (const r of series.rows as { day: string; category: string; n: number }[]) {
    if (!byDay.has(r.day)) byDay.set(r.day, { day: r.day });
    byDay.get(r.day)![r.category] = r.n;
  }
  return {
    series: [...byDay.values()] as ({ day: string } & Record<string, number | string>)[],
    totals: totals.rows[0] as {
      today: number;
      week: number;
      people: number;
      alerts: number;
      signins: number;
    },
    actors: actors.rows as { id: number; name: string; n: number }[],
    entities: entities.rows as { entity: string; n: number }[],
  };
}

/** Activity per day for one person over the last weeks (profile heatmap). */
export async function activityHeatmap(userId: number, weeks = 18) {
  const db = (await payload()).db.drizzle;
  const rows = await db.execute(sql`
    select to_char(d, 'YYYY-MM-DD') as day, coalesce(x.n, 0)::int as n
    from generate_series(date_trunc('day', now() - make_interval(days => ${weeks * 7 - 1})), date_trunc('day', now()), interval '1 day') d
    left join (
      select date_trunc('day', at) as day, count(*) as n from audit_log
      where actor_id = ${userId} and at > now() - make_interval(days => ${weeks * 7})
      group by 1
    ) x on x.day = d
    order by 1`);
  return rows.rows as { day: string; n: number }[];
}

/** Profile pictures for the people in a list of entries. */
export async function avatarsFor(ids: (number | null | undefined)[]) {
  const unique = [...new Set(ids.filter((i): i is number => typeof i === "number"))];
  if (!unique.length) return {};
  const p = await payload();
  const res = await p.find({
    collection: "users",
    where: { id: { in: unique } },
    depth: 1,
    limit: unique.length,
    overrideAccess: true,
  });
  return Object.fromEntries(res.docs.map((u) => [u.id, u.avatar])) as Record<number, unknown>;
}

/** Filters from the page's query string. */
export function filtersFrom(sp: Record<string, string | undefined>): LogFilters {
  return {
    q: sp.q?.trim() || undefined,
    actor: sp.actor ? Number(sp.actor) : undefined,
    category:
      sp.category && sp.category in LOG_CATEGORIES ? (sp.category as LogCategory) : undefined,
    entity: sp.entity || undefined,
    entityId: sp.record || undefined,
    from: sp.from || undefined,
    to: sp.to || undefined,
    alerts: sp.alerts === "1",
  };
}
