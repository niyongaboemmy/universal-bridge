import { sql } from "@payloadcms/db-postgres";
import { nowMs } from "@/lib/time/office-hours";
import { Columns3, LayoutGrid, Plus } from "lucide-react";
import { CategoryCards, STAGE_COLORS } from "@/components/office/CategoryCards";
import { Kanban } from "@/components/office/Kanban";
import { projectCard } from "@/features/office/cards";
import { settings } from "@/lib/settings";
import Link from "next/link";
import { fmtDate, titleCase } from "@/components/office/format";
import {
  Card,
  Empty,
  PageHeader,
  Pill,
  STATUS_TONE,
  btn,
  btnPrimary,
} from "@/components/office/ui";
import type { Where } from "payload";
import { FilterBar } from "@/components/office/FilterBar";
import { Pagination } from "@/components/office/Pagination";
import { PROJECT_STATUSES } from "@/collections/Company";
import { listEmployees } from "@/features/office/data";
import { findPage, listHref, listParams, textSearch, type Params } from "@/features/office/query";
import type { Project } from "@/payload-types";
import { allowed, requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import { cn } from "@/lib/utils";

export const metadata = { title: "Projects & tools" };

const KINDS = {
  client: "Client projects",
  "internal-tool": "Internal tools",
  product: "Products",
} as const;

const SORTS = {
  due: "dueDate",
  newest: "-createdAt",
  progress: "progress",
  name: "name",
  updated: "-updatedAt",
};

export default async function Projects({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await requireArea("projects");
  const sp = await searchParams;
  const kind = sp.kind;
  const board = sp.view !== "cards";
  const { limit, page, sort } = listParams({ ...sp, per: sp.per ?? "24" }, SORTS, "due");
  const p = await payload();
  const where: Where[] = [...textSearch(sp.q, ["name", "client", "code", "summary"])];
  if (kind) where.push({ kind: { equals: kind } });
  // Finished work is hidden unless a status is picked.
  if (sp.status) where.push({ status: { equals: sp.status } });
  else if (!board) where.push({ status: { not_in: ["done", "cancelled"] } });
  if (sp.health) where.push({ health: { equals: sp.health } });
  if (sp.owner) where.push({ owner: { equals: Number(sp.owner) } });
  const today = new Date(nowMs());
  if (sp.due === "overdue") where.push({ dueDate: { less_than: today.toISOString() } });
  else if (sp.due === "soon")
    where.push(
      { dueDate: { greater_than_equal: today.toISOString() } },
      { dueDate: { less_than: new Date(today.getTime() + 30 * 86_400_000).toISOString() } },
    );
  else if (sp.due === "none") where.push({ dueDate: { exists: false } });

  const [result, kinds, employees, products] = await Promise.all([
    findPage<Project>(user, "projects", {
      where,
      sort,
      page: board ? 1 : page,
      limit: board ? 300 : limit,
    }),
    p.db.drizzle.execute(sql`select kind, status, count(*)::int as n from projects group by 1, 2`),
    listEmployees(user).catch(() => []),
    p.db.drizzle.execute(sql`
      select pr.slug, pr.name, pr.status,
        (select count(*) from leads l where l.product = pr.slug)::int as demos,
        (select count(*) from leads l where l.product = pr.slug and l.created_at > now() - interval '30 days')::int as demos_30
      from products pr order by pr.name`),
  ]);
  const list = result.docs;
  const kindRows = kinds.rows as { kind: string; status: string; n: number }[];
  const segments = (k?: string) =>
    PROJECT_STATUSES.map((st) => ({
      label: st,
      color: STAGE_COLORS[st] ?? "#94a3b8",
      value: kindRows
        .filter((r) => (!k || r.kind === k) && r.status === st)
        .reduce((a, r) => a + r.n, 0),
    }));
  const live = (k?: string) =>
    kindRows
      .filter((r) => (!k || r.kind === k) && !["done", "cancelled"].includes(r.status))
      .reduce((a, r) => a + r.n, 0);
  const viewHref = (view?: string) =>
    listHref("/office/projects", { ...sp, view, page: undefined });
  const now = nowMs();
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Projects & tools"
        subtitle="Client delivery, internal tools and UB products: who's on what, how far along, and what's at risk."
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
            {allowed(user, "projects.manage") && (
              <Link href="/office/projects/new" className={btnPrimary}>
                <Plus className="size-4" aria-hidden /> New project
              </Link>
            )}
          </>
        }
      />
      <CategoryCards
        cols={4}
        items={[
          {
            key: "all",
            label: "All work",
            href: listHref("/office/projects", { view: sp.view }),
            active: !kind,
            count: live(),
            hint: "in progress",
            segments: segments(),
          },
          ...Object.entries(KINDS).map(([k, l]) => ({
            key: k,
            label: l,
            href: listHref("/office/projects", { view: sp.view, kind: k }),
            active: kind === k,
            count: live(k),
            hint: "in progress",
            segments: segments(k),
          })),
        ]}
      />
      <FilterBar
        keep={["kind", "view"]}
        fields={[
          { kind: "search", name: "q", placeholder: "Search name, client, code…" },
          {
            kind: "select",
            name: "status",
            label: "Status",
            options: PROJECT_STATUSES.map((v) => ({ value: v, label: titleCase(v) })),
          },
          {
            kind: "select",
            name: "health",
            label: "Health",
            options: [
              { value: "on-track", label: "On track" },
              { value: "at-risk", label: "At risk" },
              { value: "off-track", label: "Off track" },
            ],
          },
          {
            kind: "select",
            name: "owner",
            label: "Lead",
            options: employees.map((e) => ({ value: String(e.id), label: e.name })),
          },
          {
            kind: "select",
            name: "due",
            label: "Due",
            options: [
              { value: "overdue", label: "Overdue" },
              { value: "soon", label: "Next 30 days" },
              { value: "none", label: "No due date" },
            ],
          },
        ]}
        sorts={[
          { value: "due", label: "Due soonest" },
          { value: "newest", label: "Newest" },
          { value: "progress", label: "Least progress" },
          { value: "updated", label: "Recently updated" },
          { value: "name", label: "Name A–Z" },
        ]}
      />
      {!list.length ? (
        <Empty
          title="No projects match"
          body="Change or clear the filters (finished projects show when you pick a status), create one, or start one from a won service request."
        />
      ) : board ? (
        <Kanban
          kind="project"
          limit={(await settings()).boardLimit}
          moreHref={viewHref("cards")}
          columns={PROJECT_STATUSES.map((st) => ({ id: st, label: st }))}
          items={list.map(projectCard)}
        />
      ) : (
        <ul className="office-stagger grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {list.map((pr) => {
            const overdue =
              pr.dueDate &&
              new Date(pr.dueDate).getTime() < now &&
              !["done", "cancelled"].includes(pr.status);
            const team = (pr.team ?? []).filter((t) => typeof t === "object");
            const milestones = pr.milestones ?? [];
            return (
              <li key={pr.id}>
                <Link
                  href={`/office/projects/${pr.id}`}
                  className="group block h-full rounded-2xl border border-subtle bg-surface p-5 shadow-1 transition-[translate,box-shadow,border-color] hover:-translate-y-0.5 hover:border-strong hover:shadow-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-fg-muted uppercase">
                        {pr.code || titleCase(pr.kind)} {pr.client ? `· ${pr.client}` : ""}
                      </p>
                      <h3 className="mt-1 truncate font-display text-heading-md group-hover:text-accent">
                        {pr.name}
                      </h3>
                    </div>
                    <Pill tone={STATUS_TONE[pr.health]}>{pr.health.replace("-", " ")}</Pill>
                  </div>
                  {pr.summary && (
                    <p className="mt-2 line-clamp-2 text-body-sm text-fg-secondary">{pr.summary}</p>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-sunken)]">
                      <div
                        className="office-bar h-full rounded-full bg-[linear-gradient(90deg,var(--accent-primary),var(--accent-spark))]"
                        style={{ width: `${pr.progress ?? 0}%` }}
                      />
                    </div>
                    <span className="text-[0.8125rem] font-medium tabular-nums">
                      {pr.progress ?? 0}%
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-[0.8125rem]">
                    <span className="flex -space-x-2">
                      {team.slice(0, 5).map((t) => (
                        <span
                          key={t.id}
                          title={t.name}
                          className="grid size-7 place-items-center rounded-full border-2 border-[var(--bg-surface)] bg-accent-soft text-[0.6875rem] font-semibold text-accent"
                        >
                          {t.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                      ))}
                    </span>
                    <span className={cn("text-fg-muted", overdue && "font-medium text-danger")}>
                      <Pill tone={STATUS_TONE[pr.status]}>{pr.status}</Pill>{" "}
                      {pr.dueDate ? `${overdue ? "overdue · " : "due "}${fmtDate(pr.dueDate)}` : ""}
                      {milestones.length
                        ? ` · ${milestones.filter((m) => m.done).length}/${milestones.length}`
                        : ""}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {!board && (
        <Pagination
          path="/office/projects"
          params={sp}
          page={result.page}
          totalPages={result.totalPages}
          totalDocs={result.totalDocs}
          limit={result.limit}
        />
      )}
      <Card title="Products & demand">
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(
            products.rows as {
              slug: string;
              name: string;
              status: string;
              demos: number;
              demos_30: number;
            }[]
          ).map((pr) => (
            <li key={pr.slug} className="rounded-xl border border-subtle p-4">
              <p className="font-medium">{pr.name}</p>
              <p className="text-[0.8125rem] text-fg-muted">{titleCase(pr.status)}</p>
              <p className="mt-2 text-body-sm">
                <span className="font-display text-heading-md">{pr.demos_30}</span>{" "}
                <span className="text-fg-secondary">demo requests in 30 days</span>
              </p>
              <Link href="/office/demos" className="text-[0.8125rem] text-accent">
                {pr.demos} in total →
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
