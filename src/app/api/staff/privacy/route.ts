import { NextResponse, type NextRequest } from "next/server";
import type { PayloadRequest } from "payload";
import { actingUser, can, type UserLike } from "@/access/roles";
import { audit } from "@/lib/audit";
import { payload } from "@/lib/cms/payload";
import { sameSiteHeaders } from "@/lib/live-edit/session";
import { emailRef, erasePerson, findPerson } from "@/lib/privacy";

export const dynamic = "force-dynamic";

/**
 * ADM-09 / PRV-05 data-subject requests, super admins only.
 * GET ?email=…            → what we hold (summary)
 * GET ?email=…&download=1 → full export as JSON (access request)
 * POST {email, confirm}   → erase (confirm must repeat the email)
 */
async function superUser(request: NextRequest) {
  const p = await payload();
  const { user } = await p.auth({ headers: sameSiteHeaders(request.headers) });
  if (
    !user ||
    user.collection !== "users" ||
    !can(actingUser(user as UserLike, request.headers), "privacy.manage")
  )
    return null;
  return { p, req: { payload: p, user, context: {} } as unknown as PayloadRequest };
}

const validEmail = (e: unknown): e is string =>
  typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export async function GET(request: NextRequest) {
  const s = await superUser(request);
  if (!s) return NextResponse.json({ error: "Super admins only" }, { status: 403 });
  const email = request.nextUrl.searchParams.get("email");
  if (!validEmail(email))
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  const found = await findPerson(s.p, email);
  const download = request.nextUrl.searchParams.get("download") === "1";
  await audit(s.req, {
    action: download ? "privacy.export" : "privacy.lookup",
    entity: "privacy",
    meta: { ref: emailRef(email) },
  });
  if (download) {
    return new NextResponse(JSON.stringify(found, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="data-request-${emailRef(email)}.json"`,
        "cache-control": "no-store",
      },
    });
  }
  return NextResponse.json({
    email: found.email,
    leads: found.leads.map((d) => ({
      id: d.id,
      ref: d.ref,
      createdAt: d.createdAt,
      status: d.status,
    })),
    applications: found.applications.map((d) => ({
      id: d.id,
      ref: d.ref,
      type: d.type,
      createdAt: d.createdAt,
      status: d.status,
    })),
    subscribers: found.subscribers.length,
    files: found.files.length,
    outbox: found.outbox.length,
    certificates: found.certificates.length,
  });
}

export async function POST(request: NextRequest) {
  const s = await superUser(request);
  if (!s) return NextResponse.json({ error: "Super admins only" }, { status: 403 });
  const body = (await request.json().catch(() => ({}))) as { email?: unknown; confirm?: unknown };
  if (!validEmail(body.email))
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  if (
    String(body.confirm ?? "")
      .trim()
      .toLowerCase() !== body.email.trim().toLowerCase()
  ) {
    return NextResponse.json({ error: "Type the email again to confirm" }, { status: 400 });
  }
  return NextResponse.json(await erasePerson(s.req, body.email));
}
