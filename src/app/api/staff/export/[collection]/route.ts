import { NextResponse, type NextRequest } from "next/server";
import type { PayloadRequest, Where } from "payload";
import { audit } from "@/lib/audit";
import { payload } from "@/lib/cms/payload";
import { toCsv } from "@/lib/privacy";

export const dynamic = "force-dynamic";

/**
 * ADM-06 CSV export: role-restricted (the collection's own read access applies,
 * so each role exports only what it can see) and logged in the audit log.
 * Filters: ?status=…&from=YYYY-MM-DD&to=YYYY-MM-DD (&type=… for applications).
 */
const EXPORTS = {
  leads: [
    "ref",
    "createdAt",
    "status",
    "department",
    "name",
    "email",
    "phone",
    "company",
    "country",
    "services",
    "budgetRange",
    "timeline",
    "source",
    "message",
    "consent.marketing",
    "tracking.utm",
    "tracking.referrer",
    "firstResponseAt",
  ],
  applications: [
    "ref",
    "createdAt",
    "type",
    "status",
    "subject",
    "name",
    "email",
    "phone",
    "data",
    "consent.at",
    "firstResponseAt",
  ],
  subscribers: ["email", "locale", "createdAt", "confirmedAt", "unsubscribedAt"],
} as const;

type Exportable = keyof typeof EXPORTS;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ collection: string }> },
) {
  const collection = (await params).collection as Exportable;
  if (!(collection in EXPORTS))
    return NextResponse.json({ error: "Not exportable" }, { status: 404 });
  const p = await payload();
  const { user } = await p.auth({ headers: request.headers });
  if (!user || user.collection !== "users")
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const q = request.nextUrl.searchParams;
  const and: Where[] = [];
  if (q.get("status")) and.push({ status: { equals: q.get("status") } });
  if (q.get("type") && collection === "applications") and.push({ type: { equals: q.get("type") } });
  if (q.get("from"))
    and.push({ createdAt: { greater_than_equal: new Date(q.get("from")!).toISOString() } });
  if (q.get("to"))
    and.push({
      createdAt: {
        less_than: new Date(new Date(q.get("to")!).getTime() + 86_400_000).toISOString(),
      },
    });

  let docs: Record<string, unknown>[];
  try {
    const res = await p.find({
      collection,
      where: and.length ? { and } : undefined,
      limit: 0,
      pagination: false,
      depth: 0,
      sort: "-createdAt",
      overrideAccess: false,
      user,
    });
    docs = res.docs as unknown as Record<string, unknown>[];
  } catch {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const req = { payload: p, user, context: {} } as unknown as PayloadRequest;
  await audit(req, {
    action: "export.csv",
    entity: collection,
    meta: { rows: docs.length, filters: Object.fromEntries(q) },
  });

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse("﻿" + toCsv(docs, [...EXPORTS[collection]]), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="ub-${collection}-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
