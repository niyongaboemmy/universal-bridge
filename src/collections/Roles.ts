import { APIError, type CollectionConfig, type Payload } from "payload";
import { PERMISSIONS, ROLE_COLORS, SYSTEM_ROLES } from "@/access/permissions";
import { allow, anyone, isLoggedIn, nobody } from "@/access/roles";
import { audit } from "@/lib/audit";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

// Role-based access: a role is a named bundle of permissions (src/access/permissions.ts).
// Built-in roles are created at start-up; their permissions can be changed but they
// can't be renamed or deleted. Users point at roles; Members default to "visitor".
export const Roles: CollectionConfig = {
  slug: "roles",
  admin: {
    group: "Settings",
    useAsTitle: "name",
    defaultColumns: ["name", "audience", "system"],
    description: "Roles and their permissions. Easier to manage in the office under Roles.",
  },
  access: {
    read: isLoggedIn,
    create: allow("roles.manage"),
    update: allow("roles.manage"),
    delete: allow("roles.manage"),
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (operation === "create" && !data.slug && data.name) data.slug = slugify(data.name);
        if (data.slug) data.slug = slugify(data.slug);
        if (originalDoc?.system) {
          // Built-in roles keep their identity; super keeps everything.
          data.slug = originalDoc.slug;
          data.audience = originalDoc.audience;
          data.system = true;
        }
        return data;
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        const doc = await req.payload.findByID({ collection: "roles", id, depth: 0, req });
        if (doc?.system) throw new APIError("Built-in roles can't be deleted.", 400, null, true);
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (!req.user) return doc;
        const before = new Set<string>(previousDoc?.permissions ?? []);
        const after = new Set<string>(doc.permissions ?? []);
        await audit(req, {
          action: `role.${operation}`,
          entity: "roles",
          entityId: doc.id,
          label: doc.name,
          meta: {
            slug: doc.slug,
            added: [...after].filter((p) => !before.has(p)),
            removed: [...before].filter((p) => !after.has(p)),
          },
        });
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        await audit(req, {
          action: "role.delete",
          entity: "roles",
          entityId: doc.id,
          label: doc.name,
        });
      },
    ],
  },
  fields: [
    { name: "name", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      unique: true,
      index: true,
      admin: { description: "Short id used in code and exports. Set from the name." },
    },
    { name: "description", type: "textarea" },
    {
      name: "audience",
      type: "select",
      required: true,
      defaultValue: "staff",
      options: [
        { label: "Staff (office & CMS)", value: "staff" },
        { label: "Members (website accounts)", value: "member" },
      ],
    },
    {
      name: "permissions",
      type: "select",
      hasMany: true,
      options: PERMISSIONS.map((p) => ({ label: p.label, value: p.key })),
    },
    {
      name: "color",
      type: "select",
      defaultValue: "blue",
      options: ROLE_COLORS.map((c) => ({ label: c, value: c })),
    },
    {
      name: "system",
      type: "checkbox",
      defaultValue: false,
      access: { create: () => false, update: () => false },
      admin: { readOnly: true, position: "sidebar" },
    },
  ],
};

/** Profile pictures for staff and members. Written only by the profile actions. */
export const Avatars: CollectionConfig = {
  slug: "avatars",
  admin: { group: "Settings", hidden: true },
  access: { read: anyone, create: nobody, update: nobody, delete: nobody },
  upload: {
    staticDir: ".data/avatars",
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    formatOptions: { format: "webp", options: { quality: 82 } },
    resizeOptions: { width: 512, height: 512, fit: "cover" },
    imageSizes: [
      {
        name: "small",
        width: 96,
        height: 96,
        formatOptions: { format: "webp", options: { quality: 80 } },
      },
    ],
  },
  fields: [],
};

/** Create any missing built-in role (start-up). Existing roles are left as edited. */
export async function ensureSystemRoles(payload: Payload) {
  const existing = await payload.find({
    collection: "roles",
    limit: 100,
    depth: 0,
    pagination: false,
    where: { slug: { in: SYSTEM_ROLES.map((r) => r.slug) } },
  });
  const have = new Set(existing.docs.map((d) => d.slug));
  for (const role of SYSTEM_ROLES) {
    if (have.has(role.slug)) continue;
    await payload.create({ collection: "roles", data: { ...role, system: true } as never });
  }
}

/** Role ids for slugs (ids pass through). Unknown slugs are an error. */
export async function roleIds(payload: Payload, refs: unknown[]): Promise<number[]> {
  const slugs = refs.filter((r): r is string => typeof r === "string" && !/^\d+$/.test(r));
  const ids = refs
    .map((r) =>
      typeof r === "number"
        ? r
        : typeof r === "string" && /^\d+$/.test(r)
          ? Number(r)
          : typeof r === "object" && r && "id" in r
            ? Number((r as { id: unknown }).id)
            : null,
    )
    .filter((n): n is number => n !== null);
  if (slugs.length) {
    const found = await payload.find({
      collection: "roles",
      depth: 0,
      limit: slugs.length,
      pagination: false,
      where: { slug: { in: slugs } },
    });
    if (found.docs.length !== new Set(slugs).size)
      throw new APIError(`Unknown role: ${slugs.join(", ")}`, 400, null, true);
    ids.push(...found.docs.map((d) => d.id as number));
  }
  return [...new Set(ids)];
}
