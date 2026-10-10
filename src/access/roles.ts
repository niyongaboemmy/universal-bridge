import type { Access, FieldAccess } from "payload";

// SRS §3.2 user classes.
export const ROLES = ["super", "editor", "academy", "hr", "sales"] as const;
export type Role = (typeof ROLES)[number];

type UserLike = { roles?: Role[] | null } | null | undefined;

export function hasRole(user: UserLike, ...roles: Role[]): boolean {
  if (!user?.roles) return false;
  return user.roles.includes("super") || roles.some((role) => user.roles!.includes(role));
}

export const isSuper: Access = ({ req }) => hasRole(req.user as UserLike, "super");
export const isLoggedIn: Access = ({ req }) => Boolean(req.user);
export const anyone: Access = () => true;
export const nobody: Access = () => false;

/** Access for a role (super always passes). */
export const roleAccess =
  (...roles: Role[]): Access =>
  ({ req }) =>
    hasRole(req.user as UserLike, ...roles);

/** Public can read only published documents; editors see drafts. */
export const publishedOrEditor: Access = ({ req }) => {
  if (hasRole(req.user as UserLike, "editor", "academy", "hr", "sales")) return true;
  return { _status: { equals: "published" } };
};

export const superFieldOnly: FieldAccess = ({ req }) => hasRole(req.user as UserLike, "super");
