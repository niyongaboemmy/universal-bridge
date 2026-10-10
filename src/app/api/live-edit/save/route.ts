import { NextResponse, type NextRequest } from "next/server";
import type { PayloadRequest } from "payload";
import { hasRole, type Role } from "@/access/roles";
import { audit } from "@/lib/audit";
import { payload } from "@/lib/cms/payload";
import { LiveEditError, publishDoc, saveDraft, type Change } from "@/lib/live-edit/apply";
import { LIVE_EDIT_ROLES } from "@/lib/live-edit/session";

export const dynamic = "force-dynamic";

/**
 * CMS-07 live editing: POST { changes: Change[], base: { "c|id|l": updatedAt },
 * publish?: ["c|id|l"], force?: boolean }. Changes are grouped per document and
 * saved as drafts; listed documents are then published.
 */
export async function POST(request: NextRequest) {
  const p = await payload();
  const { user } = await p.auth({ headers: request.headers });
  if (
    !user ||
    user.collection !== "users" ||
    !hasRole(user as { roles?: Role[] }, ...LIVE_EDIT_ROLES)
  ) {
    return NextResponse.json({ error: "Sign in to edit" }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as {
    changes?: Change[];
    base?: Record<string, string>;
    publish?: string[];
    force?: boolean;
  } | null;
  if (!body || !Array.isArray(body.changes ?? []) || (body.changes?.length ?? 0) > 200) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const req = { payload: p, user, context: {} } as unknown as PayloadRequest;
  const groups = new Map<string, Change[]>();
  for (const ch of body.changes ?? []) {
    if (!ch || typeof ch.p !== "string" || typeof ch.c !== "string")
      return NextResponse.json({ error: "Invalid change" }, { status: 400 });
    const key = `${ch.c}|${ch.id}|${ch.l}`;
    groups.set(key, [...(groups.get(key) ?? []), ch]);
  }
  const docs: Record<string, { updatedAt: string; status: string }> = {};
  let reload = false;
  try {
    for (const [key, list] of groups) {
      const r = await saveDraft(req, list, { base: body.base?.[key], force: body.force });
      docs[key] = r;
      reload ||= r.reload;
      await audit(req, {
        action: "live-edit.save",
        entity: list[0]!.c,
        entityId: list[0]!.id,
        meta: { locale: list[0]!.l, fields: list.map((c) => c.p) },
      });
    }
    for (const key of body.publish ?? []) {
      const [c, id, l] = key.split("|");
      if (!c || !id || !l) continue;
      docs[key] = await publishDoc(req, { c, id, l });
      await audit(req, {
        action: "live-edit.publish",
        entity: c,
        entityId: id,
        meta: { locale: l },
      });
    }
  } catch (error) {
    if (error instanceof LiveEditError)
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    const status = (error as { status?: number }).status;
    if (status === 403)
      return NextResponse.json(
        { error: "You don't have permission to change this." },
        { status: 403 },
      );
    p.logger.error({ msg: "Live edit failed", error: String(error) });
    return NextResponse.json(
      { error: (error as Error).message || "Saving failed" },
      { status: status && status < 500 ? status : 500 },
    );
  }
  return NextResponse.json({ docs, reload });
}
