import { NextResponse, type NextRequest } from "next/server";
import { actingUser, type UserLike } from "@/access/roles";
import { deepSearch } from "@/features/office/search";
import { payload } from "@/lib/cms/payload";
import { sameSiteHeaders } from "@/lib/live-edit/session";

export const dynamic = "force-dynamic";

/**
 * Office search (command palette and the search page): every record type and the
 * website content, deep inside messages, answers and notes, limited to what the
 * person's (active) role may open.
 */
export async function GET(request: NextRequest) {
  const p = await payload();
  const { user } = await p.auth({ headers: sameSiteHeaders(request.headers) });
  if (!user || user.collection !== "users")
    return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 120);
  if (q.length < 2) return NextResponse.json({ results: [] });
  const results = await deepSearch(actingUser(user as UserLike, request.headers), q);
  return NextResponse.json({ results }, { headers: { "cache-control": "no-store" } });
}
