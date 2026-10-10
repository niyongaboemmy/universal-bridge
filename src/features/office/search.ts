import "server-only";
import { sql } from "@payloadcms/db-postgres";
import { can, type UserLike } from "@/access/roles";
import { applicationTypesFor } from "@/collections/Applications";
import { leadKindsFor } from "@/collections/Leads";
import { payload } from "@/lib/cms/payload";

type SQL = ReturnType<typeof sql>;

export type SearchHit = {
  type: string;
  id: number | string;
  title: string;
  subtitle: string;
  href: string;
  /** Text around the match when it was found deeper than the title (message, answers, notes…). */
  snippet?: string;
  at?: string;
};

type Source = {
  type: string;
  /** null: this person can't search it. */
  scope: (u: UserLike) => SQL | null;
  query: (hay: SQL, scope: SQL, terms: SQL, first: string) => SQL;
};

const LEAD_SCOPE: Record<string, string> = {
  service: `(department = 'sales' and coalesce(product,'') = '')`,
  demo: `(coalesce(product,'') <> '')`,
  message: `(department <> 'sales' and coalesce(product,'') = '')`,
};

/** Every term must appear somewhere in the row's text (case-insensitive). */
const allTerms = (hay: SQL, terms: string[]) =>
  sql.join(
    terms.map((t) => sql`${hay} ilike ${`%${t.replace(/[%_\\]/g, "\\$&")}%`}`),
    sql` and `,
  );

const SOURCES: Source[] = [
  {
    type: "Request",
    scope: (u) => {
      const kinds = leadKindsFor(u);
      if (kinds === "all") return sql`true`;
      return kinds.length ? sql.raw(kinds.map((k) => LEAD_SCOPE[k]).join(" or ")) : null;
    },
    query: (hay, scope, terms, first) => sql`
      select l.id, l.name as title, concat_ws(' · ', l.ref, coalesce(nullif(l.company,''), l.email), l.status) as subtitle,
        concat('/office/requests/', l.id) as href, ${hay} as hay, l.updated_at as at
      from leads l
      where (${scope}) and ${terms}
      order by (l.ref ilike ${first}) desc, l.updated_at desc limit 6`,
  },
  {
    type: "Applicant",
    scope: (u) => {
      const t = applicationTypesFor(u);
      if (t === "all") return sql`true`;
      return t.length ? sql`a.type in (${sql.join(t.map((x) => sql`${x}`), sql`, `)})` : null;
    },
    query: (hay, scope, terms) => sql`
      select a.id, a.name as title, concat_ws(' · ', a.ref, a.type, coalesce(a.subject, ''), a.status) as subtitle,
        concat('/office/applicants/', a.id) as href, ${hay} as hay, a.updated_at as at
      from applications a where (${scope}) and ${terms}
      order by a.updated_at desc limit 6`,
  },
  {
    type: "Opening",
    scope: (u) => (can(u, "openings.view", "openings.manage") ? sql`true` : null),
    query: (hay, _s, terms) => sql`
      select o.id, l.title, concat_ws(' · ', o.kind, o.status, '/apply/' || o.slug) as subtitle,
        concat('/office/openings/', o.id) as href, ${hay} as hay, o.updated_at as at
      from openings o join openings_locales l on l._parent_id = o.id and l._locale = 'en'
      where ${terms} order by o.updated_at desc limit 5`,
  },
  {
    type: "Project",
    scope: (u) => (can(u, "projects.view", "projects.manage") ? sql`true` : null),
    query: (hay, _s, terms) => sql`
      select p.id, p.name as title, concat_ws(' · ', p.code, p.client, p.kind, p.status) as subtitle,
        concat('/office/projects/', p.id) as href, ${hay} as hay, p.updated_at as at
      from projects p where ${terms} order by p.updated_at desc limit 5`,
  },
  {
    type: "Employee",
    scope: (u) => (can(u, "people.view", "people.manage") ? sql`true` : null),
    query: (hay, _s, terms) => sql`
      select e.id, e.name as title, concat_ws(' · ', e.job_title, e.department, e.status) as subtitle,
        concat('/office/people/', e.id) as href, ${hay} as hay, e.updated_at as at
      from employees e where ${terms} order by e.name limit 5`,
  },
  {
    type: "Staff account",
    scope: (u) => (can(u, "users.manage") ? sql`true` : null),
    query: (hay, _s, terms) => sql`
      select u.id, coalesce(u.name, u.email) as title, concat_ws(' · ', u.email, u.job_title) as subtitle,
        concat('/office/accounts?q=', u.email) as href, ${hay} as hay, u.updated_at as at
      from users u where ${terms} order by u.name limit 5`,
  },
  {
    type: "Member",
    scope: (u) => (can(u, "members.manage") ? sql`true` : null),
    query: (hay, _s, terms) => sql`
      select m.id, m.name as title, concat_ws(' · ', m.email, m.country) as subtitle,
        concat('/office/accounts?tab=members&q=', m.email) as href, ${hay} as hay, m.updated_at as at
      from members m where ${terms} order by m.updated_at desc limit 5`,
  },
  {
    type: "Role",
    scope: (u) => (can(u, "roles.manage") ? sql`true` : null),
    query: (hay, _s, terms) => sql`
      select r.id, r.name as title, coalesce(r.description, r.audience::text) as subtitle,
        '/office/roles' as href, ${hay} as hay, r.updated_at as at
      from roles r where ${terms} limit 4`,
  },
  {
    type: "Subscriber",
    scope: (u) => (can(u, "subscribers.view") ? sql`true` : null),
    query: (hay, _s, terms) => sql`
      select s.id, s.email as title, case when s.confirmed_at is null then 'not confirmed' else 'confirmed' end as subtitle,
        concat('/admin/collections/subscribers/', s.id) as href, ${hay} as hay, s.updated_at as at
      from subscribers s where ${terms} order by s.updated_at desc limit 4`,
  },
  {
    type: "Certificate",
    scope: (u) => (can(u, "content.academy") ? sql`true` : null),
    query: (hay, _s, terms) => sql`
      select c.id, c.holder_name as title, concat_ws(' · ', c.code, c.program_title, c.status) as subtitle,
        concat('/admin/collections/certificates/', c.id) as href, ${hay} as hay, c.updated_at as at
      from certificates c where ${terms} order by c.updated_at desc limit 4`,
  },
];

/** Website content (CMS): titles, summaries and SEO text in every language. */
const CONTENT: { table: string; slug: string; label: string; perm: Parameters<typeof can>[1]; cols: string }[] = [
  { table: "pages", slug: "pages", label: "Page", perm: "content.site", cols: "l.title, l.seo_description" },
  { table: "posts", slug: "posts", label: "Post", perm: "content.site", cols: "l.title, l.excerpt" },
  { table: "services", slug: "services", label: "Service", perm: "content.site", cols: "l.title, l.summary" },
  { table: "case_studies", slug: "case-studies", label: "Case study", perm: "content.site", cols: "l.title, l.summary, l.client_label" },
  { table: "programs", slug: "programs", label: "Program", perm: "content.academy", cols: "l.title, l.summary" },
  { table: "jobs", slug: "jobs", label: "Job post", perm: "content.careers", cols: "l.title, l.summary" },
  { table: "events", slug: "events", label: "Event", perm: "content.site", cols: "l.title, l.summary" },
];

function snippet(hay: string, terms: string[], title: string): string | undefined {
  const lower = hay.toLowerCase();
  const term = terms.find((t) => !title.toLowerCase().includes(t.toLowerCase())) ?? terms[0]!;
  const i = lower.indexOf(term.toLowerCase());
  if (i < 0 || (title.toLowerCase().includes(term.toLowerCase()) && terms.every((t) => title.toLowerCase().includes(t.toLowerCase()))))
    return undefined;
  const start = Math.max(0, i - 50);
  const text = hay.slice(start, i + term.length + 70).replace(/\s+/g, " ").trim();
  return (start > 0 ? "…" : "") + text + (i + term.length + 70 < hay.length ? "…" : "");
}

/** Hay (all searchable text) per source, kept next to the query that uses it. */
const HAY: Record<string, string> = {
  Request: `concat_ws(' ', l.ref, l.name, l.email, l.company, l.phone, l.country, l.product, l.message, l.budget_range, l.services::text, (select string_agg(n.body, ' ') from leads_notes n where n._parent_id = l.id))`,
  Applicant: `concat_ws(' ', a.ref, a.name, a.email, a.phone, a.subject, a.type, a.data::text, a.consent_guardian, (select string_agg(n.body, ' ') from applications_notes n where n._parent_id = a.id))`,
  Opening: `concat_ws(' ', l.title, o.slug, l.location, l.summary, l.description, o.kind)`,
  Project: `concat_ws(' ', p.name, p.code, p.client, p.summary, p.kind)`,
  Employee: `concat_ws(' ', e.name, e.job_title, e.email, e.phone, e.department, e.notes, (select string_agg(t.text, ' ') from employees_texts t where t.parent_id = e.id))`,
  "Staff account": `concat_ws(' ', u.name, u.email, u.job_title, u.phone)`,
  Member: `concat_ws(' ', m.name, m.email, m.phone, m.country)`,
  Role: `concat_ws(' ', r.name, r.slug, r.description)`,
  Subscriber: `s.email`,
  Certificate: `concat_ws(' ', c.code, c.holder_name, c.program_title, c.role)`,
};

/** Search everything this person may open, in one go. */
export async function deepSearch(user: UserLike, q: string): Promise<SearchHit[]> {
  const terms = q
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .slice(0, 5);
  if (!terms.length) return [];
  const db = (await payload()).db.drizzle;
  const jobs = SOURCES.map(async (s) => {
    const scope = s.scope(user);
    if (!scope) return [];
    const hay = sql.raw(HAY[s.type]!);
    const query = s.query(hay, scope, allTerms(hay, terms), `${terms[0]}%`);
    try {
      const rows = (await db.execute(query)).rows as {
        id: number;
        title: string;
        subtitle: string;
        href: string;
        hay: string;
        at: string;
      }[];
      return rows.map((r) => ({
        type: s.type,
        id: r.id,
        title: r.title,
        subtitle: r.subtitle,
        href: r.href,
        snippet: snippet(r.hay ?? "", terms, `${r.title} ${r.subtitle}`),
        at: r.at ? new Date(r.at).toISOString() : undefined,
      }));
    } catch (err) {
      (await payload()).logger.warn({ err, source: s.type }, "Search source failed");
      return [];
    }
  });
  const content = CONTENT.filter((c) => can(user, c.perm)).map(async (c) => {
    const hay = sql.raw(`concat_ws(' ', ${c.cols})`);
    try {
      const rows = (
        await db.execute(sql`
          select distinct on (t.id) t.id, l.title, l._locale as locale, ${hay} as hay
          from ${sql.raw(c.table)} t join ${sql.raw(c.table + "_locales")} l on l._parent_id = t.id
          where ${allTerms(hay, terms)} order by t.id, (l._locale = 'en') desc limit 4`)
      ).rows as { id: number; title: string; locale: string; hay: string }[];
      return rows.map((r) => ({
        type: c.label,
        id: r.id,
        title: r.title ?? `${c.label} ${r.id}`,
        subtitle: `Website content · ${r.locale.toUpperCase()}`,
        href: `/admin/collections/${c.slug}/${r.id}`,
        snippet: snippet(r.hay ?? "", terms, r.title ?? ""),
      }));
    } catch {
      return [];
    }
  });
  return (await Promise.all([...jobs, ...content])).flat();
}
