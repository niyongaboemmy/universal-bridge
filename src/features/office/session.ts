import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { Permission } from "@/access/permissions";
import { actingUser, can as holds, roleSlugs } from "@/access/roles";
import { payload } from "@/lib/cms/payload";
import { sameSiteHeaders } from "@/lib/live-edit/session";
import type { Avatar, Role as RoleDoc } from "@/payload-types";

export type OfficeUser = {
  id: number;
  email: string;
  name?: string;
  jobTitle?: string | null;
  phone?: string | null;
  landing?: "office" | "cms" | null;
  avatar?: number | Avatar | null;
  roles?: (number | RoleDoc)[];
  lastLoginAt?: string | null;
  collection: "users";
  /** Every role the person has (`roles` holds only the active one while switched). */
  allRoles?: RoleDoc[];
  /** The role they are working as, when they switched to one. */
  actingRole?: RoleDoc | null;
};

/** Areas of the office and the permissions that open them (any one is enough). */
export const AREAS = {
  overview: ["office.overview"],
  requests: ["requests.view", "requests.manage"],
  demos: ["demos.view", "demos.manage"],
  messages: ["messages.view", "messages.manage"],
  applicants: [
    "applicants.academy",
    "applicants.internship",
    "applicants.job",
    "applicants.partner",
    "applicants.event",
  ],
  openings: ["openings.view", "openings.manage"],
  projects: ["projects.view", "projects.manage"],
  people: ["people.view", "people.manage"],
  analytics: ["analytics.view"],
  users: ["users.manage", "members.manage"],
  roles: ["roles.manage"],
  settings: ["settings.manage"],
  audit: ["audit.view"],
  cms: ["cms.access"],
} satisfies Record<string, Permission[]>;
export type Area = keyof typeof AREAS;

/** May the user open this area of the office? */
export function can(user: OfficeUser | null, area: Area) {
  return holds(user as never, ...AREAS[area]);
}

/** Does the user hold this exact permission? */
export function allowed(user: OfficeUser | null, ...perms: Permission[]) {
  return holds(user as never, ...perms);
}

export const roleNames = (user: OfficeUser) =>
  (user.roles ?? [])
    .map((r) => (typeof r === "object" ? r.name : null))
    .filter(Boolean)
    .join(", ") || roleSlugs(user as never).join(", ");

/** The signed-in staff member (per request), or a redirect to sign in. */
export const officeUser = cache(async (): Promise<OfficeUser> => {
  const p = await payload();
  const h = await headers();
  const { user } = await p.auth({ headers: sameSiteHeaders(h) });
  if (!user || user.collection !== "users") redirect("/login?next=%2Foffice");
  const full = user as unknown as OfficeUser;
  const all = (full.roles ?? []).filter((r): r is RoleDoc => typeof r === "object");
  const acting = actingUser(full, h);
  return {
    ...acting,
    allRoles: all,
    actingRole: acting.roles !== full.roles ? ((acting.roles?.[0] as RoleDoc) ?? null) : null,
  };
});

export async function requireArea(area: Area) {
  const user = await officeUser();
  if (!can(user, area)) redirect("/office?denied=" + area);
  return user;
}

export async function requirePermission(...perms: Permission[]) {
  const user = await officeUser();
  if (!allowed(user, ...perms)) redirect("/office?denied=" + perms[0]);
  return user;
}
