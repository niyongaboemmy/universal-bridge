import "server-only";
import { headers } from "next/headers";
import { payload } from "@/lib/cms/payload";
import { sameSiteHeaders } from "@/lib/live-edit/session";
import type { Member } from "@/payload-types";

/** The signed-in website member for this request, or null (staff sessions don't count). */
export async function currentMember(): Promise<Member | null> {
  const p = await payload();
  const { user } = await p.auth({ headers: sameSiteHeaders(await headers()) });
  return user?.collection === "members" ? (user as unknown as Member) : null;
}
