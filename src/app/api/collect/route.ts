import { createHash } from "node:crypto";
import { sql } from "@payloadcms/db-postgres";
import { NextResponse, type NextRequest } from "next/server";
import { externalReferrer, ownHosts, visitorCountry } from "@/lib/analytics/collect";
import { BOT, classify } from "@/lib/analytics/ua";
import { payload } from "@/lib/cms/payload";
import { rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const ok = () => new NextResponse(null, { status: 204 });
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");

/**
 * Page-view beacon (consent only, see lib/analytics/track). Stores the path,
 * referrer host, campaign tags, country (from a CDN header or the browser's time
 * zone, never an IP lookup), device class and a visitor hash that changes daily
 * (salted IP + browser) so nobody can be followed across days. A "ping" while the
 * page stays open refreshes updated_at of the session's latest view: that drives
 * "on the site now" and time on site. Bots, staff and other sites are ignored.
 */
export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua) || request.cookies.has("payload-token")) return ok();
  if (request.headers.get("sec-fetch-site") === "cross-site") return ok();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  // Flood guard per IP, generous: on mobile networks many phones share one address.
  if (!(await rateLimit("collect-ip", ip, { limit: 1200, windowSec: 60 })).success) return ok();

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const path = clip(body?.p, 300);
  if (
    !path.startsWith("/") ||
    path.startsWith("/admin") ||
    path.startsWith("/office") ||
    path.startsWith("/api")
  )
    return ok();

  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.RATE_LIMIT_SALT ?? process.env.PAYLOAD_SECRET ?? "dev";
  const visitor = createHash("sha256")
    .update(`${salt}:${day}:${ip}:${ua}`)
    .digest("hex")
    .slice(0, 16);
  const session = clip(body?.s, 24);
  // Per visitor (IP + browser): far above what one real browser sends (a view per
  // page, a ping every 30 s), so nothing real is dropped.
  if (!(await rateLimit("collect", visitor, { limit: 60, windowSec: 60 })).success) return ok();
  const p = await payload();

  // Still on the page: keep the session's latest view "alive" (no new row).
  if (body?.t === "ping") {
    if (session)
      await p.db.drizzle.execute(sql`
        update page_views set updated_at = now() where id = (
          select id from page_views where session = ${session} and visitor = ${visitor}
            and created_at > now() - interval '30 minutes'
          order by id desc limit 1)`);
    return ok();
  }

  const query = new URLSearchParams(clip(body?.q, 500));
  const referrer = externalReferrer(body?.r, ownHosts(request.headers, request.nextUrl.host));
  const { device, browser, os } = classify(ua);
  const country = visitorCountry(request.headers, body?.z);

  await p.db.drizzle.execute(sql`
    insert into page_views (path, locale, referrer, utm_source, utm_medium, utm_campaign, country, device, browser, os, visitor, session, created_at, updated_at)
    values (${path}, ${clip(body?.l, 5)}, ${referrer || null}, ${query.get("utm_source")?.slice(0, 80) ?? null},
            ${query.get("utm_medium")?.slice(0, 80) ?? null}, ${query.get("utm_campaign")?.slice(0, 120) ?? null},
            ${country || null}, ${device}, ${browser}, ${os}, ${visitor}, ${session || null}, now(), now())`);
  return ok();
}
