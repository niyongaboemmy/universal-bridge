import { NextResponse, type NextRequest } from "next/server";
import { actingUser, can, type UserLike } from "@/access/roles";
import { realtimeVisitors } from "@/features/office/data";
import { payload } from "@/lib/cms/payload";
import { sameSiteHeaders } from "@/lib/live-edit/session";

export const dynamic = "force-dynamic";

// Company dashboard: visitors in the last 5 minutes (polled by the analytics page).
export async function GET(request: NextRequest) {
  const { user } = await (await payload()).auth({ headers: sameSiteHeaders(request.headers) });
  if (
    !user ||
    user.collection !== "users" ||
    !can(actingUser(user as UserLike, request.headers), "analytics.view")
  ) {
    return NextResponse.json({ error: "Sign in" }, { status: 401 });
  }
  return NextResponse.json(await realtimeVisitors(), { headers: { "cache-control": "no-store" } });
}
