import { sql } from "@payloadcms/db-postgres";
import { Download, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import type { Where } from "payload";
import { FilterBar } from "@/components/office/FilterBar";
import { fmtMoney, timeAgo, titleCase } from "@/components/office/format";
import { CategoryCards, STAGE_COLORS } from "@/components/office/CategoryCards";
import { Kanban } from "@/components/office/Kanban";
import { Pagination } from "@/components/office/Pagination";
import { Card, Empty, PageHeader, Pill, STATUS_TONE, btn } from "@/components/office/ui";
import { LEAD_STATUSES } from "@/collections/Leads";
import { leadCard } from "@/features/office/cards";
import { leadWhere, staffUsers } from "@/features/office/data";
import {
  dateRange,
  findPage,
  listHref,
  leadIdsWithService,
  listParams,
  textSearch,
  type Params,
} from "@/features/office/query";
import { requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import { settings } from "@/lib/settings";
import type { Lead } from "@/payload-types";

export const metadata = { title: "Service requests" };

const SORTS = {
  newest: "-createdAt",
  oldest: "createdAt",
  value: "-value",
  followup: "nextFollowUpAt",
  updated: "-updatedAt",
};

export default async function Requests({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await requireArea("requests");
  const sp = await searchParams;
  const list = sp.view === "list";
  const { limit, page, sort } = listParams(sp, SORTS, "newest");
  const p = await payload();

  const where: Where[] = [
    leadWhere("service"),
    ...textSearch(sp.q, ["name", "email", "company", "ref", "message"]),
    ...dateRange(sp),
  ];
  if (sp.stage) where.push({ status: { equals: sp.stage } });
  if (sp.owner === "me") where.push({ assignee: { equals: user.id } });
  else if (sp.owner === "none") where.push({ assignee: { exists: false } });
  else if (sp.owner) where.push({ assignee: { equals: Number(sp.owner) } });
  if (sp.budget) where.push({ budgetRange: { equals: sp.budget } });
  if (sp.service) where.push({ id: { in: await leadIdsWithService(sp.service) } });
  const now = new Date();
  if (sp.followup === "overdue")
    where.push(
      { nextFollowUpAt: { less_than: now.toISOString() } },
      { status: { not_in: ["won", "lost"] } },
    );
  else if (sp.followup === "week")
    where.push(
      { nextFollowUpAt: { greater_than_equal: now.toISOString() } },
      { nextFollowUpAt: { less_than: new Date(now.getTime() + 7 * 86_400_000).toISOString() } },
    );
  else if (sp.followup === "none") where.push({ nextFollowUpAt: { exists: false } });

  const [result, users, services, budgets, pipeline, bySvc, s] = await Promise.all([
    // The board shows every stage (most recent 300); the list is paginated.
    findPage<Lead>(user, "leads", {
      where,
      sort,
      page: list ? page : 1,
      limit: list ? limit : 300,
    }),
    staffUsers(),
    p.find({
      collection: "services",
      limit: 50,
      depth: 0,
      sort: "order",
      select: { slug: true, title: true } as never,
    }),
    p.db.drizzle.execute(
      sql`select distinct budget_range as b from leads where budget_range is not null and budget_range <> '' order by 1`,
    ),
    p.db.drizzle.execute(
      sql`select coalesce(sum(value), 0)::float as v, count(*)::int as n from leads where department = 'sales' and coalesce(product, '') = '' and status not in ('won','lost')`,
    ),
    p.db.drizzle.execute(sql`
      select coalesce(svc, '') as svc, l.status, count(*)::int as n
      from leads l left join lateral jsonb_array_elements_text(coalesce(l.services, '[]'::jsonb)) svc on true
      where l.department = 'sales' and coalesce(l.product, '') = ''
      group by 1, 2`),
    settings(),
  ]);
  const svcRows = bySvc.rows as { svc: string; status: string; n: number }[];
  const segs = (k?: string) =>
    LEAD_STATUSES.map((st) => ({
      label: st,
      color: STAGE_COLORS[st] ?? "#94a3b8",
      value: svcRows
        .filter((r) => (k ? r.svc === k : true) && r.status === st)
        .reduce((a, r) => a + r.n, 0),
    }));
  const openOf = (k?: string) =>
    svcRows
      .filter((r) => (k ? r.svc === k : true) && !["won", "lost"].includes(r.status))
      .reduce((a, r) => a + r.n, 0);
  const { v: openValue, n: openCount } = pipeline.rows[0] as { v: number; n: number };
  const exportQs = new URLSearchParams(
    Object.entries({ status: sp.stage, from: sp.from, to: sp.to }).filter(([, v]) => v) as [
      string,
      string,
    ][],
  );
  const viewHref = (view?: string) =>
    listHref("/office/requests", { ...sp, view, page: undefined });

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Service requests"
        subtitle={`${openCount} open · ${fmtMoney(openValue)} estimated pipeline. Drag a card to move it through the stages.`}
        actions={
          <>
            <Link href={viewHref(list ? undefined : "list")} className={btn}>
              {list ? (
                <LayoutGrid className="size-4" aria-hidden />
              ) : (
                <List className="size-4" aria-hidden />
              )}
              {list ? "Board" : "List"}
            </Link>
            <a
              href={`/api/staff/export/leads${exportQs.size ? `?${exportQs}` : ""}`}
              className={btn}
              download
            >
              <Download className="size-4" aria-hidden /> CSV
            </a>
          </>
        }
      />
      <CategoryCards
        items={[
          {
            key: "all",
            label: "All services",
            href: listHref("/office/requests", { view: sp.view }),
            active: !sp.service,
            count: openOf(),
            hint: "open requests",
            segments: segs(),
          },
          ...(services.docs as { slug: string; title: string }[])
            .map((sv) => ({
              key: sv.slug,
              label: sv.title,
              href: listHref("/office/requests", { view: sp.view, service: sv.slug }),
              active: sp.service === sv.slug,
              count: openOf(sv.slug),
              hint: "open requests",
              segments: segs(sv.slug),
            }))
            .sort((a, b) => b.count - a.count),
        ]}
      />
      <FilterBar
        keep={["service", "view"]}
        fields={[
          { kind: "search", name: "q", placeholder: "Search name, company, ref, message…" },
          {
            kind: "select",
            name: "stage",
            label: "Stage",
            options: LEAD_STATUSES.map((s) => ({ value: s, label: titleCase(s) })),
          },
          {
            kind: "select",
            name: "owner",
            label: "Owner",
            options: [
              { value: "me", label: "Me" },
              { value: "none", label: "Unassigned" },
              ...users.map((u) => ({ value: String(u.id), label: u.name })),
            ],
          },
          {
            kind: "select",
            name: "service",
            label: "Service",
            options: (services.docs as { slug: string; title: string }[]).map((s) => ({
              value: s.slug,
              label: s.title,
            })),
          },
          {
            kind: "select",
            name: "budget",
            label: "Budget",
            options: (budgets.rows as { b: string }[]).map((r) => ({
              value: r.b,
              label: r.b.replace("to", "–"),
            })),
          },
          {
            kind: "select",
            name: "followup",
            label: "Follow-up",
            options: [
              { value: "overdue", label: "Overdue" },
              { value: "week", label: "Due this week" },
              { value: "none", label: "Not scheduled" },
            ],
          },
          { kind: "date", name: "from", label: "From" },
          { kind: "date", name: "to", label: "To" },
        ]}
        sorts={[
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
          { value: "value", label: "Highest value" },
          { value: "followup", label: "Follow-up soonest" },
          { value: "updated", label: "Recently updated" },
        ]}
        perPage={list}
      />
      {!result.totalDocs ? (
        <Empty
          title="No requests match"
          body="Change or clear the filters. New requests from the contact form's “Start a project” arrive here."
        />
      ) : list ? (
        <>
          <Card pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[46rem] text-left text-body-sm">
                <thead className="text-[0.75rem] text-fg-muted uppercase">
                  <tr className="border-b border-subtle">
                    {["Ref", "Who", "Services", "Budget", "Value", "Stage", "Received"].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {result.docs.map((l) => (
                    <tr key={l.id} className="hover:bg-[var(--bg-sunken)]">
                      <td className="px-4 py-2.5 font-mono text-[0.75rem]">
                        <Link href={`/office/requests/${l.id}`} className="hover:text-accent">
                          {l.ref}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/office/requests/${l.id}`}
                          className="font-medium hover:text-accent"
                        >
                          {l.name}
                        </Link>
                        <span className="block text-[0.8125rem] text-fg-muted">
                          {l.company || l.email}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-fg-secondary">
                        {Array.isArray(l.services)
                          ? (l.services as string[]).map(titleCase).join(", ")
                          : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-fg-secondary">{l.budgetRange || "—"}</td>
                      <td className="px-4 py-2.5">
                        {l.value ? fmtMoney(l.value, l.currency ?? "RWF") : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <Pill tone={STATUS_TONE[l.status]}>{l.status}</Pill>
                      </td>
                      <td className="px-4 py-2.5 text-fg-muted">{timeAgo(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination
            path="/office/requests"
            params={sp}
            page={result.page}
            totalPages={result.totalPages}
            totalDocs={result.totalDocs}
            limit={result.limit}
          />
        </>
      ) : (
        <>
          <Kanban
            kind="lead"
            moreHref={viewHref("list")}
            limit={s.boardLimit}
            columns={LEAD_STATUSES.map((st) => ({ id: st, label: st }))}
            items={result.docs.map((l) => leadCard(l, s.responseHours))}
          />
          {result.totalDocs > 300 && (
            <p className="text-[0.8125rem] text-fg-muted">
              The board shows the 300 most recent matches; use the list view or filters for the
              rest.
            </p>
          )}
        </>
      )}
    </div>
  );
}
