import "server-only";
import { hasRole, type Role } from "@/access/roles";
import { payload } from "@/lib/cms/payload";

/** Resolve the logged-in admin user from request headers (Payload cookie/JWT). */
export async function staffUser(headers: Headers, ...roles: Role[]) {
  const p = await payload();
  const { user } = await p.auth({ headers });
  if (!user || user.collection !== "users" || !hasRole(user as { roles?: Role[] }, ...roles))
    return null;
  return user;
}
