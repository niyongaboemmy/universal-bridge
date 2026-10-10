import { NextResponse, type NextRequest } from "next/server";
import { payload } from "@/lib/cms/payload";
import { cronAuthorized, runRetention } from "@/lib/privacy";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// SRS §11: monthly purge of expired personal data (vercel.json, 03:00 on the 1st).
// `?dry=1` reports what would be removed without deleting anything.
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const report = await runRetention(await payload(), {
    dryRun: request.nextUrl.searchParams.get("dry") === "1",
  });
  return NextResponse.json(report);
}
