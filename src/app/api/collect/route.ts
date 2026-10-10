import { createHash } from "node:crypto";
import { sql } from "@payloadcms/db-postgres";
import { NextResponse, type NextRequest } from "next/server";
import { BOT, classify } from "@/lib/analytics/ua";
import { payload } from "@/lib/cms/payload";
import { rateLimit } from "@/lib/security/rate-limit";

export const dynamic = "force-dynamic";

const ok = () => new NextResponse(null, { status: 204 });
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");

/**
 * Page-view beacon (consent only, see lib/analytics/track). Stores the path,
 * referrer host, campaign tags, country, device class and a visitor hash that
 * changes daily (salted IP + browser) so nobody can be followed across days.
 * Bots, staff sessions and other sites' requests are ignored.
 */
export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua) || request.cookies.has("payload-token")) return ok();
  if (request.headers.get("sec-fetch-site") === "cross-site") return ok();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  if (!(await rateLimit("collect", ip, { limit: 120, windowSec: 60 })).success) return ok();

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const path = clip(body?.p, 300);
  if (
    !path.startsWith("/") ||
    path.startsWith("/admin") ||
    path.startsWith("/office") ||
    path.startsWith("/api")
  )
    return ok();

  const query = new URLSearchParams(clip(body?.q, 500));
  let referrer = "";
  try {
    const r = new URL(clip(body?.r, 500));
    if (r.host !== request.nextUrl.host) referrer = r.hostname.replace(/^www\./, "");
  } catch {
    referrer = "";
  }
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.RATE_LIMIT_SALT ?? process.env.PAYLOAD_SECRET ?? "dev";
  const visitor = createHash("sha256")
    .update(`${salt}:${day}:${ip}:${ua}`)
    .digest("hex")
    .slice(0, 16);
  const { device, browser, os } = classify(ua);
  const country = (
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    ""
  )
    .slice(0, 2)
    .toUpperCase();

  const p = await payload();
  await p.db.drizzle.execute(sql`
    insert into page_views (path, locale, referrer, utm_source, utm_medium, utm_campaign, country, device, browser, os, visitor, session, created_at, updated_at)
    values (${path}, ${clip(body?.l, 5)}, ${referrer || null}, ${query.get("utm_source")?.slice(0, 80) ?? null},
            ${query.get("utm_medium")?.slice(0, 80) ?? null}, ${query.get("utm_campaign")?.slice(0, 120) ?? null},
            ${country || null}, ${device}, ${browser}, ${os}, ${visitor}, ${clip(body?.s, 24) || null}, now(), now())`);
  return ok();
}
