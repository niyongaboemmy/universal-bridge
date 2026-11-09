import { NextResponse, type NextRequest } from "next/server";
import { isLocale, localizePath } from "@/i18n/routing";
import { requestContext } from "@/lib/forms/request-context";
import { rateLimit } from "@/lib/security/rate-limit";
import { siteUrl } from "@/lib/utils";
import { isPlatformId } from "@/features/vizulla/platforms";
import { downloadUrlFor } from "@/features/vizulla/releases";

export const dynamic = "force-dynamic";

/**
 * GET /api/vizulla/download/{platform}: sends the visitor to the latest Vizulla
 * installer for that platform (a fresh signed GitHub link each time). If the
 * release can't be reached, back to the page with a notice instead of an error.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;
  const lang = request.nextUrl.searchParams.get("locale") ?? "en";
  const back = (reason: string) =>
    NextResponse.redirect(
      siteUrl(
        `${localizePath("/vizulla-browser", isLocale(lang) ? lang : "en")}?download=${reason}`,
      ),
      303,
    );
  if (!isPlatformId(platform)) return back("unknown");
  const { ip } = await requestContext();
  const limit = await rateLimit("vizulla-download", ip, { limit: 20, windowSec: 600 });
  if (!limit.success) return back("busy");
  const url = await downloadUrlFor(platform);
  if (!url) return back("unavailable");
  return NextResponse.redirect(url, { status: 302, headers: { "cache-control": "no-store" } });
}
