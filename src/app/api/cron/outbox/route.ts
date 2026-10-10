import { NextResponse, type NextRequest } from "next/server";
import { payload } from "@/lib/cms/payload";
import { processOutbox } from "@/lib/outbox";
import { cronAuthorized } from "@/lib/privacy";

export const dynamic = "force-dynamic";

// Vercel Cron calls this every minute with `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: NextRequest) {
  // No secret configured means no access (never "Bearer undefined").
  if (!cronAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const summary = await processOutbox(await payload());
  return NextResponse.json(summary);
}
