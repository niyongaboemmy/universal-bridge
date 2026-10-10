import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Manual cache revalidation for content written outside Next.js (seed script,
 * migrations, imports). POST { tags: string[] } with Bearer REVALIDATE_SECRET.
 */
export async function POST(request: NextRequest) {
  if (
    !process.env.REVALIDATE_SECRET ||
    request.headers.get("authorization") !== `Bearer ${process.env.REVALIDATE_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { tags } = (await request.json().catch(() => ({}))) as { tags?: unknown };
  if (!Array.isArray(tags) || !tags.every((t) => typeof t === "string")) {
    return NextResponse.json({ error: "tags must be a string array" }, { status: 400 });
  }
  for (const tag of tags) revalidateTag(tag, "max");
  return NextResponse.json({ revalidated: tags });
}
