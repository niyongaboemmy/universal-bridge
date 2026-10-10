import { NextResponse, type NextRequest } from "next/server";
import { localizePath, isLocale } from "@/i18n/routing";
import { normaliseCode } from "@/lib/certificates/lookup";

// GET form target (works without JavaScript): /academy/verify/check?code=… → /academy/verify/CODE
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const code = normaliseCode(request.nextUrl.searchParams.get("code") ?? "")
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 32);
  const path = code ? `/academy/verify/${encodeURIComponent(code)}` : "/academy/verify";
  return NextResponse.redirect(
    new URL(localizePath(path, isLocale(locale) ? locale : "en"), request.url),
    303,
  );
}
