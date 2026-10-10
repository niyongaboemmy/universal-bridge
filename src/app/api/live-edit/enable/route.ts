import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { hasRole, type Role } from "@/access/roles";
import { payload } from "@/lib/cms/payload";
import { safePath } from "@/lib/live-edit/attrs";
import { LIVE_EDIT_ROLES } from "@/lib/live-edit/session";

export const dynamic = "force-dynamic";

// CMS-07: turn on live editing for this browser (draft mode) and open the page.
export async function GET(request: NextRequest) {
  const path = safePath(request.nextUrl.searchParams.get("path"));
  const { user } = await (await payload()).auth({ headers: request.headers });
  if (
    !user ||
    user.collection !== "users" ||
    !hasRole(user as { roles?: Role[] }, ...LIVE_EDIT_ROLES)
  ) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("redirect", `/api/live-edit/enable?path=${encodeURIComponent(path)}`);
    return NextResponse.redirect(login);
  }
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(path, request.url));
}
