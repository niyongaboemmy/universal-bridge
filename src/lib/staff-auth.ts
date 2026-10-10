import "server-only";
import type { Permission } from "@/access/permissions";
import { actingUser, can, type UserLike } from "@/access/roles";
import { payload } from "@/lib/cms/payload";

/** Resolve the logged-in admin user from request headers (Payload cookie/JWT). */
export async function staffUser(headers: Headers, ...perms: Permission[]) {
  const p = await payload();
  const { user } = await p.auth({ headers });
  if (!user || user.collection !== "users" || !can(actingUser(user as UserLike, headers), ...perms))
    return null;
  return user;
}
