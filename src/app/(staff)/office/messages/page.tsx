import { sql } from "@payloadcms/db-postgres";
import Link from "next/link";
import type { Where } from "payload";
import { FilterBar } from "@/components/office/FilterBar";
import { timeAgo, titleCase } from "@/components/office/format";
import { Pagination } from "@/components/office/Pagination";
import { LayoutGrid, List } from "lucide-react";
import { CategoryCards, STAGE_COLORS } from "@/components/office/CategoryCards";
import { Kanban } from "@/components/office/Kanban";
import { Card, Empty, PageHeader, Pill, STATUS_TONE, btn } from "@/components/office/ui";
import { LEAD_STATUSES } from "@/collections/Leads";
import { leadCard } from "@/features/office/cards";
import { settings } from "@/lib/settings";
import { leadWhere, staffUsers } from "@/features/office/data";
import {
  dateRange,
  findPage,
  listHref,
  listParams,
  textSearch,
  type Params,
} from "@/features/office/query";
import { requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import type { Lead } from "@/payload-types";

export const metadata = { title: "Messages" };

const SORTS = { newest: "-createdAt", oldest: "createdAt", updated: "-updatedAt" };
/** Message wording for the lead stages. */
const COLUMN: Record<string, string> = {
  new: "Unread",
  contacted: "Replied",
  qualified: "In progress",
  proposal: "Waiting on them",
  won: "Resolved",
  lost: "Closed",
};
const STATE: Record<string, Where> = {
  unread: { status: { equals: "new" } },
  open: { status: { in: ["contacted", "qualified", "proposal"] } },
  closed: { status: { in: ["won", "lost"] } },
};

/** Contact-form messages for the other departments (academy, careers, press, support…). */
export default async function Messages({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await requireArea("messages");
  const sp = await searchParams;
  const board = sp.view !== "list";
  const { limit, page, sort } = listParams(sp, SORTS, "newest");
  const where: Where[] = [
    leadWhere("message"),
    ...textSearch(sp.q, ["name", "email", "company", "ref", "message"]),
    ...dateRange(sp),
  ];
  if (sp.dept) where.push({ department: { equals: sp.dept } });
  if (sp.state && STATE[sp.state]) where.push(STATE[sp.state]!);
  if (sp.owner === "me") where.push({ assignee: { equals: user.id } });
  else if (sp.owner === "none") where.push({ assignee: { exists: false } });
  else if (sp.owner) where.push({ assignee: { equals: Number(sp.owner) } });

  const p = await payload();
  const [result, users, counts] = await Promise.all([
    findPage<Lead>(user, "leads", {
      where,
      sort,
      page: board ? 1 : page,
      limit: board ? 300 : limit,
    }),
    staffUsers(),
    p.db.drizzle.execute(
      sql`select department as d, status, count(*)::int as n from leads where department <> 'sales' and coalesce(product, '') = '' group by 1, 2 order by 1`,
    ),
  ]);
  const rows = counts.rows as { d: string; status: string; n: number }[];
  const depts = [...new Set(rows.map((r) => r.d))];
  const segs = (d?: string) =>
    LEAD_STATUSES.map((st) => ({
      label: COLUMN[st]!,
      color: STAGE_COLORS[st] ?? "#94a3b8",
      value: rows.filter((r) => (!d || r.d === d) && r.status === st).reduce((a, r) => a + r.n, 0),
    }));
  const unread = (d?: string) =>
    rows.filter((r) => (!d || r.d === d) && r.status === "new").reduce((a, r) => a + r.n, 0);
  const tab = (d?: string) => listHref("/office/messages", { view: sp.view, dept: d });
  const viewHref = (view?: string) =>
    listHref("/office/messages", { ...sp, view, page: undefined });

  return (
    <div className="grid gap-5">
      <PageHeader
        title="Messages"
        subtitle="Contact-form messages for the Academy, careers, partnerships, press and support."
        actions={
          <Link href={viewHref(board ? "list" : undefined)} className={btn}>
            {board ? (
              <List className="size-4" aria-hidden />
            ) : (
              <LayoutGrid className="size-4" aria-hidden />
            )}
            {board ? "List" : "Board"}
          </Link>
        }
      />
      <CategoryCards
        items={[
          {
            key: "all",
            label: "All departments",
            href: tab(),
            active: !sp.dept,
            count: unread(),
            hint: "unread",
            segments: segs(),
          },
          ...depts.map((d) => ({
            key: d,
            label: titleCase(d),
            href: tab(d),
            active: sp.dept === d,
            count: unread(d),
            hint: "unread",
            segments: segs(d),
          })),
        ]}
      />
      <FilterBar
        keep={["dept", "view"]}
        fields={[
          { kind: "search", name: "q", placeholder: "Search name, email, message…" },
          {
            kind: "select",
            name: "state",
            label: "State",
            options: [
              { value: "unread", label: "Unread" },
              { value: "open", label: "In progress" },
              { value: "closed", label: "Closed" },
            ],
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
          { kind: "date", name: "from", label: "From" },
          { kind: "date", name: "to", label: "To" },
        ]}
        sorts={[
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
          { value: "updated", label: "Recently updated" },
        ]}
      />
      {!result.totalDocs ? (
        <Empty
          title="No messages match"
          body="Change or clear the filters. New contact-form messages appear here."
        />
      ) : board ? (
        <Kanban
          kind="lead"
          limit={(await settings()).boardLimit}
          moreHref={viewHref("list")}
          columns={LEAD_STATUSES.map((st) => ({ id: st, label: COLUMN[st]! }))}
          items={result.docs.map((l) => ({
            ...leadCard(l),
            subtitle: l.message?.slice(0, 80) ?? undefined,
            meta: [titleCase(l.department)],
          }))}
        />
      ) : (
        <>
          <Card pad={false}>
            <ul className="divide-y divide-[var(--border-subtle)]">
              {result.docs.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/office/requests/${l.id}`}
                    className="grid gap-1 px-5 py-3.5 hover:bg-[var(--bg-sunken)] sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
                  >
                    <span className={l.status === "new" ? "font-semibold" : "font-medium"}>
                      {l.name}
                      <span className="block text-[0.75rem] font-normal text-fg-muted">
                        {titleCase(l.department)}
                      </span>
                    </span>
                    <span className="truncate text-body-sm text-fg-secondary">{l.message}</span>
                    <span className="flex items-center gap-2 text-[0.8125rem] text-fg-muted">
                      <Pill tone={STATUS_TONE[l.status]}>
                        {l.status === "new" ? "unread" : l.status}
                      </Pill>
                      {timeAgo(l.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Pagination
            path="/office/messages"
            params={sp}
            page={result.page}
            totalPages={result.totalPages}
            totalDocs={result.totalDocs}
            limit={result.limit}
          />
        </>
      )}
    </div>
  );
}
