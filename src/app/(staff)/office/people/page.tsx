import { sql } from "@payloadcms/db-postgres";
import { Columns3, LayoutGrid, Plus } from "lucide-react";
import { CategoryCards, STAGE_COLORS } from "@/components/office/CategoryCards";
import { Kanban } from "@/components/office/Kanban";
import { employeeCard } from "@/features/office/cards";
import Link from "next/link";
import type { Where } from "payload";
import { FilterBar } from "@/components/office/FilterBar";
import { fmtDate, titleCase } from "@/components/office/format";
import { Pagination } from "@/components/office/Pagination";
import {
  Empty,
  PageHeader,
  Pill,
  STATUS_TONE,
  Stat,
  btn,
  btnPrimary,
} from "@/components/office/ui";
import { DEPARTMENTS_STAFF, EMPLOYMENT } from "@/collections/Company";
import { findPage, listHref, listParams, textSearch, type Params } from "@/features/office/query";
import { requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import type { Employee } from "@/payload-types";

export const metadata = { title: "Employees" };

const SORTS = { name: "name", newest: "-startDate", longest: "startDate", title: "jobTitle" };

export default async function People({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await requireArea("people");
  const sp = await searchParams;
  const board = sp.view !== "cards";
  const { limit, page, sort } = listParams(sp, SORTS, "name");
  const where: Where[] = [...textSearch(sp.q, ["name", "jobTitle", "email"])];
  if (sp.dept) where.push({ department: { equals: sp.dept } });
  // Former employees are hidden unless a status is picked.
  if (sp.status) where.push({ status: { equals: sp.status } });
  else if (!board) where.push({ status: { not_equals: "left" } });
  if (sp.employment) where.push({ employment: { equals: sp.employment } });
  if (sp.manager) where.push({ manager: { equals: Number(sp.manager) } });
  if (sp.skill) where.push({ skills: { in: [sp.skill] } });

  const db = (await payload()).db.drizzle;
  const [result, stats, depts, managers, skills] = await Promise.all([
    findPage<Employee>(user, "employees", {
      where,
      sort,
      page: board ? 1 : page,
      limit: board ? 300 : limit,
    }),
    db.execute(sql`
      select count(*) filter (where status <> 'left' and employment <> 'intern')::int as headcount,
             count(*) filter (where status <> 'left' and employment = 'intern')::int as interns,
             count(*) filter (where status = 'on-leave')::int as on_leave,
             count(*) filter (where start_date > now() - interval '12 months')::int as joined,
             count(*) filter (where end_date > now() - interval '12 months')::int as left_12
      from employees`),
    db.execute(
      sql`select department as d, count(*) filter (where status <> 'left')::int as n,
        count(*) filter (where status = 'active')::int as active,
        count(*) filter (where status = 'on-leave')::int as on_leave,
        count(*) filter (where status = 'left')::int as gone
        from employees group by 1 order by 2 desc`,
    ),
    db.execute(
      sql`select distinct m.id, m.name from employees e join employees m on m.id = e.manager_id order by m.name`,
    ),
    db.execute(
      sql`select distinct text as s from employees_texts where path = 'skills' order by 1 limit 80`,
    ),
  ]);
  const st = stats.rows[0] as {
    headcount: number;
    interns: number;
    on_leave: number;
    joined: number;
    left_12: number;
  };
  const deptRows = depts.rows as {
    d: string;
    n: number;
    active: number;
    on_leave: number;
    gone: number;
  }[];
  const seg = (r: { active: number; on_leave: number; gone: number }) => [
    { label: "active", value: r.active, color: STAGE_COLORS.active! },
    { label: "on leave", value: r.on_leave, color: STAGE_COLORS["on-leave"]! },
    { label: "left", value: r.gone, color: STAGE_COLORS.left! },
  ];
  const sum = deptRows.reduce(
    (a, r) => ({
      active: a.active + r.active,
      on_leave: a.on_leave + r.on_leave,
      gone: a.gone + r.gone,
    }),
    { active: 0, on_leave: 0, gone: 0 },
  );
  const viewHref = (view?: string) => listHref("/office/people", { ...sp, view, page: undefined });

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Employees"
        subtitle="The team directory. Personal details are visible to HR and super admins only."
        actions={
          <>
            <Link href={viewHref(board ? "cards" : undefined)} className={btn}>
              {board ? (
                <LayoutGrid className="size-4" aria-hidden />
              ) : (
                <Columns3 className="size-4" aria-hidden />
              )}
              {board ? "Cards" : "Board"}
            </Link>
            <Link href="/office/people/new" className={btnPrimary}>
              <Plus className="size-4" aria-hidden /> Add employee
            </Link>
          </>
        }
      />
      <div className="office-stagger grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Headcount" value={st.headcount} hint={`${st.interns} interns`} />
        <Stat label="On leave" value={st.on_leave} />
        <Stat label="Joined · 12 months" value={st.joined} tone="good" />
        <Stat label="Left · 12 months" value={st.left_12} />
      </div>
      <CategoryCards
        cols={4}
        items={[
          {
            key: "all",
            label: "Everyone",
            href: listHref("/office/people", { view: sp.view }),
            active: !sp.dept,
            count: sum.active + sum.on_leave,
            hint: "on the team",
            segments: seg(sum),
          },
          ...deptRows.map((r) => ({
            key: r.d,
            label: titleCase(r.d),
            href: listHref("/office/people", { view: sp.view, dept: r.d }),
            active: sp.dept === r.d,
            count: r.n,
            hint: "on the team",
            segments: seg(r),
          })),
        ]}
      />
      <FilterBar
        keep={["dept", "view"]}
        fields={[
          { kind: "search", name: "q", placeholder: "Search name, job title, email…" },
          {
            kind: "select",
            name: "dept",
            label: "Department",
            options: DEPARTMENTS_STAFF.map((d) => ({ value: d, label: titleCase(d) })),
          },
          {
            kind: "select",
            name: "status",
            label: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "on-leave", label: "On leave" },
              { value: "left", label: "Former" },
            ],
          },
          {
            kind: "select",
            name: "employment",
            label: "Employment",
            options: EMPLOYMENT.map((e) => ({ value: e, label: titleCase(e) })),
          },
          {
            kind: "select",
            name: "manager",
            label: "Reports to",
            options: (managers.rows as { id: number; name: string }[]).map((m) => ({
              value: String(m.id),
              label: m.name,
            })),
          },
          {
            kind: "select",
            name: "skill",
            label: "Skill",
            options: (skills.rows as { s: string }[]).map((r) => ({ value: r.s, label: r.s })),
          },
        ]}
        sorts={[
          { value: "name", label: "Name A–Z" },
          { value: "newest", label: "Newest hires" },
          { value: "longest", label: "Longest serving" },
          { value: "title", label: "Job title" },
        ]}
      />
      {board ? (
        result.totalDocs ? (
          <Kanban
            kind="employee"
            columns={[
              { id: "active", label: "Active" },
              { id: "on-leave", label: "On leave" },
              { id: "left", label: "Former" },
            ]}
            items={result.docs.map(employeeCard)}
          />
        ) : (
          <Empty title="Nobody matches" body="Change or clear the filters." />
        )
      ) : (
        <div className="grid gap-6">
          <div className="grid content-start gap-4">
            {!result.totalDocs ? (
              <Empty
                title="Nobody matches"
                body="Change or clear the filters (former employees show when you pick that status)."
              />
            ) : (
              <ul className="office-stagger grid content-start gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {result.docs.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/office/people/${e.id}`}
                      className="flex h-full items-start gap-3 rounded-2xl border border-subtle bg-surface p-4 shadow-1 transition-[border-color,translate] hover:-translate-y-0.5 hover:border-strong"
                    >
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent-soft font-semibold text-accent">
                        {e.name
                          .split(" ")
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{e.name}</span>
                        <span className="block truncate text-[0.8125rem] text-fg-secondary">
                          {e.jobTitle}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.75rem] text-fg-muted">
                          <Pill tone="blue">{titleCase(e.department)}</Pill>
                          {e.status !== "active" && (
                            <Pill tone={STATUS_TONE[e.status]}>{e.status}</Pill>
                          )}
                          <span>since {fmtDate(e.startDate)}</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Pagination
              path="/office/people"
              params={sp}
              page={result.page}
              totalPages={result.totalPages}
              totalDocs={result.totalDocs}
              limit={result.limit}
            />
          </div>
        </div>
      )}
    </div>
  );
}
