import type { PayloadRequest } from "payload";
import type { Permission } from "@/access/permissions";
import { can, type UserLike } from "@/access/roles";

type Notice = {
  kind:
    | "request"
    | "demo"
    | "message"
    | "application"
    | "assignment"
    | "opening"
    | "project"
    | "account"
    | "system";
  title: string;
  body?: string | null;
  href?: string | null;
};

/** Notify one staff member (inside the caller's transaction). */
export async function notifyUser(req: PayloadRequest, userId: number, n: Notice) {
  await req.payload.create({
    collection: "notifications",
    overrideAccess: true,
    req,
    data: { user: userId, ...n, body: n.body?.slice(0, 240) ?? null },
  });
}

/** Notify everyone whose roles hold any of the permissions (super admins included). */
export async function notifyPermission(
  req: PayloadRequest,
  perms: Permission[],
  n: Notice,
  { except }: { except?: number } = {},
) {
  const staff = await req.payload.find({
    collection: "users",
    depth: 1,
    limit: 500,
    pagination: false,
    overrideAccess: true,
    req,
  });
  for (const u of staff.docs) {
    if (u.id === except || !can(u as UserLike, ...perms)) continue;
    await notifyUser(req, u.id as number, n);
  }
}
