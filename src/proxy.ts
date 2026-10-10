import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { adminGate, readStaffToken } from "./lib/auth/admin-gate";
import { isLocale, routing } from "./i18n/routing";

// I18N-02/03: locale negotiation from Accept-Language + cookie, prefixes.
// Legacy 301s are declared in next.config.ts (they run before this proxy).
const negotiate = createMiddleware(routing);

// A deep link without a prefix is English by its URL, so a shared English link
// stays English even for someone who once chose Kinyarwanda. Their saved choice
// is left untouched; the page offers a one-tap switch instead (UI/UX audit P2-9).
const exact = createMiddleware({ ...routing, localeDetection: false, localeCookie: false });

// Maintenance mode (Settings → Website), checked at most every 15 s per server.
let maintenance: { on: boolean; at: number } = { on: false, at: 0 };
async function inMaintenance(request: NextRequest) {
  if (Date.now() - maintenance.at < 15_000) return maintenance.on;
  maintenance.at = Date.now();
  try {
    const res = await fetch(new URL("/api/system/status", request.url), {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    maintenance = { on: Boolean(((await res.json()) as { maintenance?: boolean }).maintenance), at: Date.now() };
  } catch {
    // Keep the last known state.
  }
  return maintenance.on;
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // One sign-in page for the office and the CMS.
  if (pathname === "/admin/login" || pathname === "/admin/login/") {
    const url = new URL("/login", request.url);
    const next = request.nextUrl.searchParams.get("redirect");
    if (next) url.searchParams.set("next", next);
    for (const k of ["sso"]) {
      const v = request.nextUrl.searchParams.get(k);
      if (v) url.searchParams.set(k, v);
    }
    return NextResponse.redirect(url);
  }
  // Admin and API: staff MFA gate (ADM-01). Staff pages (/staff/*) are not localised.
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return (await adminGate(request)) ?? NextResponse.next();
  }
  // Staff screens (sign-in, two-step verification, the office) are not localised.
  if (pathname === "/office" || pathname.startsWith("/office/"))
    return (await adminGate(request)) ?? NextResponse.next();
  if (pathname.startsWith("/staff") || pathname === "/login" || pathname === "/maintenance")
    return NextResponse.next();
  // Visitors get the holding page while maintenance is on; signed-in staff see the site.
  if ((await inMaintenance(request)) && !(await readStaffToken(request))) {
    return NextResponse.rewrite(new URL("/maintenance", request.url), {
      status: 503,
      headers: { "retry-after": "1800" },
    });
  }
  const prefixed = isLocale(pathname.split("/")[1] ?? "");
  // "/" (typed or bookmarked home) and prefixed URLs: negotiate and remember as before.
  return pathname === "/" || prefixed ? negotiate(request) : exact(request);
}

export const config = {
  // Everything except Next internals, feeds and files with an extension. Admin and
  // API pass through the staff gate only; everything else is localised.
  matcher: ["/((?!icons|apple-icon|feed.xml|llms|_next|_vercel|.*\\..*).*)", "/api/:path*"],
};
