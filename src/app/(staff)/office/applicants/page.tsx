import { sql } from "@payloadcms/db-postgres";
import { Download, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import type { Where } from "payload";
import { FilterBar } from "@/components/office/FilterBar";
import { fmtDate, timeAgo, titleCase } from "@/components/office/format";
import { Kanban } from "@/components/office/Kanban";
import { Pagination } from "@/components/office/Pagination";
import { CategoryCards, STAGE_COLORS } from "@/components/office/CategoryCards";
import { Card, Empty, PageHeader, Pill, STATUS_TONE, btn } from "@/components/office/ui";
import { settings } from "@/lib/settings";
import {
  APPLICATION_STATUSES,
  APPLICATION_TYPES,
  applicationTypesFor,
} from "@/collections/Applications";
import { applicationCard } from "@/features/office/cards";
import { staffUsers } from "@/features/office/data";
import {
  dateRange,
  findPage,
  listHref,
  listParams,
  textSearch,
  type Params,
} from "@/features/office/query";
import { nowMs } from "@/lib/time/office-hours";
import { requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import type { Application } from "@/payload-types";

export const metadata = { title: "Applicants" };

const LABELS: Record<(typeof APPLICATION_TYPES)[number], string> = {
  academy: "Trainees",
  internship: "Interns",
  job: "Job applicants",
  partner: "Partners & agents",
  event: "Event sign-ups",
};
const STAGE: Record<string, string> = {
  received: "Received",
  review: "Under review",
  shortlisted: "Shortlisted",
  accepted: "Accepted",
  rejected: "Rejected",
  waitlisted: "Waitlisted",
};
const SORTS = {
  newest: "-createdAt",
  oldest: "createdAt",
  rating: "-rating",
  updated: "-updatedAt",
  name: "name",
};

export default async function Applicants({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await requireArea("applicants");
  const allowed = applicationTypesFor(user);
  const types = APPLICATION_TYPES.filter((t) => allowed === "all" || allowed.includes(t));
  const sp = await searchParams;
  const type = (types as readonly string[]).includes(sp.type ?? "")
    ? (sp.type as (typeof APPLICATION_TYPES)[number])
    : types[0];
  if (!type) return <Empty title="No applicant inboxes for your role" />;
  const list = sp.view === "list";
  const { limit, page, sort } = listParams(sp, SORTS, "newest");

  const where: Where[] = [
    { type: { equals: type } },
    ...textSearch(sp.q, ["name", "email", "ref", "subject"]),
    ...dateRange(sp),
  ];
  if (sp.stage) where.push({ status: { equals: sp.stage } });
  if (sp.subject) where.push({ subject: { equals: sp.subject } });
  if (sp.intake) where.push({ intake: { equals: Number(sp.intake) } });
  if (sp.opening) where.push({ opening: { equals: Number(sp.opening) } });
  if (sp.rating) where.push({ rating: { greater_than_equal: Number(sp.rating) } });
  if (sp.reviewer === "me") where.push({ assignee: { equals: user.id } });
  else if (sp.reviewer === "none") where.push({ assignee: { exists: false } });
  else if (sp.reviewer) where.push({ assignee: { equals: Number(sp.reviewer) } });
  if (sp.minor === "yes")
    where.push(
      { "consent.guardian": { exists: true } },
      { "consent.guardian": { not_equals: "" } },
    );

  const db = (await payload()).db.drizzle;
  const { boardLimit } = await settings();
  const [result, users, counts, subjects, intakes, openings] = await Promise.all([
    findPage<Application>(user, "applications", {
      where,
      sort,
      page: list ? page : 1,
      limit: list ? limit : 300,
    }),
    staffUsers(),
    db.execute(sql`select type, status, count(*)::int as n from applications group by 1, 2`),
    db.execute(
      sql`select distinct subject as s from applications where type = ${type} and coalesce(subject, '') <> '' order by 1 limit 60`,
    ),
    type === "academy"
      ? db.execute(sql`
          select i.id, p.title as program, i.start_date, i.capacity,
            (select count(*) from applications a where a.intake_id = i.id and a.status = 'accepted')::int as accepted,
            (select count(*) from applications a where a.intake_id = i.id and a.status in ('received','review','shortlisted'))::int as pending
          from intakes i join programs_locales p on p._parent_id = i.program_id and p._locale = 'en'
          order by i.start_date desc limit 12`)
      : Promise.resolve({ rows: [] }),
    db.execute(
      sql`select o.id, l.title from openings_locales l join openings o on o.id = l._parent_id where l._locale = 'en' and o.kind = ${type} order by o.created_at desc limit 40`,
    ),
  ]);
  const countRows = counts.rows as { type: string; status: string; n: number }[];
  const segs = (t: string) =>
    APPLICATION_STATUSES.map((st) => ({
      label: STAGE[st] ?? st,
      color: STAGE_COLORS[st] ?? "#94a3b8",
      value: countRows.find((r) => r.type === t && r.status === st)?.n ?? 0,
    }));
  const intakeRows = intakes.rows as {
    id: number;
    program: string;
    start_date: string;
    capacity: number;
    accepted: number;
    pending: number;
  }[];
  const recent = nowMs() - 30 * 86_400_000;
  const upcoming = intakeRows.filter((i) => new Date(i.start_date).getTime() > recent).slice(0, 6);
  const subjectLabel =
    type === "academy"
      ? "Program"
      : type === "job"
        ? "Role"
        : type === "event"
          ? "Event"
          : "Applied for";
  const base = `/office/applicants`;
  const href = (extra: Params) => listHref(base, { ...sp, ...extra, page: undefined });

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Applicants"
        subtitle="Drag applicants through the stages. Shortlisted, accepted, rejected and waitlisted send them an email in their language (switchable per applicant)."
        actions={
          <>
            <Link href={href({ view: list ? undefined : "list" })} className={btn}>
              {list ? (
                <LayoutGrid className="size-4" aria-hidden />
              ) : (
                <List className="size-4" aria-hidden />
              )}
              {list ? "Board" : "List"}
            </Link>
            <a
              href={`/api/staff/export/applications?type=${type}${sp.stage ? `&status=${sp.stage}` : ""}`}
              className={btn}
              download
            >
              <Download className="size-4" aria-hidden /> CSV
            </a>
          </>
        }
      />
      <CategoryCards
        items={types.map((t) => ({
          key: t,
          label: LABELS[t],
          href: `${base}?type=${t}${list ? "&view=list" : ""}`,
          active: t === type,
          count: countRows.find((r) => r.type === t && r.status === "received")?.n ?? 0,
          hint: "new · waiting for review",
          segments: segs(t),
        }))}
      />
      {type === "academy" && upcoming.length > 0 && (
        <Card title="Upcoming intakes">
          <ul className="office-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((i) => (
              <li key={i.id}>
                <Link
                  href={href({ intake: String(i.id) })}
                  className="block rounded-xl border border-subtle p-4 transition-colors hover:border-strong"
                >
                  <p className="font-medium">{i.program}</p>
                  <p className="text-[0.8125rem] text-fg-muted">Starts {fmtDate(i.start_date)}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--bg-sunken)]">
                    <div
                      className="office-bar h-full rounded-full bg-accent"
                      style={{ width: `${Math.min(100, (i.accepted / i.capacity) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[0.8125rem] text-fg-secondary">
                    {i.accepted} of {i.capacity} seats filled · {i.pending} in review
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <FilterBar
        keep={["type", "view"]}
        fields={[
          { kind: "search", name: "q", placeholder: "Search name, email, ref…" },
          {
            kind: "select",
            name: "stage",
            label: "Stage",
            options: APPLICATION_STATUSES.map((s) => ({ value: s, label: STAGE[s] ?? s })),
          },
          {
            kind: "select",
            name: "subject",
            label: subjectLabel,
            options: (subjects.rows as { s: string }[]).map((r) => ({ value: r.s, label: r.s })),
          },
          ...(type === "academy"
            ? [
                {
                  kind: "select" as const,
                  name: "intake",
                  label: "Intake",
                  options: intakeRows.map((i) => ({
                    value: String(i.id),
                    label: `${i.program} · ${fmtDate(i.start_date)}`,
                  })),
                },
              ]
            : []),
          ...((openings.rows as unknown[]).length
            ? [
                {
                  kind: "select" as const,
                  name: "opening",
                  label: "Opening",
                  options: (openings.rows as { id: number; title: string }[]).map((o) => ({
                    value: String(o.id),
                    label: o.title,
                  })),
                },
              ]
            : []),
          {
            kind: "select",
            name: "rating",
            label: "Score",
            options: [5, 4, 3].map((n) => ({
              value: String(n),
              label: n === 5 ? "★★★★★" : `${"★".repeat(n)} and up`,
            })),
          },
          {
            kind: "select",
            name: "reviewer",
            label: "Reviewer",
            options: [
              { value: "me", label: "Me" },
              { value: "none", label: "Unassigned" },
              ...users.map((u) => ({ value: String(u.id), label: u.name })),
            ],
          },
          ...(type === "academy" || type === "internship" || type === "event"
            ? [
                {
                  kind: "select" as const,
                  name: "minor",
                  label: "Under 18",
                  options: [{ value: "yes", label: "Under 18 only" }],
                },
              ]
            : []),
          { kind: "date", name: "from", label: "From" },
          { kind: "date", name: "to", label: "To" },
        ]}
        sorts={[
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
          { value: "rating", label: "Highest score" },
          { value: "updated", label: "Recently updated" },
          { value: "name", label: "Name A–Z" },
        ]}
        perPage={list}
      />
      {!result.totalDocs ? (
        <Empty
          title={`No ${LABELS[type].toLowerCase()} match`}
          body="Change or clear the filters."
        />
      ) : list ? (
        <>
          <Card pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] text-left text-body-sm">
                <thead className="text-[0.75rem] text-fg-muted uppercase">
                  <tr className="border-b border-subtle">
                    {["Ref", "Applicant", subjectLabel, "Score", "Stage", "Applied"].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {result.docs.map((a) => (
                    <tr key={a.id} className="hover:bg-[var(--bg-sunken)]">
                      <td className="px-4 py-2.5 font-mono text-[0.75rem]">{a.ref}</td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/office/applicants/${a.id}`}
                          className="font-medium hover:text-accent"
                        >
                          {a.name}
                        </Link>
                        <span className="block text-[0.8125rem] text-fg-muted">{a.email}</span>
                      </td>
                      <td className="px-4 py-2.5 text-fg-secondary">
                        {a.subject || titleCase(a.type)}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--accent-spark-text)]">
                        {a.rating ? "★".repeat(a.rating) : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <Pill tone={STATUS_TONE[a.status]}>{STAGE[a.status] ?? a.status}</Pill>
                      </td>
                      <td className="px-4 py-2.5 text-fg-muted">{timeAgo(a.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination
            path={base}
            params={sp}
            page={result.page}
            totalPages={result.totalPages}
            totalDocs={result.totalDocs}
            limit={result.limit}
          />
        </>
      ) : (
        <Kanban
          kind="application"
          moreHref={href({ view: "list" })}
          limit={boardLimit}
          columns={APPLICATION_STATUSES.map((s) => ({ id: s, label: STAGE[s] ?? s }))}
          items={result.docs.map(applicationCard)}
        />
      )}
    </div>
  );
}
