import { draftMode } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { safePath } from "@/lib/live-edit/attrs";

export const dynamic = "force-dynamic";

// Leave live editing: back to the public (published) page.
export async function GET(request: NextRequest) {
  (await draftMode()).disable();
  return NextResponse.redirect(
    new URL(safePath(request.nextUrl.searchParams.get("path")), request.url),
  );
}
