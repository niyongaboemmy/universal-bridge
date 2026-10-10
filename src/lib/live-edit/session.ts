import "server-only";
import { draftMode, headers } from "next/headers";
import { cache } from "react";
import { actingUser, can, type UserLike } from "@/access/roles";
import { payload } from "@/lib/cms/payload";
import type { EditRef } from "./attrs";

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
  const h = await headers();
  const { user } = await p.auth({ headers: h });
  if (
    !user ||
    user.collection !== "users" ||
    !can(actingUser(user as UserLike, h), "content.liveEdit")
  )
    return null;
  return { user: user as { id: number; email: string; name?: string } };
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

/**
 * Headers for checking the staff session on a live-edit API call. Payload only
 * accepts the session cookie when Origin matches NEXT_PUBLIC_SITE_URL, which
 * fails when the site is reached on another host name (www vs apex, a preview
 * URL). For requests the browser itself marks as same-origin the Origin header
 * is dropped, so Payload's own Sec-Fetch-Site check applies; cross-site requests
 * keep their Origin and are refused as before.
 */
export function sameSiteHeaders(headers: Headers): Headers {
  if (headers.get("sec-fetch-site") !== "same-origin") return headers;
  const h = new Headers(headers);
  h.delete("origin");
  return h;
}
