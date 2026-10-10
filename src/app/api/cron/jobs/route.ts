import { NextResponse, type NextRequest } from "next/server";
import { payload } from "@/lib/cms/payload";
import { cronAuthorized } from "@/lib/privacy";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// CMS-06: runs Payload's job queue (scheduled publish/unpublish) every five minutes.
export async function GET(request: NextRequest) {
  if (!cronAuthorized(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await (await payload()).jobs.run({ allQueues: true, limit: 50 });
  return NextResponse.json({ ok: true, ...(result ?? {}) });
}
