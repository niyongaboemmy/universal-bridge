import { sql } from "@payloadcms/db-postgres";
import { ArrowRight, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { titleCase } from "@/components/office/format";
import { Card, Empty, PageHeader, Stat } from "@/components/office/ui";
import { LEAD_STATUSES } from "@/collections/Leads";
import { requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";

export const metadata = { title: "Demo requests" };

const STAGE_COLOR: Record<string, string> = {
  new: "var(--ub-orange-500)",
  contacted: "var(--ub-blue-300)",
  qualified: "var(--ub-blue-500)",
  proposal: "var(--ub-blue-700)",
  won: "#15803d",
  lost: "var(--text-muted)",
};

type Row = { product: string; status: string; n: number; week: number };

/** Demo requests, step 1: every product with its pipeline at a glance. */
export default async function Demos() {
  await requireArea("demos");
  const p = await payload();
  const [stats, products] = await Promise.all([
    p.db.drizzle.execute(sql`
      select product, status, count(*)::int as n,
             count(*) filter (where created_at > now() - interval '7 days')::int as week
      from leads where coalesce(product, '') <> '' group by product, status`),
    p.find({
      collection: "products",
      limit: 50,
      depth: 0,
      select: { slug: true, name: true, status: true } as never,
    }),
  ]);
  const rows = stats.rows as Row[];
  const named = new Map(
    (products.docs as { slug: string; name: string; status?: string }[]).map((d) => [d.slug, d]),
  );
  const slugs = [...new Set([...named.keys(), ...rows.map((r) => r.product)])];
  const total = rows.reduce((s, r) => s + r.n, 0);
  const week = rows.reduce((s, r) => s + r.week, 0);
  const won = rows.filter((r) => r.status === "won").reduce((s, r) => s + r.n, 0);
  const open = rows.filter((r) => !["won", "lost"].includes(r.status)).reduce((s, r) => s + r.n, 0);

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Demo requests"
        subtitle="Pick a product to work its demo pipeline: drag each request from New to Won."
      />
      <div className="office-stagger grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="All demo requests" value={total} icon={<MonitorPlay />} />
        <Stat label="New this week" value={week} />
        <Stat label="Open" value={open} hint="not yet won or lost" />
        <Stat
          label="Won"
          value={won}
          hint={total ? `${Math.round((won / total) * 100)}% of all requests` : undefined}
          tone="good"
        />
      </div>
      {!slugs.length ? (
        <Empty
          title="No products yet"
          body="Products and their “Request a demo” forms are managed in the CMS."
        />
      ) : (
        <ul className="office-stagger grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {slugs.map((slug) => {
            const mine = rows.filter((r) => r.product === slug);
            const count = (s: string) => mine.find((r) => r.status === s)?.n ?? 0;
            const sum = mine.reduce((s, r) => s + r.n, 0);
            const fresh = mine.reduce((s, r) => s + r.week, 0);
            const doc = named.get(slug);
            return (
              <li key={slug}>
                <Link
                  href={`/office/demos/${slug}`}
                  className="group block h-full rounded-2xl border border-subtle bg-surface p-5 shadow-1 transition-[translate,box-shadow,border-color] hover:-translate-y-0.5 hover:border-strong hover:shadow-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-heading-md group-hover:text-accent">
                        {doc?.name ?? titleCase(slug)}
                      </h2>
                      <p className="text-[0.8125rem] text-fg-muted">
                        {doc?.status ? titleCase(doc.status) : "Not in the CMS"}
                      </p>
                    </div>
                    <span className="text-right">
                      <span className="block font-display text-heading-lg tabular-nums">{sum}</span>
                      <span className="text-[0.75rem] text-fg-muted">
                        {fresh ? `+${fresh} this week` : "requests"}
                      </span>
                    </span>
                  </div>
                  {/* Stage breakdown as one stacked bar, then a legend with counts. */}
                  <div
                    className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-[var(--bg-sunken)]"
                    role="img"
                    aria-label={LEAD_STATUSES.map((s) => `${s} ${count(s)}`).join(", ")}
                  >
                    {LEAD_STATUSES.map((s) =>
                      count(s) ? (
                        <span
                          key={s}
                          className="office-bar h-full"
                          style={{
                            width: `${(count(s) / Math.max(sum, 1)) * 100}%`,
                            background: STAGE_COLOR[s],
                          }}
                        />
                      ) : null,
                    )}
                  </div>
                  <ul className="mt-3 grid grid-cols-3 gap-x-3 gap-y-1.5 text-[0.75rem]">
                    {LEAD_STATUSES.map((s) => (
                      <li
                        key={s}
                        className="flex items-center justify-between gap-1.5 text-fg-secondary"
                      >
                        <span className="inline-flex items-center gap-1.5 capitalize">
                          <span
                            className="size-2 rounded-full"
                            style={{ background: STAGE_COLOR[s] }}
                          />
                          {s}
                        </span>
                        <span className="font-medium text-fg tabular-nums">{count(s)}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="mt-4 inline-flex items-center gap-1 text-[0.8125rem] font-medium text-accent">
                    Open pipeline{" "}
                    <ArrowRight
                      className="size-3.5 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {!total && slugs.length > 0 && (
        <Card>
          <p className="text-body-sm text-fg-secondary">
            No demo requests yet. They arrive from each product page&apos;s “Request a demo”.
          </p>
        </Card>
      )}
    </div>
  );
}
