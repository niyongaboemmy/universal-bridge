import { APIError, type CollectionConfig, type FieldAccess, type PayloadRequest } from "payload";
import { can, actingFromReq } from "@/access/roles";
import { passwordProblem } from "@/lib/auth/password";
import { secureCookies } from "@/lib/auth/secure-cookies";

const noField: FieldAccess = () => false;
const managers: FieldAccess = ({ req }) =>
  req.user?.collection === "users" && can(actingFromReq(req), "members.manage");

/** Role id by slug (members default to "visitor"; settings may choose another). */
export async function memberRoleId(req: PayloadRequest, which: "default" | "applicant") {
  const { settings } = await import("@/lib/settings");
  const s = await settings();
  const chosen = which === "default" ? s.defaultMemberRole : s.applicantRole;
  if (chosen) return chosen;
  const found = await req.payload.find({
    collection: "roles",
    where: { slug: { equals: which === "default" ? "visitor" : "applicant" } },
    depth: 0,
    limit: 1,
    req,
  });
  return found.docs[0]?.id as number | undefined;
}

// External accounts: people who register on the website to apply and follow their
// applications. Separate from staff (users): they never reach the office or the CMS.
export const Members: CollectionConfig = {
  slug: "members",
  labels: { singular: "Member", plural: "Members" },
  admin: {
    group: "Settings",
    useAsTitle: "email",
    defaultColumns: ["name", "email", "role", "createdAt"],
    description: "Website accounts (visitors and applicants). Personal data.",
  },
  auth: {
    depth: 1,
    tokenExpiration: 60 * 60 * 24 * 14,
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    cookies: { sameSite: "Lax", secure: secureCookies() },
    // Branded, in the member's language (src/emails/account.tsx).
    forgotPassword: {
      expiration: 60 * 60 * 1000,
      generateEmailSubject: async ({ user } = {}) => {
        const { emailTranslator } = await import("@/emails/translator");
        const l = (user as { locale?: string } | undefined)?.locale;
        return emailTranslator(l === "fr" || l === "rw" ? l : "en")("passwordReset.subject");
      },
      generateEmailHTML: async ({ req, token = "", user } = {}) => {
        const { memberResetEmail, deviceLabel } = await import("@/emails/account");
        const u = (user ?? {}) as { email: string; name?: string; locale?: string };
        return (
          await memberResetEmail({
            token,
            name: u.name,
            email: u.email,
            locale: u.locale,
            device: deviceLabel(req?.headers?.get("user-agent")),
          })
        ).html;
      },
    },
  },
  access: {
    admin: () => false,
    // Registration goes through the website's server action (checks the settings switch).
    create: ({ req }) =>
      req.user?.collection === "users" && can(actingFromReq(req), "members.manage"),
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === "users")
        return can(actingFromReq(req), "members.manage", "users.manage");
      return { id: { equals: req.user.id } };
    },
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === "users") return can(actingFromReq(req), "members.manage");
      return { id: { equals: req.user.id } };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      if (req.user.collection === "users") return can(actingFromReq(req), "members.manage");
      return { id: { equals: req.user.id } };
    },
  },
  hooks: {
    beforeOperation: [
      async ({ operation, args, req }) => {
        if (operation !== "login" && operation !== "forgotPassword") return args;
        const { rateLimit } = await import("@/lib/security/rate-limit");
        const ip =
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip") ||
          "local";
        const r = await rateLimit(`member-${operation}`, ip, { limit: 20, windowSec: 15 * 60 });
        if (!r.success) throw new APIError("Too many attempts. Try again in a few minutes.", 429);
        return args;
      },
    ],
    beforeValidate: [
      async ({ data, operation, originalDoc, req }) => {
        if (data && typeof data.password === "string") {
          const problem = passwordProblem(data.password, {
            email: data.email ?? originalDoc?.email,
            name: data.name ?? originalDoc?.name,
          });
          if (problem)
            throw new APIError(problem, 400, [{ field: "password", message: problem }], true);
        }
        if (data && operation === "create" && !data.role)
          data.role = await memberRoleId(req, "default");
        return data;
      },
    ],
    afterLogin: [
      async ({ user, req }) => {
        await req.payload.db.updateOne({
          collection: "members",
          id: user.id,
          data: { lastLoginAt: new Date().toISOString() },
          req,
        });
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      type: "row",
      fields: [
        { name: "phone", type: "text" },
        { name: "country", type: "text" },
      ],
    },
    {
      name: "role",
      type: "relationship",
      relationTo: "roles",
      filterOptions: { audience: { equals: "member" } },
      saveToJWT: true,
      access: { create: managers, update: managers },
      admin: { position: "sidebar" },
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "avatars",
      access: { create: noField, update: noField },
      admin: { position: "sidebar" },
    },
    {
      name: "locale",
      type: "select",
      defaultValue: "en",
      options: [
        { label: "English", value: "en" },
        { label: "Français", value: "fr" },
        { label: "Ikinyarwanda", value: "rw" },
      ],
    },
    { name: "newsletter", type: "checkbox", defaultValue: false },
    {
      name: "lastLoginAt",
      type: "date",
      access: { create: noField, update: noField },
      admin: { position: "sidebar", readOnly: true },
    },
  ],
};
