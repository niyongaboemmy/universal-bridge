import type { Access, FieldAccess } from "payload";
import type { Permission } from "./permissions";

// Built-in staff role slugs (SRS §3.2). More roles can be created in the office.
export const ROLES = ["super", "editor", "academy", "hr", "sales"] as const;
export type Role = (typeof ROLES)[number];

/** A role as stored on a user: populated (auth depth 1), a bare id, or a slug (tests, seeds). */
type RoleRef =
  | number
  | string
  | { slug?: string | null; permissions?: readonly string[] | null; name?: string | null };
export type UserLike =
  { roles?: readonly RoleRef[] | null; role?: RoleRef | null } | null | undefined;

/** Staff have `roles`; members have a single `role`. */
const refs = (user: UserLike): RoleRef[] => [
  ...(user?.roles ?? []),
  ...(user?.role != null ? [user.role] : []),
];

export function roleSlugs(user: UserLike): string[] {
  return refs(user)
    .map((r) => (typeof r === "object" && r ? r.slug : typeof r === "string" ? r : undefined))
    .filter((s): s is string => Boolean(s));
}

export function isSuperUser(user: UserLike) {
  return roleSlugs(user).includes("super");
}

/** True when the user has any of the roles (super always passes). */
export function hasRole(user: UserLike, ...roles: string[]): boolean {
  const slugs = roleSlugs(user);
  return slugs.includes("super") || roles.some((role) => slugs.includes(role));
}

/** Every permission the user holds through their roles. */
export function permissionsOf(user: UserLike): Set<string> {
  const out = new Set<string>();
  for (const r of refs(user))
    if (typeof r === "object" && r) for (const p of r.permissions ?? []) out.add(p);
  return out;
}

/** True when the user holds any of the permissions. Super admins hold all of them. */
export function can(user: UserLike, ...perms: Permission[]): boolean {
  if (!user) return false;
  if (isSuperUser(user)) return true;
  const held = permissionsOf(user);
  return perms.some((p) => held.has(p));
}

/** Cookie holding "userId:roleId" while someone with several roles works as one of them. */
export const ACT_COOKIE = "ub-act";

function cookieValue(headers: Headers | undefined | null, name: string) {
  const raw = headers?.get?.("cookie");
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

const refId = (r: RoleRef) => (typeof r === "object" && r ? (r as { id?: number }).id : r);

/**
 * The user as they are working right now: with the role switcher set, only that one
 * role counts (permissions shrink, never grow — a forged cookie can't add anything).
 */
export function actingUser<T extends UserLike>(user: T, headers?: Headers | null): T {
  if (!user?.roles || user.roles.length < 2) return user;
  const v = cookieValue(headers, ACT_COOKIE);
  if (!v) return user;
  const [uid, rid] = v.split(":");
  if (String((user as { id?: unknown }).id) !== uid) return user;
  const only = user.roles.filter((r) => String(refId(r)) === rid);
  return only.length ? ({ ...user, roles: only } as T) : user;
}

const acting = (req: { user?: unknown; headers?: Headers }) =>
  actingUser(req.user as UserLike, req.headers);

export const isSuper: Access = ({ req }) => isSuperUser(acting(req));
export const isLoggedIn: Access = ({ req }) => Boolean(req.user);
export const anyone: Access = () => true;
export const nobody: Access = () => false;

/** Staff (not members) holding any of the permissions. */
export const allow =
  (...perms: Permission[]): Access =>
  ({ req }) =>
    req.user?.collection === "users" && can(acting(req), ...perms);

/** Public can read only published documents; staff with any content permission see drafts. */
export const publishedOrEditor: Access = ({ req }) => {
  if (req.user?.collection === "users") return true;
  return { _status: { equals: "published" } };
};

export const superFieldOnly: FieldAccess = ({ req }) => isSuperUser(acting(req));
export const allowField =
  (...perms: Permission[]): FieldAccess =>
  ({ req }) =>
    req.user?.collection === "users" && can(acting(req), ...perms);

/** For custom access functions: the request's user with the role switcher applied. */
export { acting as actingFromReq };
