import { ShieldCheck } from "lucide-react";
import { LazyAreaChart as AreaChart } from "@/components/office/lazy";
import { Realtime } from "@/components/office/controls";
import { delta, fmtNumber } from "@/components/office/format";
import { BarList, Card, PageHeader, Stat, Tabs } from "@/components/office/ui";
import { analytics, realtimeVisitors, type Range } from "@/features/office/data";
import { requireArea } from "@/features/office/session";

export const metadata = { title: "Website analytics" };

const COUNTRY = new Intl.DisplayNames(["en"], { type: "region" });
const LANG: Record<string, string> = { en: "English", fr: "French", rw: "Kinyarwanda" };
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 1000) / 10 : 0);
/** 🇷🇼 from "RW" (regional indicator letters). */
const flag = (code: string) =>
  /^[A-Z]{2}$/.test(code)
    ? String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
    : "";
/** "45 s", "3 min 20 s", "1 h 05 min". */
function duration(seconds: number) {
  const s = Math.round(seconds);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ${String(s % 60).padStart(2, "0")} s`;
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
}

export default async function Analytics({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; staff?: string }>;
}) {
  await requireArea("analytics");
  const sp = await searchParams;
  const r = Number(sp.range);
  const range: Range = r === 7 || r === 90 ? r : 30;
  // Everyone by default (staff included, labelled); "Exclude staff" leaves them out.
  const staff = sp.staff !== "0";
  const href = (next: { range?: number; staff?: boolean }) => {
    const q = new URLSearchParams({ range: String(next.range ?? range) });
    if (!(next.staff ?? staff)) q.set("staff", "0");
    return `/office/analytics?${q}`;
  };
  const [a, live] = await Promise.all([analytics(range, { staff }), realtimeVisitors({ staff })]);
  const { totals, previous } = a;
  const conversions = a.conversions.leads + a.conversions.applications;
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Website analytics"
        subtitle={
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-success" aria-hidden /> First-party and cookieless:
            counted only for visitors who accept analytics. No IP addresses stored; the country
            comes from the browser&apos;s time zone. Days are Kigali days. Signed-in staff are
            counted and labelled; &ldquo;Exclude staff&rdquo; hides them.
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Tabs
              current={href({})}
              items={[
                { href: href({ staff: true }), label: "Everyone" },
                { href: href({ staff: false }), label: "Exclude staff" },
              ]}
            />
            <Tabs
              current={href({})}
              items={[7, 30, 90].map((d) => ({ href: href({ range: d }), label: `${d} days` }))}
            />
          </div>
        }
      />
      <div className="office-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-[16rem_repeat(3,minmax(0,1fr))]">
        <Card className="xl:row-span-2">
          <Realtime initial={live} staff={staff} />
        </Card>
        <Stat
          label="Visitors"
          value={fmtNumber(totals.visitors)}
          change={delta(totals.visitors, previous.visitors)}
          hint={`unique per day · vs previous ${range} days`}
        />
        <Stat
          label="Page views"
          value={fmtNumber(totals.views)}
          change={delta(totals.views, previous.views)}
        />
        <Stat
          label="Sessions"
          value={fmtNumber(totals.sessions)}
          hint={`${totals.sessions ? (totals.views / totals.sessions).toFixed(1) : "0"} pages · ${duration(totals.avg_seconds)} per visit`}
        />
        <Stat
          label="Bounce rate"
          value={`${pct(totals.bounces, totals.sessions)}%`}
          hint="one page, left within 10 s"
        />
        <Stat
          label="Requests & applications"
          value={fmtNumber(conversions)}
          hint={`${a.conversions.leads} requests · ${a.conversions.applications} applications`}
        />
        {conversions > totals.visitors ? (
          <Stat
            label="Conversion rate"
            value="—"
            hint="more submissions than tracked visitors: most visitors decline analytics"
          />
        ) : (
          <Stat
            label="Conversion rate"
            value={`${pct(conversions, totals.visitors)}%`}
            hint="of tracked visitors sent something"
            tone="good"
          />
        )}
      </div>
      <Card title="Visitors and page views">
        <AreaChart
          data={a.series}
          series={[
            { key: "views", label: "Page views", color: "var(--ub-blue-300)" },
            { key: "visitors", label: "Visitors", color: "var(--ub-orange-500)" },
          ]}
        />
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Top pages"
          action={<span className="text-[0.75rem] text-fg-muted">views</span>}
        >
          <BarList
            items={a.pages.map((p) => ({
              label: p.label,
              value: p.value,
              sub: `${p.visitors} visitors`,
              href: site + p.label,
            }))}
            format={fmtNumber}
          />
        </Card>
        <Card
          title="Where visitors come from"
          action={<span className="text-[0.75rem] text-fg-muted">visitors</span>}
        >
          <BarList items={a.sources} format={fmtNumber} />
        </Card>
        <Card title="Countries">
          <BarList
            items={a.countries.map((c) => ({
              label:
                c.label === "—"
                  ? "Unknown"
                  : `${flag(c.label)} ${COUNTRY.of(c.label) ?? c.label}`.trim(),
              value: c.value,
            }))}
            format={fmtNumber}
          />
        </Card>
        <div className="grid gap-6 sm:grid-cols-3 xl:grid-cols-3">
          <Card title="Devices">
            <BarList
              items={a.devices.map((d) => ({
                label: d.label[0]!.toUpperCase() + d.label.slice(1),
                value: d.value,
              }))}
              format={fmtNumber}
            />
          </Card>
          <Card title="Browsers">
            <BarList items={a.browsers} format={fmtNumber} />
          </Card>
          <Card title="Languages">
            <BarList
              items={a.locales.map((l) => ({ label: LANG[l.label] ?? l.label, value: l.value }))}
              format={fmtNumber}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
