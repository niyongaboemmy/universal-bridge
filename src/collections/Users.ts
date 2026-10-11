import { APIError, type CollectionConfig, type PayloadRequest } from "payload";
import type { FieldAccess } from "payload";
import { allow, allowField, can, isSuperUser, superFieldOnly, actingFromReq } from "@/access/roles";
import { audit } from "@/lib/audit";
import { passwordProblem } from "@/lib/auth/password";
import { roleIds } from "./Roles";
import { secureCookies } from "@/lib/auth/secure-cookies";

function clientIp(req: PayloadRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

const noField: FieldAccess = () => false;
const ids = (roles: unknown) =>
  (Array.isArray(roles) ? roles : [])
    .map((r) => (typeof r === "object" && r ? (r as { id: number }).id : r))
    .sort();

// Two-step verification fields stay out of the admin until MFA is switched on (MFA_ENFORCEMENT).
const mfaHidden = !["required", "enrolled"].includes(process.env.MFA_ENFORCEMENT ?? "");

/** Fields only the server touches (MFA secrets): never readable or writable over the API. */
const secretField = {
  hidden: true,
  access: { read: noField, create: noField, update: noField },
} as const;

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
    group: "Settings",
    defaultColumns: ["name", "email", "roles"],
    description:
      "Staff accounts. New accounts get an email to set their password; two-step verification is set up at first sign-in.",
  },
  auth: {
    // Roles (and their permissions) are loaded with the signed-in user.
    depth: 1,
    // NFR-SEC-05: 8 h session, lockout after repeated failures.
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: { sameSite: "Lax", secure: secureCookies() },
    // Branded emails (src/emails/account.tsx). The same Payload operation sends both the
    // invitation (from the outbox, context.invite) and "forgot password". Expiration is
    // set per call: 1 hour for a reset, 3 days for an invitation.
    forgotPassword: {
      generateEmailSubject: ({ req } = {}) =>
        req?.context?.invite
          ? "You're invited to Universal Bridge Office"
          : "Reset your Universal Bridge password",
      generateEmailHTML: async ({ req, token = "", user } = {}) => {
        const { staffInviteEmail, staffResetEmail, deviceLabel } = await import("@/emails/account");
        const u = (user ?? {}) as { email: string; name?: string; roles?: unknown[] };
        if (req?.context?.invite) {
          const ids = (u.roles ?? []).map((r) =>
            typeof r === "object" && r ? (r as { id: number }).id : (r as number),
          );
          const roles = ids.length
            ? (
                await req.payload.find({
                  collection: "roles",
                  where: { id: { in: ids } },
                  overrideAccess: true,
                  depth: 0,
                  limit: 20,
                  req,
                })
              ).docs.map((r) => r.name)
            : [];
          return (
            await staffInviteEmail({
              token,
              name: u.name,
              email: u.email,
              roles,
              invitedBy: (req.context.invitedBy as string | undefined) ?? null,
            })
          ).html;
        }
        return (
          await staffResetEmail({
            token,
            name: u.name,
            email: u.email,
            device: deviceLabel(req?.headers?.get("user-agent")),
          })
        ).html;
      },
    },
  },
  access: {
    create: allow("users.manage"),
    delete: allow("users.manage"),
    read: ({ req }) => {
      if (req.user?.collection !== "users") return false;
      if (can(actingFromReq(req), "users.manage")) return true;
      return { id: { equals: req.user.id } };
    },
    update: ({ req }) => {
      if (req.user?.collection !== "users") return false;
      if (can(actingFromReq(req), "users.manage")) return true;
      return { id: { equals: req.user.id } };
    },
    admin: ({ req }) => req.user?.collection === "users" && can(actingFromReq(req), "cms.access"),
  },
  hooks: {
    // NFR-SEC-04: sign-in and reset requests are rate limited per IP and per email,
    // on top of the per-account lockout.
    beforeOperation: [
      async ({ operation, args, req }) => {
        if (operation !== "login" && operation !== "forgotPassword") return args;
        // Invitations come from the server's outbox, not from a visitor.
        if (operation === "forgotPassword" && req.context?.internal === true) return args;
        // Loaded lazily: the rate limiter is server-only and the Payload CLI loads this config too.
        const { rateLimit } = await import("@/lib/security/rate-limit");
        const email = String(
          (args as { data?: { email?: string } }).data?.email ?? "",
        ).toLowerCase();
        if (operation === "login") {
          const [ip, account] = await Promise.all([
            rateLimit("login-ip", clientIp(req), { limit: 20, windowSec: 15 * 60 }),
            rateLimit("login-email", email, { limit: 10, windowSec: 15 * 60 }),
          ]);
          if (!ip.success || !account.success) {
            await audit(req, { action: "auth.login-throttled", entity: "users", meta: { email } });
            throw new APIError("Too many sign-in attempts. Try again in a few minutes.", 429);
          }
        }
        if (operation === "forgotPassword") {
          const [ip, account] = await Promise.all([
            rateLimit("forgot-ip", clientIp(req), { limit: 10, windowSec: 60 * 60 }),
            rateLimit("forgot-email", email, { limit: 3, windowSec: 60 * 60 }),
          ]);
          if (!ip.success || !account.success)
            throw new APIError("Too many requests. Try again later.", 429);
        }
        return args;
      },
    ],
    beforeValidate: [
      async ({ data, operation, req }) => {
        // Roles may be given as slugs ("editor"), e.g. by seeds and tests.
        if (data && Array.isArray(data.roles)) data.roles = await roleIds(req.payload, data.roles);
        else if (data && operation === "create" && !data.roles)
          data.roles = await roleIds(req.payload, ["editor"]);
        return data;
      },
      ({ data, originalDoc }) => {
        if (data && typeof data.password === "string") {
          const problem = passwordProblem(data.password, {
            email: data.email ?? originalDoc?.email,
            name: data.name ?? originalDoc?.name,
          });
          if (problem)
            throw new APIError(problem, 400, [{ field: "password", message: problem }], true);
        }
        return data;
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        // Only a super admin can hand out (or take away) the super admin role.
        if (!req.user || isSuperUser(actingFromReq(req)) || !Array.isArray(data.roles)) return data;
        const superRole = await req.payload.find({
          collection: "roles",
          where: { slug: { equals: "super" } },
          depth: 0,
          limit: 1,
        });
        const superId = superRole.docs[0]?.id;
        const had = ids(originalDoc?.roles).includes(superId);
        const has = ids(data.roles).includes(superId);
        if (superId && had !== has)
          throw new APIError("Only a super admin can change the super admin role.", 403);
        return data;
      },
      ({ data, originalDoc, operation }) => {
        // A super admin switching MFA off resets it (lost phone): secret and codes are wiped
        // and the person enrols again at their next sign-in.
        if (operation === "update" && originalDoc?.mfaEnabled && data.mfaEnabled === false) {
          Object.assign(data, {
            mfaSecret: null,
            mfaPendingSecret: null,
            mfaRecoveryCodes: [],
            mfaLastStep: null,
            mfaEnrolledAt: null,
          });
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation === "create") {
          await audit(req, {
            action: "user.create",
            entity: "users",
            entityId: doc.id,
            label: doc.name || doc.email,
            meta: {
              roles: ids(doc.roles),
              method: req.context?.passwordSet ? "password" : "invite",
            },
          });
          // Invitation: the new person sets their own password from an emailed link. Sent from
          // the outbox once this transaction commits (the reset step can't see uncommitted rows).
          // Not when a super admin created the account with a password (office → Accounts).
          if (req.user && !req.context?.passwordSet) {
            await req.payload.create({
              collection: "outbox",
              overrideAccess: true,
              req,
              data: {
                kind: "staff-invite",
                payload: { email: doc.email, invitedBy: (req.user as { name?: string }).name },
                status: "pending",
                attempts: 0,
                runAfter: new Date().toISOString(),
              },
            });
            try {
              const { after } = await import("next/server");
              after(async () => {
                const { processOutbox } = await import("@/lib/outbox");
                await processOutbox(req.payload, { limit: 5 });
              });
            } catch {
              // Outside a request (scripts): the cron picks the job up.
            }
          }
        } else if (req.user) {
          const changed: string[] = [];
          if (JSON.stringify(ids(doc.roles)) !== JSON.stringify(ids(previousDoc?.roles)))
            changed.push("roles");
          if (doc.email !== previousDoc?.email) changed.push("email");
          if (previousDoc?.mfaEnabled && !doc.mfaEnabled) changed.push("mfa-reset");
          if (changed.length) {
            await audit(req, {
              action: "user.update",
              entity: "users",
              entityId: doc.id,
              label: doc.name || doc.email,
              meta: { fields: changed, roles: ids(doc.roles) },
            });
          }
        }
        return doc;
      },
    ],
    beforeDelete: [
      // Their notifications go with them.
      async ({ id, req }) => {
        await req.payload.delete({
          collection: "notifications",
          where: { user: { equals: id } },
          overrideAccess: true,
          req,
        });
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await audit(req, {
          action: "user.delete",
          entity: "users",
          entityId: doc.id,
          label: doc.name || doc.email,
        });
      },
    ],
    afterLogin: [
      async ({ user, req }) => {
        await req.payload.db.updateOne({
          collection: "users",
          id: user.id,
          data: { lastLoginAt: new Date().toISOString() },
          req,
        });
        await audit({ ...req, user: { ...user, collection: "users" } } as PayloadRequest, {
          action: "auth.login",
          entity: "users",
          entityId: user.id,
          meta: { method: "password" },
        });
      },
    ],
    afterLogout: [
      async ({ req }) => {
        if (req.user)
          await audit(req, { action: "auth.logout", entity: "users", entityId: req.user.id });
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "roles",
      type: "relationship",
      relationTo: "roles",
      hasMany: true,
      required: true,
      filterOptions: { audience: { equals: "staff" } },
      access: { create: allowField("users.manage"), update: allowField("users.manage") },
      saveToJWT: true,
    },
    {
      // Retired: roles before the roles collection (the `users_roles` table). Kept for one
      // release so a rollback to the previous code still finds each person's roles; the
      // migration copies them into `roles`. Remove in the next release, with a migration.
      name: "legacyRoles",
      dbName: "users_roles",
      enumName: "enum_users_roles",
      type: "select",
      hasMany: true,
      options: ["super", "editor", "academy", "hr", "sales"].map((v) => ({ label: v, value: v })),
      access: { read: noField, create: noField, update: noField },
      admin: { hidden: true },
    },
    {
      type: "row",
      fields: [
        { name: "jobTitle", type: "text" },
        { name: "phone", type: "text" },
      ],
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "avatars",
      access: { create: noField, update: noField },
      admin: { position: "sidebar", description: "Changed from the profile page." },
    },
    {
      name: "landing",
      label: "Opens after sign-in",
      type: "select",
      defaultValue: "office",
      options: [
        { label: "Company office", value: "office" },
        { label: "Content (CMS)", value: "cms" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "lastLoginAt",
      type: "date",
      access: { create: noField, update: noField },
      admin: { position: "sidebar", readOnly: true },
    },
    {
      // Set when a super admin creates the account with a password: the person must
      // choose their own before using the office (cleared by the password change).
      name: "mustChangePassword",
      label: "Must change password at next sign-in",
      type: "checkbox",
      defaultValue: false,
      access: { create: superFieldOnly, update: superFieldOnly },
      admin: { position: "sidebar" },
    },
    {
      // ADM-01: two-step verification. Set up and used at /staff/mfa; only a super
      // admin can switch it off here, which resets it.
      name: "mfaEnabled",
      label: "Two-step verification",
      type: "checkbox",
      defaultValue: false,
      saveToJWT: true,
      access: { create: noField, update: superFieldOnly },
      admin: {
        position: "sidebar",
        hidden: mfaHidden,
        description:
          "On after the person sets up an authenticator app. Untick to reset it (lost phone).",
      },
    },
    {
      name: "mfaEnrolledAt",
      type: "date",
      access: { create: noField, update: noField },
      admin: { position: "sidebar", readOnly: true, hidden: mfaHidden },
    },
    { name: "mfaSecret", type: "text", ...secretField },
    { name: "mfaPendingSecret", type: "text", ...secretField },
    { name: "mfaRecoveryCodes", type: "json", ...secretField },
    { name: "mfaLastStep", type: "number", ...secretField },
    // The session that completed set-up may continue without a second code (see /staff/mfa).
    { name: "mfaEnrolledSid", type: "text", ...secretField },
  ],
};
