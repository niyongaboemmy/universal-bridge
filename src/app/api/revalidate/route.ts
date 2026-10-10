import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Manual cache revalidation for content written outside Next.js (seed script,
 * migrations, imports, deploys). POST { tags: string[], expire?: boolean } with
 * Bearer REVALIDATE_SECRET. `expire: true` never serves the stale copy: a deploy
 * uses it with the "cms" tag to drop pages prerendered from the build database.
 */
export async function POST(request: NextRequest) {
  if (
    !process.env.REVALIDATE_SECRET ||
    request.headers.get("authorization") !== `Bearer ${process.env.REVALIDATE_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { tags, expire } = (await request.json().catch(() => ({}))) as {
    tags?: unknown;
    expire?: unknown;
  };
  if (!Array.isArray(tags) || !tags.every((t) => typeof t === "string")) {
    return NextResponse.json({ error: "tags must be a string array" }, { status: 400 });
  }
  for (const tag of tags) revalidateTag(tag, expire === true ? { expire: 0 } : "max");
  return NextResponse.json({ revalidated: tags });
}
