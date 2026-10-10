import { APIError, type CollectionConfig, type PayloadRequest } from "payload";
import type { FieldAccess } from "payload";
import { hasRole, isSuper, ROLES, superFieldOnly, type Role } from "@/access/roles";
import { audit } from "@/lib/audit";
import { passwordProblem } from "@/lib/auth/password";

const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

function clientIp(req: PayloadRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

const noField: FieldAccess = () => false;

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
    // NFR-SEC-05: 8 h session, lockout after repeated failures.
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: { sameSite: "Lax", secure: process.env.NODE_ENV === "production" },
    forgotPassword: {
      expiration: 60 * 60 * 1000,
      generateEmailSubject: () => "Set your Universal Bridge admin password",
      generateEmailHTML: (args) => {
        const token = (args as { token?: string }).token ?? "";
        const link = `${siteUrl()}/admin/reset/${token}`;
        return `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto;color:#0a1633">
  <h1 style="font-size:20px">Set your password</h1>
  <p>Use the button below to set a new password for the Universal Bridge admin. The link works once and expires in one hour.</p>
  <p><a href="${link}" style="display:inline-block;background:#fe760d;color:#0a1633;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">Set password</a></p>
  <p style="font-size:13px;color:#4f5767">If you didn't ask for this, you can ignore this email; your password stays the same.</p>
</div>`;
      },
    },
  },
  access: {
    create: isSuper,
    delete: isSuper,
    read: ({ req }) => {
      if (hasRole(req.user as { roles?: Role[] }, "super")) return true;
      return req.user ? { id: { equals: req.user.id } } : false;
    },
    update: ({ req }) => {
      if (hasRole(req.user as { roles?: Role[] }, "super")) return true;
      return req.user ? { id: { equals: req.user.id } } : false;
    },
    admin: ({ req }) => Boolean(req.user),
  },
  hooks: {
    // NFR-SEC-04: sign-in and reset requests are rate limited per IP and per email,
    // on top of the per-account lockout.
    beforeOperation: [
      async ({ operation, args, req }) => {
        if (operation !== "login" && operation !== "forgotPassword") return args;
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
            meta: { roles: doc.roles },
          });
          // Invitation: the new person sets their own password from an emailed link. Sent from
          // the outbox once this transaction commits (the reset step can't see uncommitted rows).
          if (req.user) {
            await req.payload.create({
              collection: "outbox",
              overrideAccess: true,
              req,
              data: {
                kind: "staff-invite",
                payload: { email: doc.email },
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
          if (JSON.stringify(doc.roles) !== JSON.stringify(previousDoc?.roles))
            changed.push("roles");
          if (doc.email !== previousDoc?.email) changed.push("email");
          if (previousDoc?.mfaEnabled && !doc.mfaEnabled) changed.push("mfa-reset");
          if (changed.length) {
            await audit(req, {
              action: "user.update",
              entity: "users",
              entityId: doc.id,
              meta: { fields: changed, roles: doc.roles },
            });
          }
        }
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await audit(req, { action: "user.delete", entity: "users", entityId: doc.id });
      },
    ],
    afterLogin: [
      async ({ user, req }) => {
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
      type: "select",
      hasMany: true,
      required: true,
      defaultValue: ["editor"],
      options: ROLES.map((role) => ({
        label: role[0]!.toUpperCase() + role.slice(1),
        value: role,
      })),
      access: { create: superFieldOnly, update: superFieldOnly },
      saveToJWT: true,
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
