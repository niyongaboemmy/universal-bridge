import { Activity, Download, LogIn, TriangleAlert, Users } from "lucide-react";
import Link from "next/link";
import { LazyAreaChart as AreaChart } from "@/components/office/lazy";
import { FilterBar } from "@/components/office/FilterBar";
import { titleCase } from "@/components/office/format";
import { LogTimeline } from "@/components/office/LogTimeline";
import { Pagination } from "@/components/office/Pagination";
import { BarList, Card, Empty, PageHeader, Stat, btn } from "@/components/office/ui";
import { staffUsers } from "@/features/office/data";
import { entityName, LOG_CATEGORIES, type LogCategory } from "@/features/office/logs";
import { avatarsFor, filtersFrom, listLogs, logStats } from "@/features/office/logs-data";
import { listHref, type Params } from "@/features/office/query";
import { requireArea } from "@/features/office/session";
import { nowMs } from "@/lib/time/office-hours";

export const metadata = { title: "System logs" };

const ENTITIES = [
  "leads",
  "applications",
  "openings",
  "projects",
  "employees",
  "users",
  "members",
  "roles",
  "pages",
  "certificates",
  "system-settings",
  "privacy",
];

/** Who did what, to which record, and when — readable, filterable, exportable. */
export default async function Logs({ searchParams }: { searchParams: Promise<Params> }) {
  await requireArea("audit");
  const sp = await searchParams;
  const f = filtersFrom(sp);
  const page = Math.max(1, Number(sp.page) || 1);
  const [list, stats, users] = await Promise.all([listLogs(f, page), logStats(f), staffUsers()]);
  const avatars = await avatarsFor(list.entries.map((e) => e.actorId));
  const href = (extra: Params) => listHref("/office/logs", { ...sp, ...extra, page: undefined });
  const exportQs = new URLSearchParams(
    Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][],
  );
  const t = stats.totals;
  const now = nowMs();

  return (
    <div className="office-page grid gap-5">
      <PageHeader
        title="System logs"
        subtitle="Every sign-in, change, export and submission: who did it, to which record, and when."
        actions={
          <a
            href={`/api/office/logs${exportQs.size ? `?${exportQs}` : ""}`}
            className={btn}
            download
          >
            <Download className="size-4" aria-hidden /> CSV
          </a>
        }
      />
      <div className="office-stagger grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Today" value={t.today} icon={<Activity />} hint={`${t.week} this week`} />
        <Stat label="People active · 7 days" value={t.people} icon={<Users />} />
        <Stat
          label="Sign-ins · 7 days"
          value={t.signins}
          icon={<LogIn />}
          href={href({ category: "security" })}
        />
        <Stat
          label="Worth a look · 7 days"
          value={t.alerts}
          icon={<TriangleAlert />}
          tone={t.alerts ? "warn" : "neutral"}
          hint="deletions, blocked sign-ins, erasures"
          href={href({ alerts: "1" })}
        />
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card title="Activity · 14 days">
          <AreaChart
            stacked
            height={210}
            data={stats.series}
            series={(Object.keys(LOG_CATEGORIES) as LogCategory[]).map((k) => ({
              key: k,
              label: LOG_CATEGORIES[k].label,
              color: LOG_CATEGORIES[k].color,
            }))}
          />
        </Card>
        <div className="grid content-start gap-5">
          <Card title="Most active">
            <BarList
              items={stats.actors.map((a) => ({ key: a.id, label: a.name, value: a.n }))}
              empty="No staff activity yet."
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {stats.actors.map((a) => (
                <Link
                  key={a.id}
                  href={href({ actor: sp.actor === String(a.id) ? undefined : String(a.id) })}
                  aria-current={sp.actor === String(a.id)}
                  className="rounded-full border border-subtle px-2.5 py-0.5 text-[0.75rem] aria-[current=true]:border-accent aria-[current=true]:text-accent"
                >
                  {a.name.split(" ")[0]}
                </Link>
              ))}
            </div>
          </Card>
          <Card title="Records touched">
            <BarList
              items={stats.entities.map((e) => ({
                label: titleCase(entityName(e.entity)),
                value: e.n,
              }))}
            />
          </Card>
        </div>
      </div>

      <nav aria-label="Categories" className="flex flex-wrap gap-2">
        <Link
          href={href({ category: undefined })}
          aria-current={!f.category}
          className="rounded-full border border-subtle px-3 py-1 text-[0.8125rem] font-medium aria-[current=true]:border-transparent aria-[current=true]:bg-fg aria-[current=true]:text-[var(--bg-canvas)]"
        >
          Everything
        </Link>
        {(Object.keys(LOG_CATEGORIES) as LogCategory[]).map((k) => (
          <Link
            key={k}
            href={href({ category: f.category === k ? undefined : k })}
            aria-current={f.category === k}
            className="inline-flex items-center gap-1.5 rounded-full border border-subtle px-3 py-1 text-[0.8125rem] font-medium transition-colors hover:border-strong aria-[current=true]:text-white"
            style={
              f.category === k
                ? { background: LOG_CATEGORIES[k].color, borderColor: "transparent" }
                : undefined
            }
          >
            <span className="size-2 rounded-full" style={{ background: LOG_CATEGORIES[k].color }} />
            {LOG_CATEGORIES[k].label}
          </Link>
        ))}
      </nav>

      <FilterBar
        keep={["category", "alerts"]}
        fields={[
          { kind: "search", name: "q", placeholder: "Search a record, ref, action or person…" },
          {
            kind: "select",
            name: "actor",
            label: "Person",
            options: users.map((u) => ({ value: String(u.id), label: u.name })),
          },
          {
            kind: "select",
            name: "entity",
            label: "Record type",
            options: ENTITIES.map((e) => ({ value: e, label: titleCase(entityName(e)) })),
          },
          { kind: "date", name: "from", label: "From" },
          { kind: "date", name: "to", label: "To" },
        ]}
      />

      {!list.total ? (
        <Empty title="Nothing matches" body="Change or clear the filters." />
      ) : (
        <>
          <LogTimeline entries={list.entries} avatars={avatars} now={now} />
          <Pagination
            path="/office/logs"
            params={sp}
            page={list.page}
            totalPages={list.totalPages}
            totalDocs={list.total}
            limit={60}
          />
        </>
      )}
    </div>
  );
}
