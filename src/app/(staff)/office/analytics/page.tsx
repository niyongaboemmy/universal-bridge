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

export default async function Analytics({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  await requireArea("analytics");
  const r = Number((await searchParams).range);
  const range: Range = r === 7 || r === 90 ? r : 30;
  const [a, live] = await Promise.all([analytics(range), realtimeVisitors()]);
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
            counted only for visitors who accept analytics. No IP addresses stored.
          </span>
        }
        actions={
          <Tabs
            current={`/office/analytics?range=${range}`}
            items={[7, 30, 90].map((d) => ({
              href: `/office/analytics?range=${d}`,
              label: `${d} days`,
            }))}
          />
        }
      />
      <div className="office-stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-[16rem_repeat(3,minmax(0,1fr))]">
        <Card className="xl:row-span-2">
          <Realtime initial={live} />
        </Card>
        <Stat
          label="Visitors"
          value={fmtNumber(totals.visitors)}
          change={delta(totals.visitors, previous.visitors)}
          hint={`vs previous ${range} days`}
        />
        <Stat
          label="Page views"
          value={fmtNumber(totals.views)}
          change={delta(totals.views, previous.views)}
        />
        <Stat
          label="Sessions"
          value={fmtNumber(totals.sessions)}
          hint={`${totals.sessions ? (totals.views / totals.sessions).toFixed(1) : "0"} pages per session`}
        />
        <Stat
          label="Bounce rate"
          value={`${pct(totals.bounces, totals.sessions)}%`}
          hint="sessions with one page"
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
              label: c.label === "—" ? "Unknown" : (COUNTRY.of(c.label) ?? c.label),
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
