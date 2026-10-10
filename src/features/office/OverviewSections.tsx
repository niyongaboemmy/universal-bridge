import {
  Briefcase,
  CalendarClock,
  CircleCheck,
  Eye,
  GraduationCap,
  Inbox,
  MonitorPlay,
  Radio,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { LazyAreaChart as AreaChart } from "@/components/office/lazy";
import { Donut, Funnel, Gauge, Kpi, Ring } from "@/components/office/charts";
import { STAGE_COLORS } from "@/components/office/CategoryCards";
import { delta, fmtDate, fmtMoney, titleCase } from "@/components/office/format";
import { LogTimeline } from "@/components/office/LogTimeline";
import { KindIcon } from "@/components/office/NotificationBell";
import { BarList, Card, Pill } from "@/components/office/ui";
import { APPLICATION_STATUSES, applicationTypesFor } from "@/collections/Applications";
import { LEAD_STATUSES } from "@/collections/Leads";
import { settings } from "@/lib/settings";
import { nowMs } from "@/lib/time/office-hours";
import { avatarsFor, listLogs } from "./logs-data";
import { upcomingFor } from "./notifications";
import {
  clientsData,
  dailySeries,
  peopleData,
  talentData,
  websiteData,
  workData,
} from "./overview";
import { allowed, can, type OfficeUser } from "./session";

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const TYPE_COLOR: Record<string, string> = {
  academy: "#0145b8",
  internship: "#7a4de0",
  job: "#0f8a6a",
  partner: "#b7791f",
  event: "#fe760d",
};
const DEPT_COLORS = ["#0145b8", "#fe760d", "#0f8a6a", "#7a4de0", "#0e7490", "#be185d", "#b7791f"];

/** Headline numbers for the person's areas, with 14-day sparklines and change vs the 14 days before. */
export async function KpiRow({ user }: { user: OfficeUser }) {
  const series = await dailySeries(28);
  const last = series.slice(14);
  const prev = series.slice(0, 14);
  const k = (key: "service" | "demo" | "message" | "applications" | "visitors") => {
    const now = sum(last.map((d) => d[key]));
    return {
      value: now,
      change: delta(now, sum(prev.map((d) => d[key]))),
      spark: last.map((d) => d[key]),
    };
  };
  const tiles = [
    can(user, "requests") && (
      <Kpi
        key="s"
        label="Service requests · 14 d"
        {...k("service")}
        href="/office/requests"
        icon={<Briefcase />}
        tone="blue"
      />
    ),
    can(user, "demos") && (
      <Kpi
        key="d"
        label="Demo requests · 14 d"
        {...k("demo")}
        href="/office/demos"
        icon={<MonitorPlay />}
        tone="violet"
      />
    ),
    can(user, "messages") && (
      <Kpi
        key="m"
        label="Messages · 14 d"
        {...k("message")}
        href="/office/messages"
        icon={<Inbox />}
        tone="teal"
      />
    ),
    can(user, "applicants") && (
      <Kpi
        key="a"
        label="Applications · 14 d"
        {...k("applications")}
        href="/office/applicants"
        icon={<GraduationCap />}
        tone="green"
      />
    ),
    can(user, "analytics") && (
      <Kpi
        key="v"
        label="Website visitors · 14 d"
        {...k("visitors")}
        href="/office/analytics"
        icon={<Eye />}
        tone="orange"
      />
    ),
  ].filter(Boolean);
  if (!tiles.length) return null;
  return (
    <div className="office-stagger grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
      {tiles}
    </div>
  );
}

/** What needs doing: overdue replies, follow-ups, closing openings, due projects… */
export async function YourDay({ user }: { user: OfficeUser }) {
  const items = await upcomingFor(user as never);
  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <CalendarClock className="size-4 text-accent" aria-hidden /> Your day
        </span>
      }
      action={
        <Link href="/office/notifications" className="text-[0.75rem] font-medium text-accent">
          All notifications
        </Link>
      }
      className="h-full"
      pad={false}
    >
      {!items.length ? (
        <div className="grid justify-items-center gap-2 px-5 py-10 text-center">
          <CircleCheck className="size-10 text-success" aria-hidden />
          <p className="font-medium">All clear</p>
          <p className="text-[0.8125rem] text-fg-muted">
            Nothing overdue or due soon in your areas.
          </p>
        </div>
      ) : (
        <ul className="office-stagger divide-y divide-[var(--border-subtle)]">
          {items.slice(0, 8).map((u) => (
            <li key={u.key}>
              <Link
                href={u.href}
                className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--bg-sunken)]"
              >
                <KindIcon kind={u.kind} size={30} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-sm font-medium">{u.title}</span>
                  <span className="block truncate text-[0.75rem] text-fg-muted">
                    {u.body}
                    {u.due ? ` · ${fmtDate(u.due)}` : ""}
                  </span>
                </span>
                <Pill tone={u.tone === "late" ? "red" : u.tone === "warn" ? "orange" : "blue"}>
                  {u.tone === "late" ? "overdue" : u.tone === "warn" ? "soon" : "upcoming"}
                </Pill>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** Incoming work over 30 days (only the kinds this person handles). */
export async function IncomingChart({ user }: { user: OfficeUser }) {
  const series = await dailySeries(30);
  const lines = [
    can(user, "requests") && { key: "service", label: "Service requests", color: "#0145b8" },
    can(user, "demos") && { key: "demo", label: "Demo requests", color: "#7a4de0" },
    can(user, "messages") && { key: "message", label: "Messages", color: "#0e7490" },
    can(user, "applicants") && { key: "applications", label: "Applications", color: "#0f8a6a" },
  ].filter(Boolean) as { key: string; label: string; color: string }[];
  if (!lines.length) return null;
  return (
    <Card title="Incoming, last 30 days" className="h-full">
      <AreaChart data={series} stacked series={lines} height={230} />
    </Card>
  );
}

export async function ClientsSection({ user }: { user: OfficeUser }) {
  if (!can(user, "requests") && !can(user, "demos") && !can(user, "messages")) return null;
  const [{ stages, totals: t, services }, s] = await Promise.all([clientsData(), settings()]);
  const byStage = Object.fromEntries(stages.map((r) => [r.status, r]));
  const open = stages.filter((r) => !["won", "lost"].includes(r.status));
  const pipeline = sum(open.map((r) => r.value));
  const winRate = t.won + t.lost ? Math.round((t.won / (t.won + t.lost)) * 100) : 0;
  const inTarget = t.replied ? Math.round((t.replied_in_target / t.replied) * 100) : 0;
  return (
    <section aria-labelledby="sec-clients" className="grid gap-4">
      <h2
        id="sec-clients"
        className="text-body-sm font-semibold tracking-wide text-fg-muted uppercase"
      >
        Clients
      </h2>
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-[1.3fr_1fr_1fr]">
        <Card
          title="Sales pipeline"
          action={
            <span className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold">
              <Wallet className="size-4 text-accent" aria-hidden /> {fmtMoney(pipeline, s.currency)}{" "}
              open
            </span>
          }
        >
          <Funnel
            format={(n) => (n ? fmtMoney(n, s.currency) : "—")}
            stages={LEAD_STATUSES.map((st) => ({
              label: st,
              count: byStage[st]?.n ?? 0,
              value: byStage[st]?.value ?? 0,
              color: STAGE_COLORS[st] ?? "#94a3b8",
              href: `/office/requests?stage=${st}&view=list`,
            }))}
          />
          <p className="mt-3 text-[0.75rem] text-fg-muted">
            {fmtMoney(t.won_value, s.currency)} won in the last 30 days
          </p>
        </Card>
        <Card title="Where requests come from · 30 d">
          <Donut
            label="requests"
            data={[
              {
                label: "Service requests",
                value: t.service_30,
                color: "#0145b8",
                href: "/office/requests",
              },
              { label: "Demo requests", value: t.demo_30, color: "#7a4de0", href: "/office/demos" },
              {
                label: "Messages",
                value: t.message_30,
                color: "#0e7490",
                href: "/office/messages",
              },
            ]}
          />
          {services.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-[0.75rem] font-medium text-fg-muted">
                Most requested services · 90 d
              </p>
              <BarList
                items={services.map((x) => ({ key: x.svc, label: titleCase(x.svc), value: x.n }))}
              />
            </div>
          )}
        </Card>
        <Card title="How we respond" className="lg:col-span-2 2xl:col-span-1">
          <div className="grid grid-cols-2 gap-2">
            <Gauge value={winRate} display={`${winRate}%`} label="Win rate · 90 d" target={30} />
            <Gauge
              value={inTarget}
              display={`${inTarget}%`}
              label={`Replied within ${s.responseHours} h`}
              target={80}
            />
          </div>
          <p className="mt-3 text-center text-[0.8125rem] text-fg-secondary">
            Average first reply{" "}
            <strong className={t.reply_hours > s.responseHours ? "text-danger" : "text-success"}>
              {t.reply_hours ? `${t.reply_hours < 1 ? "<1" : Math.round(t.reply_hours)} h` : "—"}
            </strong>{" "}
            · target {s.responseHours} h
          </p>
        </Card>
      </div>
    </section>
  );
}

export async function TalentSection({ user }: { user: OfficeUser }) {
  const allowedTypes = applicationTypesFor(user as never);
  const types = allowedTypes === "all" ? Object.keys(TYPE_COLOR) : allowedTypes;
  if (!types.length) return null;
  const d = await talentData(types);
  if (!d) return null;
  const st = Object.fromEntries(d.byStage.map((r) => [r.status, r.n]));
  const now = nowMs();
  return (
    <section aria-labelledby="sec-talent" className="grid gap-4">
      <h2
        id="sec-talent"
        className="text-body-sm font-semibold tracking-wide text-fg-muted uppercase"
      >
        Talent
      </h2>
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <Card title="Applicants by stage">
          <Funnel
            stages={APPLICATION_STATUSES.map((s) => ({
              label: s,
              count: st[s] ?? 0,
              color: STAGE_COLORS[s] ?? "#94a3b8",
            }))}
          />
        </Card>
        <Card title="Applications · 30 d">
          <Donut
            label="applications"
            data={d.byType.map((r) => ({
              label: titleCase(r.type),
              value: r.n,
              color: TYPE_COLOR[r.type] ?? "#64748b",
              href: `/office/applicants?type=${r.type}`,
            }))}
          />
        </Card>
        <Card
          title="Open openings"
          action={
            allowed(user, "openings.view", "openings.manage") ? (
              <Link href="/office/openings" className="text-[0.75rem] font-medium text-accent">
                All openings
              </Link>
            ) : undefined
          }
          className="lg:col-span-2 2xl:col-span-1"
        >
          {!d.openings.length ? (
            <p className="text-body-sm text-fg-muted">Nothing open right now.</p>
          ) : (
            <ul className="grid gap-3">
              {d.openings.map((o) => {
                const days = o.closes_at
                  ? Math.ceil((new Date(o.closes_at).getTime() - now) / 86_400_000)
                  : null;
                return (
                  <li key={o.id} className="flex items-center gap-3">
                    <Ring value={o.seats ? o.accepted / o.seats : 0} color={TYPE_COLOR[o.kind]}>
                      {o.seats ? `${o.accepted}/${o.seats}` : o.applied}
                    </Ring>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-sm font-medium">{o.title}</span>
                      <span className="text-[0.75rem] text-fg-muted">
                        {o.applied} applied · {titleCase(o.kind)}
                      </span>
                    </span>
                    {days !== null && (
                      <span
                        className={
                          days <= 3
                            ? "rounded-full bg-[color-mix(in_oklab,var(--accent-spark)_16%,transparent)] px-2 py-0.5 text-[0.75rem] font-medium text-[var(--accent-spark-text)]"
                            : "rounded-full bg-[var(--bg-sunken)] px-2 py-0.5 text-[0.75rem] text-fg-secondary"
                        }
                      >
                        {days <= 0 ? "closes today" : `${days} days left`}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </section>
  );
}

export async function WorkSection({ user }: { user: OfficeUser }) {
  const showProjects = can(user, "projects");
  const showPeople = can(user, "people");
  if (!showProjects && !showPeople) return null;
  const [work, people] = await Promise.all([
    showProjects ? workData() : null,
    showPeople ? peopleData() : null,
  ]);
  const now = nowMs();
  const H: Record<string, string> = {
    "on-track": "#0f8a6a",
    "at-risk": "#fe760d",
    "off-track": "#dc2626",
  };
  return (
    <section aria-labelledby="sec-work" className="grid gap-4">
      <h2
        id="sec-work"
        className="text-body-sm font-semibold tracking-wide text-fg-muted uppercase"
      >
        Work & team
      </h2>
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {work && (
          <>
            <Card title="Project health">
              <Donut
                label="projects"
                data={["on-track", "at-risk", "off-track"].map((h) => ({
                  label: titleCase(h),
                  value: work.health.find((r) => r.health === h)?.n ?? 0,
                  color: H[h]!,
                  href: `/office/projects?health=${h}`,
                }))}
              />
            </Card>
            <Card
              title="Delivery"
              action={
                <Link href="/office/projects" className="text-[0.75rem] font-medium text-accent">
                  Board
                </Link>
              }
            >
              <ul className="grid gap-3">
                {work.active.map((p) => {
                  const late = p.due_date && new Date(p.due_date).getTime() < now;
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/office/projects/${p.id}`}
                        className="block rounded-lg hover:opacity-85"
                      >
                        <span className="flex items-center justify-between gap-2 text-body-sm">
                          <span className="truncate font-medium">{p.name}</span>
                          <span
                            className={
                              late
                                ? "shrink-0 text-[0.75rem] font-medium text-danger"
                                : "shrink-0 text-[0.75rem] text-fg-muted"
                            }
                          >
                            {p.due_date
                              ? `${late ? "overdue · " : ""}${fmtDate(p.due_date)}`
                              : "no date"}
                          </span>
                        </span>
                        <span className="mt-1.5 flex items-center gap-2">
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-sunken)]">
                            <span
                              className="office-bar block h-full rounded-full"
                              style={{
                                width: `${p.progress}%`,
                                background: H[p.health] ?? "#0145b8",
                              }}
                            />
                          </span>
                          <span className="w-9 text-right text-[0.75rem] tabular-nums">
                            {p.progress}%
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
                {!work.active.length && (
                  <li className="text-body-sm text-fg-muted">No active projects.</li>
                )}
              </ul>
            </Card>
          </>
        )}
        {people && (
          <Card
            title="Team"
            action={
              <span className="text-[0.75rem] text-fg-muted">
                {people.totals.on_leave} on leave · {people.totals.joined} joined in 90 d
              </span>
            }
            className={work ? "lg:col-span-2 2xl:col-span-1" : undefined}
          >
            <Donut
              label="people"
              data={people.depts.map((d, i) => ({
                label: titleCase(d.d),
                value: d.n,
                color: DEPT_COLORS[i % DEPT_COLORS.length]!,
                href: `/office/people?dept=${d.d}`,
              }))}
            />
          </Card>
        )}
      </div>
    </section>
  );
}

export async function WebsiteSection({ user }: { user: OfficeUser }) {
  if (!can(user, "analytics")) return null;
  const w = await websiteData();
  // Requests can outnumber tracked visitors (analytics needs consent): then the rate means nothing.
  const conv =
    w.totals.visitors && w.totals.leads <= w.totals.visitors
      ? `${Math.round((w.totals.leads / w.totals.visitors) * 1000) / 10}%`
      : "—";
  return (
    <section aria-labelledby="sec-web" className="grid gap-4">
      <h2 id="sec-web" className="text-body-sm font-semibold tracking-wide text-fg-muted uppercase">
        Website
      </h2>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card
          title="Visitors and page views · 30 d"
          action={
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--success)_14%,transparent)] px-2 py-0.5 text-[0.75rem] font-semibold text-success">
              <Radio className="size-3.5 animate-pulse" aria-hidden /> {w.totals.now} now
            </span>
          }
        >
          <AreaChart
            data={w.series}
            height={200}
            series={[
              { key: "views", label: "Page views", color: "#6b9cff" },
              { key: "visitors", label: "Visitors", color: "#0145b8" },
            ]}
          />
        </Card>
        <Card
          title="Top pages · 30 d"
          action={
            <Link href="/office/analytics" className="text-[0.75rem] font-medium text-accent">
              Analytics
            </Link>
          }
        >
          <BarList
            items={w.pages.map((p) => ({ key: p.label, label: p.label, value: p.value }))}
            empty="No visits recorded yet."
          />
          <p className="mt-4 text-[0.8125rem] text-fg-secondary">
            Visitor → request conversion{" "}
            <strong className="text-fg">{conv}</strong>
          </p>
        </Card>
      </div>
    </section>
  );
}

export async function ActivitySection({ user }: { user: OfficeUser }) {
  const everyone = allowed(user, "audit.view");
  const list = await listLogs(everyone ? {} : { actor: user.id }, 1, 8);
  if (!list.entries.length) return null;
  const avatars = await avatarsFor(list.entries.map((e) => e.actorId));
  return (
    <Card
      title={everyone ? "Latest activity" : "My latest actions"}
      action={
        everyone ? (
          <Link href="/office/logs" className="text-[0.75rem] font-medium text-accent">
            System logs
          </Link>
        ) : undefined
      }
    >
      <LogTimeline entries={list.entries} avatars={avatars} now={nowMs()} />
    </Card>
  );
}
