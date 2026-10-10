import "server-only";
import { draftMode, headers } from "next/headers";
import { cache } from "react";
import { hasRole, type Role } from "@/access/roles";
import { payload } from "@/lib/cms/payload";
import type { EditRef } from "./attrs";

/** Roles that may edit pages and content on the live site. */
export const LIVE_EDIT_ROLES: Role[] = ["editor", "academy", "hr", "sales"];

/**
 * The live-edit session for this request: draft mode on AND a signed-in staff
 * member with an editing role. Cached per request (React cache), so every
 * component can ask without extra cost. Visitors never get here: without the
 * draft-mode cookie pages are static and this returns null immediately.
 */
export const liveEditSession = cache(async () => {
  let enabled = false;
  try {
    enabled = (await draftMode()).isEnabled;
  } catch {
    return null; // build time
  }
  if (!enabled) return null;
  const p = await payload();
  const { user } = await p.auth({ headers: await headers() });
  if (
    !user ||
    user.collection !== "users" ||
    !hasRole(user as { roles?: Role[] }, ...LIVE_EDIT_ROLES)
  )
    return null;
  return { user: user as { id: number; email: string; name?: string; roles?: Role[] } };
});

/** Root reference for a document, or undefined when not editing. */
export async function docRef(
  collection: string,
  doc:
    { id?: string | number; updatedAt?: string | null; _status?: string | null } | null | undefined,
  locale: string,
): Promise<EditRef | undefined> {
  if (doc?.id === undefined || !(await liveEditSession())) return undefined;
  return {
    collection,
    id: doc.id,
    locale,
    path: "",
    version: doc.updatedAt ?? undefined,
    status: doc._status ?? undefined,
  };
}
