import { NextResponse, type NextRequest } from "next/server";
import { actingUser, type UserLike } from "@/access/roles";
import { upcomingFor } from "@/features/office/notifications";
import { payload } from "@/lib/cms/payload";
import { sameSiteHeaders } from "@/lib/live-edit/session";

export const dynamic = "force-dynamic";

async function staff(request: NextRequest) {
  const p = await payload();
  const { user } = await p.auth({ headers: sameSiteHeaders(request.headers) });
  if (!user || user.collection !== "users") return null;
  return { p, user: actingUser(user as UserLike & { id: number }, request.headers) as UserLike & { id: number } };
}

/** The bell: latest notifications, the unread count and what's coming up. */
export async function GET(request: NextRequest) {
  const s = await staff(request);
  if (!s) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const [list, unread, upcoming] = await Promise.all([
    s.p.find({
      collection: "notifications",
      where: { user: { equals: s.user.id } },
      sort: "-createdAt",
      limit: 30,
      depth: 0,
      overrideAccess: true,
    }),
    s.p.count({
      collection: "notifications",
      where: { user: { equals: s.user.id }, readAt: { exists: false } },
      overrideAccess: true,
    }),
    upcomingFor(s.user),
  ]);
  return NextResponse.json(
    {
      unread: unread.totalDocs,
      items: list.docs.map((n) => ({
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        href: n.href,
        read: Boolean(n.readAt),
        at: n.createdAt,
      })),
      upcoming,
    },
    { headers: { "cache-control": "no-store" } },
  );
}

/** Mark as read: `{ ids: number[] }` or `{ all: true }`. */
export async function POST(request: NextRequest) {
  const s = await staff(request);
  if (!s) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { ids?: number[]; all?: boolean };
  const ids = Array.isArray(body.ids) ? body.ids.filter((n) => Number.isInteger(n)).slice(0, 200) : [];
  if (!body.all && !ids.length) return NextResponse.json({ ok: true });
  await s.p.update({
    collection: "notifications",
    where: {
      and: [
        { user: { equals: s.user.id } },
        { readAt: { exists: false } },
        ...(body.all ? [] : [{ id: { in: ids } }]),
      ],
    },
    data: { readAt: new Date().toISOString() },
    overrideAccess: true,
  });
  return NextResponse.json({ ok: true });
}
