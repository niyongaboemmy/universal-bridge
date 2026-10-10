import { NextResponse } from "next/server";
import { sql } from "@payloadcms/db-postgres";
import { payload } from "@/lib/cms/payload";

export const dynamic = "force-dynamic";

// Uptime monitoring target (NFR-REL-04). Database round-trip plus the email
// outbox: a backlog older than 10 minutes or dead jobs mean emails aren't going out.
export async function GET() {
  const started = Date.now();
  try {
    const p = await payload();
    const r = await p.db.drizzle.execute(sql`
      select
        count(*) filter (where status = 'pending' and run_after < now() - interval '10 minutes')::int as stuck,
        count(*) filter (where status = 'dead')::int as dead
      from outbox`);
    const { stuck, dead } = r.rows[0] as { stuck: number; dead: number };
    const outbox = stuck || dead ? "attention" : "ok";
    return NextResponse.json(
      {
        status: outbox === "ok" ? "ok" : "degraded",
        db: "ok",
        outbox,
        stuck,
        dead,
        ms: Date.now() - started,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ status: "down", db: "error" }, { status: 503 });
  }
}
