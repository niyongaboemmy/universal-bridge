import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { adminGate } from "./lib/auth/admin-gate";
import { isLocale, routing } from "./i18n/routing";

// I18N-02/03: locale negotiation from Accept-Language + cookie, prefixes.
// Legacy 301s are declared in next.config.ts (they run before this proxy).
const negotiate = createMiddleware(routing);

// A deep link without a prefix is English by its URL, so a shared English link
// stays English even for someone who once chose Kinyarwanda. Their saved choice
// is left untouched; the page offers a one-tap switch instead (UI/UX audit P2-9).
const exact = createMiddleware({ ...routing, localeDetection: false, localeCookie: false });

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Admin and API: staff MFA gate (ADM-01). Staff pages (/staff/*) are not localised.
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return (await adminGate(request)) ?? NextResponse.next();
  }
  if (pathname.startsWith("/staff")) return NextResponse.next();
  const prefixed = isLocale(pathname.split("/")[1] ?? "");
  // "/" (typed or bookmarked home) and prefixed URLs: negotiate and remember as before.
  return pathname === "/" || prefixed ? negotiate(request) : exact(request);
}

export const config = {
  // Everything except Next internals, feeds and files with an extension. Admin and
  // API pass through the staff gate only; everything else is localised.
  matcher: ["/((?!icons|apple-icon|feed.xml|llms|_next|_vercel|.*\\..*).*)", "/api/:path*"],
};
