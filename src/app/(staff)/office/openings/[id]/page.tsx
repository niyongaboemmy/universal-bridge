import { sql } from "@payloadcms/db-postgres";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteOpening } from "@/components/office/DeleteOpening";
import { timeAgo } from "@/components/office/format";
import { LazyOpeningEditor as OpeningEditor } from "@/components/office/lazy";
import { Card, PageHeader, Pill, btn } from "@/components/office/ui";
import { APPLICATION_STATUSES } from "@/collections/Applications";
import { allowed, requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import type { Opening } from "@/payload-types";

export const metadata = { title: "Opening" };

const STAGE_COLOR: Record<string, string> = {
  received: "#fe760d",
  review: "#6b9cff",
  shortlisted: "#0145b8",
  accepted: "#0f8a6a",
  waitlisted: "#b7791f",
  rejected: "#94a3b8",
};

export default async function OpeningPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireArea("openings");
  const id = Number((await params).id);
  const p = await payload();
  const opening = (await p
    .findByID({ collection: "openings", id, depth: 0, user, overrideAccess: false })
    .catch(() => null)) as Opening | null;
  if (!opening) notFound();
  const [funnel, recent] = await Promise.all([
    p.db.drizzle.execute(
      sql`select status, count(*)::int as n from applications where opening_id = ${id} group by 1`,
    ),
    p.db.drizzle.execute(
      sql`select id, ref, status, created_at from applications where opening_id = ${id} order by created_at desc limit 6`,
    ),
  ]);
  const counts = Object.fromEntries(
    (funnel.rows as { status: string; n: number }[]).map((r) => [r.status, r.n]),
  );
  const total = Object.values(counts).reduce((a: number, b) => a + (b as number), 0) as number;
  const max = Math.max(1, ...Object.values(counts).map(Number));
  const canManage = allowed(user, "openings.manage");

  return (
    <div className="office-page grid gap-5">
      <Link
        href="/office/openings"
        className="inline-flex items-center gap-1.5 text-body-sm text-fg-secondary hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden /> Openings
      </Link>
      <PageHeader
        title={opening.title}
        subtitle={
          <Pill
            tone={
              opening.status === "open"
                ? "green"
                : opening.status === "paused"
                  ? "orange"
                  : "neutral"
            }
          >
            {opening.status}
          </Pill>
        }
        actions={
          <>
            <Link
              href={`/office/applicants?type=${opening.kind}&opening=${opening.id}`}
              className={btn}
            >
              <Users className="size-4" aria-hidden /> Applicants ({total})
            </Link>
            {canManage && <DeleteOpening id={opening.id} />}
          </>
        }
      />
      <Card title="Applications by stage">
        {total ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <ul className="grid gap-2">
              {APPLICATION_STATUSES.map((s) => (
                <li
                  key={s}
                  className="grid grid-cols-[6.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-body-sm"
                >
                  <span className="text-fg-secondary capitalize">{s}</span>
                  <span className="h-3 overflow-hidden rounded-full bg-[var(--bg-sunken)]">
                    <span
                      className="office-bar block h-full rounded-full"
                      style={{
                        width: `${((counts[s] ?? 0) / max) * 100}%`,
                        background: STAGE_COLOR[s],
                      }}
                    />
                  </span>
                  <span className="text-right font-medium tabular-nums">{counts[s] ?? 0}</span>
                </li>
              ))}
            </ul>
            <ul className="grid content-start gap-1.5 text-body-sm">
              {(
                recent.rows as { id: number; ref: string; status: string; created_at: string }[]
              ).map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/office/applicants/${a.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg px-2 py-1 hover:bg-[var(--bg-sunken)]"
                  >
                    <span className="font-mono text-[0.75rem]">{a.ref}</span>
                    <span className="text-[0.75rem] text-fg-muted">
                      {timeAgo(new Date(a.created_at).toISOString())}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-body-sm text-fg-muted">
            No applications yet
            {opening.status !== "open" ? " — set the status to open to publish it" : ""}.
          </p>
        )}
      </Card>
      {canManage ? (
        <OpeningEditor
          opening={{ ...opening, fields: (opening.fields ?? []) as never }}
          siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? ""}
        />
      ) : null}
    </div>
  );
}
