import { NextResponse, type NextRequest } from "next/server";
import { actingUser, can, type UserLike } from "@/access/roles";
import { audit } from "@/lib/audit";
import { payload } from "@/lib/cms/payload";
import { sameSiteHeaders } from "@/lib/live-edit/session";
import { toCsv } from "@/lib/privacy";
import { describe, LOG_CATEGORIES } from "@/features/office/logs";
import { filtersFrom, listLogs } from "@/features/office/logs-data";
import type { PayloadRequest } from "payload";

export const dynamic = "force-dynamic";

/** System logs as CSV (same filters as the page), readable sentences included. */
export async function GET(request: NextRequest) {
  const p = await payload();
  const { user } = await p.auth({ headers: sameSiteHeaders(request.headers) });
  if (!user || user.collection !== "users" || !can(actingUser(user as UserLike, request.headers), "audit.view"))
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const sp = Object.fromEntries(request.nextUrl.searchParams);
  const { entries } = await listLogs(filtersFrom(sp), 1, 5000);
  const rows = entries.map((e) => {
    const d = describe(e);
    return {
      at: e.at,
      category: LOG_CATEGORIES[d.category].label,
      who: d.actor,
      what: [d.verb, d.target, d.change ? `${d.change.from} → ${d.change.to}` : "", d.detail]
        .filter(Boolean)
        .join(" "),
      action: e.action,
      record: e.entity,
      recordId: e.entityId ?? "",
      network: e.ip ?? "",
      device: e.device ?? "",
    };
  });
  await audit({ payload: p, user, headers: request.headers, context: {} } as unknown as PayloadRequest, {
    action: "export.csv",
    entity: "audit-log",
    meta: { rows: rows.length },
  });
  return new NextResponse(toCsv(rows, Object.keys(rows[0] ?? { at: "" })), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="system-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
