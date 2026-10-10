import { sql } from "@payloadcms/db-postgres";
import {
  Briefcase,
  CalendarClock,
  CalendarDays,
  DoorOpen,
  GraduationCap,
  Handshake,
  LayoutGrid,
  List,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { Where } from "payload";
import type { ReactNode } from "react";
import { FilterBar } from "@/components/office/FilterBar";
import { fmtDate, titleCase } from "@/components/office/format";
import { Kanban } from "@/components/office/Kanban";
import { Pagination } from "@/components/office/Pagination";
import { Card, Empty, PageHeader, Pill, Stat, btn, btnPrimary } from "@/components/office/ui";
import { APPLICATION_TYPES } from "@/collections/Applications";
import { OPENING_STATUSES } from "@/collections/Openings";
import { openingCard, type OpeningStats } from "@/features/office/cards";
import { findPage, listHref, listParams, textSearch, type Params } from "@/features/office/query";
import { allowed, requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import { settings } from "@/lib/settings";
import { nowMs } from "@/lib/time/office-hours";
import { cn } from "@/lib/utils";
import type { Opening } from "@/payload-types";

export const metadata = { title: "Openings" };

const KINDS: Record<
  (typeof APPLICATION_TYPES)[number],
  { label: string; icon: ReactNode; color: string }
> = {
  academy: { label: "Academy intakes", icon: <GraduationCap />, color: "#0145b8" },
  internship: { label: "Internships", icon: <Sparkles />, color: "#7a4de0" },
  job: { label: "Jobs", icon: <Briefcase />, color: "#0f8a6a" },
  partner: { label: "Partners & agents", icon: <Handshake />, color: "#b7791f" },
  event: { label: "Events", icon: <CalendarDays />, color: "#fe760d" },
};
const STATUS_COLOR: Record<string, string> = {
  draft: "#94a3b8",
  open: "#0f8a6a",
  paused: "#f59e0b",
  closed: "#64748b",
};
const SORTS = { closing: "closesAt", newest: "-createdAt", title: "title", updated: "-updatedAt" };

/** Openings: what people can apply to. Dashboard → kind → status board. */
export default async function Openings({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await requireArea("openings");
  const sp = await searchParams;
  const list = sp.view === "list";
  const { limit, page, sort } = listParams(sp, SORTS, "closing");
  const where: Where[] = [...textSearch(sp.q, ["title", "slug", "location"])];
  if (sp.kind) where.push({ kind: { equals: sp.kind } });
  if (sp.mode) where.push({ mode: { equals: sp.mode } });
  if (sp.status) where.push({ status: { equals: sp.status } });

  const db = (await payload()).db.drizzle;
  const [result, perOpening, kinds, totals, s] = await Promise.all([
    findPage<Opening>(user, "openings", {
      where,
      sort,
      page: list ? page : 1,
      limit: list ? limit : 300,
      depth: 0,
    }),
    db.execute(sql`
      select opening_id as id, count(*)::int as applications,
        count(*) filter (where status = 'accepted')::int as accepted,
        count(*) filter (where status in ('received','review'))::int as pending
      from applications where opening_id is not null group by 1`),
    db.execute(sql`select kind, status, count(*)::int as n from openings group by 1, 2`),
    db.execute(sql`
      select
        count(*) filter (where status = 'open' and (closes_at is null or closes_at > now()))::int as open,
        count(*) filter (where status = 'open' and closes_at between now() and now() + interval '7 days')::int as closing,
        (select count(*) from applications where opening_id is not null and created_at > now() - interval '30 days')::int as applied,
        coalesce(sum(seats) filter (where status in ('open','closed')), 0)::int as seats,
        (select count(*) from applications a join openings o on o.id = a.opening_id where a.status = 'accepted' and o.status in ('open','closed'))::int as accepted
      from openings`),
    settings(),
  ]);
  const stats = new Map(
    (perOpening.rows as (OpeningStats & { id: number })[]).map((r) => [r.id, r]),
  );
  const t = totals.rows[0] as {
    open: number;
    closing: number;
    applied: number;
    seats: number;
    accepted: number;
  };
  const byKind = new Map<string, Record<string, number>>();
  for (const r of kinds.rows as { kind: string; status: string; n: number }[]) {
    if (!byKind.has(r.kind)) byKind.set(r.kind, {});
    byKind.get(r.kind)![r.status] = r.n;
  }
  const now = nowMs();
  const href = (extra: Params) =>
    listHref("/office/openings", { ...sp, ...extra, page: undefined });
  const canManage = allowed(user, "openings.manage");

  return (
    <div className="office-page grid gap-5">
      <PageHeader
        title="Openings"
        subtitle="Intakes, internships, jobs, partner programmes and events people can apply to."
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
            {canManage && (
              <Link href="/office/openings/new" className={btnPrimary}>
                <Plus className="size-4" aria-hidden /> New opening
              </Link>
            )}
          </>
        }
      />
      <div className="office-stagger grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat
          label="Open now"
          value={t.open}
          icon={<DoorOpen />}
          tone="good"
          href={href({ status: "open" })}
        />
        <Stat
          label="Closing within 7 days"
          value={t.closing}
          icon={<CalendarClock />}
          tone={t.closing ? "warn" : "neutral"}
        />
        <Stat label="Applications · 30 days" value={t.applied} icon={<Users />} />
        <Stat
          label="Seats filled"
          value={t.seats ? `${Math.round((t.accepted / t.seats) * 100)}%` : "—"}
          hint={t.seats ? `${t.accepted} of ${t.seats}` : "no seat limits"}
        />
      </div>

      <ul className="office-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {APPLICATION_TYPES.map((k) => {
          const counts = byKind.get(k) ?? {};
          const total = Object.values(counts).reduce((a, b) => a + b, 0);
          const active = sp.kind === k;
          return (
            <li key={k}>
              <Link
                href={href({ kind: active ? undefined : k })}
                aria-current={active}
                className={cn(
                  "block h-full rounded-2xl border border-subtle bg-surface p-4 shadow-1 transition-[translate,border-color,box-shadow] hover:-translate-y-0.5 hover:shadow-2",
                  active && "border-transparent ring-2",
                )}
                style={active ? { ["--tw-ring-color" as string]: KINDS[k].color } : undefined}
              >
                <span className="flex items-center justify-between">
                  <span
                    className="grid size-9 place-items-center rounded-xl text-white [&_svg]:size-4.5"
                    style={{ background: KINDS[k].color }}
                  >
                    {KINDS[k].icon}
                  </span>
                  <span className="font-display text-heading-lg tabular-nums">
                    {counts.open ?? 0}
                  </span>
                </span>
                <span className="mt-3 block font-medium">{KINDS[k].label}</span>
                <span className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-[var(--bg-sunken)]">
                  {OPENING_STATUSES.map((st) =>
                    counts[st] ? (
                      <span
                        key={st}
                        className="office-bar h-full"
                        style={{
                          width: `${(counts[st] / total) * 100}%`,
                          background: STATUS_COLOR[st],
                        }}
                        title={`${counts[st]} ${st}`}
                      />
                    ) : null,
                  )}
                </span>
                <span className="mt-1.5 block text-[0.75rem] text-fg-muted">
                  {total ? `${counts.open ?? 0} open · ${total} in all` : "None yet"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <FilterBar
        keep={["kind", "view"]}
        fields={[
          { kind: "search", name: "q", placeholder: "Search title or location…" },
          {
            kind: "select",
            name: "status",
            label: "Status",
            options: OPENING_STATUSES.map((s) => ({ value: s, label: titleCase(s) })),
          },
          {
            kind: "select",
            name: "mode",
            label: "Where",
            options: ["onsite", "remote", "hybrid"].map((m) => ({ value: m, label: titleCase(m) })),
          },
        ]}
        sorts={[
          { value: "closing", label: "Closing soonest" },
          { value: "newest", label: "Newest" },
          { value: "updated", label: "Recently updated" },
          { value: "title", label: "Title A–Z" },
        ]}
        perPage={list}
      />

      {!result.totalDocs ? (
        <Empty
          title="No openings yet"
          body={
            canManage
              ? "Create the first one: it gets its own page and application form on the website."
              : "Nothing matches the filters."
          }
        />
      ) : list ? (
        <>
          <Card pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[44rem] text-left text-body-sm">
                <thead className="text-[0.75rem] text-fg-muted uppercase">
                  <tr className="border-b border-subtle">
                    {["Opening", "Kind", "Status", "Closes", "Applied", "Seats"].map((h) => (
                      <th key={h} className="px-4 py-2.5 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {result.docs.map((o) => {
                    const st = stats.get(o.id);
                    return (
                      <tr key={o.id} className="hover:bg-[var(--bg-sunken)]">
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/office/openings/${o.id}`}
                            className="font-medium hover:text-accent"
                          >
                            {o.title}
                          </Link>
                          <span className="block text-[0.75rem] text-fg-muted">/{o.slug}</span>
                        </td>
                        <td className="px-4 py-2.5 text-fg-secondary">{KINDS[o.kind].label}</td>
                        <td className="px-4 py-2.5">
                          <Pill
                            tone={
                              o.status === "open"
                                ? "green"
                                : o.status === "paused"
                                  ? "orange"
                                  : "neutral"
                            }
                          >
                            {o.status}
                          </Pill>
                        </td>
                        <td className="px-4 py-2.5 text-fg-secondary">
                          {o.closesAt ? fmtDate(o.closesAt) : "—"}
                        </td>
                        <td className="px-4 py-2.5 tabular-nums">{st?.applications ?? 0}</td>
                        <td className="px-4 py-2.5 tabular-nums">
                          {o.seats ? `${st?.accepted ?? 0}/${o.seats}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination
            path="/office/openings"
            params={sp}
            page={result.page}
            totalPages={result.totalPages}
            totalDocs={result.totalDocs}
            limit={result.limit}
          />
        </>
      ) : (
        <Kanban
          kind="opening"
          limit={s.boardLimit}
          moreHref={href({ view: "list" })}
          columns={OPENING_STATUSES.map((st) => ({ id: st, label: st }))}
          items={result.docs.map((o) => openingCard(o, stats.get(o.id), now))}
        />
      )}
    </div>
  );
}
