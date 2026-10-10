import "server-only";
import { sql } from "@payloadcms/db-postgres";
import { can, type UserLike } from "@/access/roles";
import { payload } from "@/lib/cms/payload";
import { settings } from "@/lib/settings";

export type Upcoming = {
  key: string;
  kind: "followup" | "overdue" | "opening" | "intake" | "project" | "review";
  title: string;
  body: string;
  href: string;
  due?: string;
  tone: "warn" | "info" | "late";
};

/**
 * What's coming up for this person, computed live from the data (not stored):
 * follow-ups due, unanswered requests past the reply target, openings closing,
 * intakes starting, projects due and applicants waiting for review.
 */
export async function upcomingFor(user: UserLike & { id: number }): Promise<Upcoming[]> {
  const db = (await payload()).db.drizzle;
  const s = await settings();
  const out: Upcoming[] = [];
  const rows = async <T>(q: ReturnType<typeof sql>) => (await db.execute(q)).rows as T[];
  const jobs: Promise<void>[] = [];

  if (can(user, "requests.view", "requests.manage", "demos.view", "demos.manage", "messages.view", "messages.manage")) {
    jobs.push(
      rows<{ id: number; ref: string; name: string; at: string }>(sql`
        select id, ref, name, next_follow_up_at as at from leads
        where assignee_id = ${user.id} and status not in ('won','lost')
          and next_follow_up_at < date_trunc('day', now()) + interval '1 day'
        order by next_follow_up_at limit 8`).then((r) =>
        r.forEach((l) =>
          out.push({
            key: `f${l.id}`,
            kind: "followup",
            title: `Follow up with ${l.name}`,
            body: l.ref,
            href: `/office/requests/${l.id}`,
            due: new Date(l.at).toISOString(),
            tone: new Date(l.at).getTime() < Date.now() ? "late" : "warn",
          }),
        ),
      ),
    );
  }
  if (can(user, "requests.manage", "messages.manage", "demos.manage")) {
    jobs.push(
      rows<{ n: number }>(sql`
        select count(*)::int as n from leads
        where status = 'new' and created_at < now() - make_interval(hours => ${s.responseHours})`).then(
        ([r]) => {
          if (r?.n)
            out.push({
              key: "overdue",
              kind: "overdue",
              title: `${r.n} ${r.n === 1 ? "request has" : "requests have"} waited over ${s.responseHours} h`,
              body: "No reply yet",
              href: "/office/requests?stage=new&sort=oldest&view=list",
              tone: "late",
            });
        },
      ),
    );
  }
  if (can(user, "openings.view", "openings.manage")) {
    jobs.push(
      rows<{ id: number; title: string; at: string }>(sql`
        select o.id, l.title, o.closes_at as at from openings o
        join openings_locales l on l._parent_id = o.id and l._locale = 'en'
        where o.status = 'open' and o.closes_at between now() and now() + interval '3 days'
        order by o.closes_at limit 5`).then((r) =>
        r.forEach((o) =>
          out.push({
            key: `o${o.id}`,
            kind: "opening",
            title: `${o.title} closes soon`,
            body: "Applications close in under 3 days",
            href: `/office/openings/${o.id}`,
            due: new Date(o.at).toISOString(),
            tone: "warn",
          }),
        ),
      ),
    );
  }
  if (can(user, "applicants.academy")) {
    jobs.push(
      rows<{ id: number; program: string; at: string }>(sql`
        select i.id, p.title as program, i.start_date as at from intakes i
        join programs_locales p on p._parent_id = i.program_id and p._locale = 'en'
        where i.start_date between now() and now() + interval '7 days' order by i.start_date limit 5`).then(
        (r) =>
          r.forEach((i) =>
            out.push({
              key: `i${i.id}`,
              kind: "intake",
              title: `${i.program} intake starts`,
              body: "Within a week",
              href: `/office/applicants?type=academy&intake=${i.id}`,
              due: new Date(i.at).toISOString(),
              tone: "info",
            }),
          ),
      ),
    );
  }
  if (can(user, "projects.view", "projects.manage")) {
    jobs.push(
      rows<{ id: number; name: string; at: string }>(sql`
        select id, name, due_date as at from projects
        where status not in ('done','cancelled') and due_date < now() + interval '7 days'
        order by due_date limit 6`).then((r) =>
        r.forEach((p) =>
          out.push({
            key: `p${p.id}`,
            kind: "project",
            title: new Date(p.at).getTime() < Date.now() ? `${p.name} is overdue` : `${p.name} is due`,
            body: "Project deadline",
            href: `/office/projects/${p.id}`,
            due: new Date(p.at).toISOString(),
            tone: new Date(p.at).getTime() < Date.now() ? "late" : "warn",
          }),
        ),
      ),
    );
  }
  const types = ["academy", "internship", "job", "partner", "event"].filter((t) =>
    can(user, `applicants.${t}` as never),
  );
  if (types.length) {
    jobs.push(
      rows<{ type: string; n: number }>(sql`
        select type, count(*)::int as n from applications
        where status = 'received' and created_at < now() - interval '3 days'
          and type in (${sql.join(types.map((t) => sql`${t}`), sql`, `)})
        group by 1`).then((r) =>
        r.forEach((a) =>
          out.push({
            key: `a${a.type}`,
            kind: "review",
            title: `${a.n} ${a.type} ${a.n === 1 ? "applicant waits" : "applicants wait"} for review`,
            body: "Received over 3 days ago",
            href: `/office/applicants?type=${a.type}&stage=received&sort=oldest`,
            tone: "warn",
          }),
        ),
      ),
    );
  }
  await Promise.all(jobs);
  const rank = { late: 0, warn: 1, info: 2 } as const;
  return out.sort((a, b) => rank[a.tone] - rank[b.tone] || (a.due ?? "").localeCompare(b.due ?? ""));
}
