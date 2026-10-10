"use server";

import { revalidatePath } from "next/cache";
import { PERMISSION_KEYS, type Permission } from "@/access/permissions";
import { FIELD_TYPES, OPENING_STATUSES, type OpeningField } from "@/collections/Openings";
import { APPLICATION_TYPES } from "@/collections/Applications";
import { passwordProblem } from "@/lib/auth/password";
import { payload } from "@/lib/cms/payload";
import { allowed, officeUser, type OfficeUser } from "./session";
import type { ActionResult } from "./actions";

/**
 * Office administration: own profile, roles & permissions, accounts, system settings
 * and openings. Writes go through Payload as the signed-in user (access rules, hooks
 * and the audit log apply); the few server-only fields (avatar, password check) are
 * written with explicit checks here.
 */
async function run(fn: () => Promise<unknown>, message = "Saved"): Promise<ActionResult> {
  try {
    await fn();
    revalidatePath("/office", "layout");
    return { ok: true, message };
  } catch (e) {
    const err = e as {
      status?: number;
      message?: string;
      data?: { errors?: { message: string }[] };
    };
    if (err.status === 403) return { ok: false, error: "Your role can't change this." };
    return {
      ok: false,
      error: err.data?.errors?.[0]?.message || err.message || "Something went wrong.",
    };
  }
}

const str = (v: FormDataEntryValue | null) => (typeof v === "string" && v.trim() ? v.trim() : null);
const num = (v: FormDataEntryValue | null) => (v === null || v === "" ? null : Number(v));
const date = (v: FormDataEntryValue | null) =>
  typeof v === "string" && v ? new Date(v).toISOString() : null;

function req(user: OfficeUser) {
  return { user, overrideAccess: false } as const;
}

// ---- Profile -----------------------------------------------------------------------

export async function saveProfile(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await officeUser();
  const name = str(form.get("name"));
  if (!name) return { ok: false, error: "Your name can't be empty." };
  const landing = form.get("landing") === "cms" ? "cms" : "office";
  return run(async () => {
    const p = await payload();
    await p.update({
      collection: "users",
      id: user.id,
      data: { name, jobTitle: str(form.get("jobTitle")), phone: str(form.get("phone")), landing },
      ...req(user),
    });
  }, "Profile saved");
}

export async function changePassword(
  _: ActionResult | null,
  form: FormData,
): Promise<ActionResult> {
  const user = await officeUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (next !== String(form.get("confirm") ?? ""))
    return { ok: false, error: "The new passwords don't match." };
  const problem = passwordProblem(next, { email: user.email, name: user.name });
  if (problem) return { ok: false, error: problem };
  const p = await payload();
  try {
    // Verifies the current password (and counts towards the lockout like any sign-in).
    await p.login({ collection: "users", data: { email: user.email, password: current } });
  } catch {
    return { ok: false, error: "Your current password isn't right." };
  }
  return run(async () => {
    await p.update({ collection: "users", id: user.id, data: { password: next }, ...req(user) });
  }, "Password changed");
}

export async function uploadAvatar(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await officeUser();
  const file = form.get("avatar");
  if (!(file instanceof File) || !file.size) return { ok: false, error: "Choose a picture." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return { ok: false, error: "Use a JPG, PNG or WebP picture." };
  if (file.size > 4 * 1024 * 1024) return { ok: false, error: "Pictures can be up to 4 MB." };
  const data = Buffer.from(await file.arrayBuffer());
  // Trust the bytes, not the browser's label (JPEG, PNG, WebP signatures).
  const isImage =
    (data[0] === 0xff && data[1] === 0xd8) ||
    (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) ||
    (data.subarray(0, 4).toString() === "RIFF" && data.subarray(8, 12).toString() === "WEBP");
  if (!isImage) return { ok: false, error: "That file isn't a picture." };
  return run(async () => {
    const p = await payload();
    const previous = typeof user.avatar === "object" ? user.avatar?.id : user.avatar;
    const doc = await p.create({
      collection: "avatars",
      data: {},
      file: {
        data,
        mimetype: file.type,
        name: `u${user.id}-${Date.now()}.${file.type.split("/")[1]}`,
        size: file.size,
      },
      overrideAccess: true,
    });
    await p.update({
      collection: "users",
      id: user.id,
      data: { avatar: doc.id },
      overrideAccess: true,
      user,
    });
    if (previous)
      await p
        .delete({ collection: "avatars", id: previous, overrideAccess: true })
        .catch(() => null);
  }, "Picture updated");
}

export async function removeAvatar(): Promise<ActionResult> {
  const user = await officeUser();
  const previous = typeof user.avatar === "object" ? user.avatar?.id : user.avatar;
  if (!previous) return { ok: true };
  return run(async () => {
    const p = await payload();
    await p.update({
      collection: "users",
      id: user.id,
      data: { avatar: null },
      overrideAccess: true,
      user,
    });
    await p.delete({ collection: "avatars", id: previous, overrideAccess: true }).catch(() => null);
  }, "Picture removed");
}

/** Sign out every other device (keeps this session). */
export async function endOtherSessions(): Promise<ActionResult> {
  const user = await officeUser();
  const { staffSession } = await import("@/lib/auth/staff-session");
  const s = await staffSession();
  if (!s) return { ok: false, error: "Sign in again first." };
  return run(async () => {
    await s.p.db.updateOne({
      collection: "users",
      id: user.id,
      data: { sessions: (s.user.sessions ?? []).filter((x) => x.id === s.sid) },
      returning: false,
    } as never);
  }, "Other devices signed out");
}

// ---- Roles -------------------------------------------------------------------------

const validPerms = (list: unknown[]) =>
  list.filter((p): p is Permission => PERMISSION_KEYS.includes(p as Permission));

export async function toggleRolePermission(
  roleId: number,
  permission: string,
  on: boolean,
): Promise<ActionResult> {
  const user = await officeUser();
  if (!allowed(user, "roles.manage")) return { ok: false, error: "Your role can't change roles." };
  if (!PERMISSION_KEYS.includes(permission as Permission))
    return { ok: false, error: "Unknown permission" };
  const p = await payload();
  const role = await p.findByID({ collection: "roles", id: roleId, depth: 0 });
  if (role.slug === "super") return { ok: false, error: "Super admins always have everything." };
  const set = new Set<string>(role.permissions ?? []);
  if (on) set.add(permission);
  else set.delete(permission);
  return run(
    () =>
      p.update({
        collection: "roles",
        id: roleId,
        data: { permissions: validPerms([...set]) },
        ...req(user),
      }),
    on ? "Permission granted" : "Permission removed",
  );
}

export async function saveRole(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await officeUser();
  const id = num(form.get("id"));
  const name = str(form.get("name"));
  if (!name) return { ok: false, error: "Give the role a name." };
  const data = {
    name,
    description: str(form.get("description")),
    color: str(form.get("color")) ?? "blue",
    audience: form.get("audience") === "member" ? "member" : "staff",
    ...(form.has("permissions")
      ? { permissions: validPerms(form.getAll("permissions").map(String)) }
      : {}),
  };
  return run(
    async () => {
      const p = await payload();
      if (id) await p.update({ collection: "roles", id, data: data as never, ...req(user) });
      else await p.create({ collection: "roles", data: data as never, ...req(user) });
    },
    id ? "Role saved" : "Role created",
  );
}

export async function deleteRole(id: number): Promise<ActionResult> {
  const user = await officeUser();
  return run(async () => {
    const p = await payload();
    await p.delete({ collection: "roles", id, ...req(user) });
  }, "Role deleted");
}

// ---- Accounts ----------------------------------------------------------------------

export async function inviteStaff(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await officeUser();
  const email = str(form.get("email"))?.toLowerCase();
  const name = str(form.get("name"));
  const roles = form.getAll("roles").map(Number).filter(Boolean);
  if (!email?.includes("@") || !name) return { ok: false, error: "Name and email are required." };
  if (!roles.length) return { ok: false, error: "Pick at least one role." };
  return run(async () => {
    const p = await payload();
    // A random password nobody knows; the invitation email lets them set their own.
    const password = `${crypto.randomUUID()}Aa1!`;
    await p.create({
      collection: "users",
      data: { email, name, roles, password, jobTitle: str(form.get("jobTitle")) } as never,
      ...req(user),
    });
  }, "Invitation sent");
}

export async function setUserRoles(id: number, roles: number[]): Promise<ActionResult> {
  const user = await officeUser();
  if (!roles.length) return { ok: false, error: "Keep at least one role." };
  return run(async () => {
    const p = await payload();
    await p.update({ collection: "users", id, data: { roles }, ...req(user) });
  }, "Roles updated");
}

export async function removeStaff(id: number): Promise<ActionResult> {
  const user = await officeUser();
  if (id === user.id) return { ok: false, error: "You can't remove your own account." };
  return run(async () => {
    const p = await payload();
    await p.delete({ collection: "users", id, ...req(user) });
  }, "Account removed");
}

export async function unlockStaff(id: number): Promise<ActionResult> {
  const user = await officeUser();
  if (!allowed(user, "users.manage")) return { ok: false, error: "Your role can't do this." };
  return run(async () => {
    const p = await payload();
    await p.unlock({
      collection: "users",
      data: { email: (await p.findByID({ collection: "users", id, depth: 0 })).email } as never,
      overrideAccess: true,
    });
  }, "Account unlocked");
}

export async function setMemberRole(id: number, role: number): Promise<ActionResult> {
  const user = await officeUser();
  return run(async () => {
    const p = await payload();
    await p.update({ collection: "members", id, data: { role }, ...req(user) });
  }, "Member role updated");
}

// ---- Settings ----------------------------------------------------------------------

/** Save one settings section (`section` = group name; fields come as `group.field`). */
export async function saveSettings(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await officeUser();
  if (!allowed(user, "settings.manage"))
    return { ok: false, error: "Your role can't change settings." };
  const section = String(form.get("_section") ?? "");
  const p = await payload();
  const current = (await p.findGlobal({ slug: "system-settings", depth: 0 })) as unknown as Record<
    string,
    Record<string, unknown>
  >;
  const group: Record<string, unknown> = { ...(current[section] ?? {}) };
  const nested: Record<string, Record<string, unknown>> = {};
  for (const [key, raw] of form.entries()) {
    if (key.startsWith("_") || key.startsWith("$")) continue;
    const kind = String(form.get(`_type.${key}`) ?? "text");
    const value =
      kind === "number"
        ? num(raw)
        : kind === "checkbox"
          ? raw === "on" || raw === "true"
          : kind === "relationship"
            ? num(raw)
            : kind === "datetime"
              ? date(raw)
              : str(raw);
    const [a, b] = key.split(".");
    if (b) (nested[a!] ??= { ...((group[a!] as Record<string, unknown>) ?? {}) })[b] = value;
    else group[a!] = value;
  }
  // Unchecked boxes send nothing.
  for (const key of form.getAll("_checkbox").map(String)) if (!form.has(key)) group[key] = false;
  Object.assign(group, nested);
  return run(
    () =>
      p.updateGlobal({
        slug: "system-settings",
        data: { [section]: group } as never,
        ...req(user),
      }),
    "Settings saved",
  );
}

// ---- Openings ----------------------------------------------------------------------

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

export async function saveOpening(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await officeUser();
  const id = num(form.get("id"));
  const title = str(form.get("title"));
  const kind = String(form.get("kind") ?? "");
  if (!title) return { ok: false, error: "Give the opening a title." };
  if (!(APPLICATION_TYPES as readonly string[]).includes(kind))
    return { ok: false, error: "Pick what people apply for." };
  const status = String(form.get("status") ?? "draft");
  let fields: OpeningField[] = [];
  try {
    fields = JSON.parse(String(form.get("fields") ?? "[]")) as OpeningField[];
  } catch {
    return { ok: false, error: "The form fields couldn't be read." };
  }
  const keys = new Set<string>();
  for (const f of fields) {
    f.key = slugify(f.key || f.label).replace(/-/g, "_") || `q${keys.size + 1}`;
    if (keys.has(f.key)) f.key = `${f.key}_${keys.size + 1}`;
    keys.add(f.key);
    if (!(FIELD_TYPES as readonly string[]).includes(f.type)) f.type = "text";
    if (!f.label?.trim()) return { ok: false, error: "Every question needs a label." };
  }
  const data = {
    title,
    slug: slugify(str(form.get("slug")) ?? title),
    kind,
    status: (OPENING_STATUSES as readonly string[]).includes(status) ? status : "draft",
    mode: str(form.get("mode")) ?? "onsite",
    opensAt: date(form.get("opensAt")),
    closesAt: date(form.get("closesAt")),
    startsAt: date(form.get("startsAt")),
    seats: num(form.get("seats")),
    location: str(form.get("location")),
    summary: str(form.get("summary")),
    description: str(form.get("description")),
    requireAccount: form.get("requireAccount") === "on",
    featured: form.get("featured") === "on",
    owner: num(form.get("owner")) ?? user.id,
    fields: fields.map(({ id: _id, ...f }) => f),
  };
  let saved: number | undefined;
  const res = await run(
    async () => {
      const p = await payload();
      const doc = id
        ? await p.update({ collection: "openings", id, data: data as never, ...req(user) })
        : await p.create({ collection: "openings", data: data as never, ...req(user) });
      saved = doc.id as number;
    },
    id ? "Opening saved" : "Opening created",
  );
  return res.ok && saved ? { ...res, message: `${res.message}|${saved}` } : res;
}

export async function setOpeningStatus(id: number, status: string): Promise<ActionResult> {
  const user = await officeUser();
  if (!(OPENING_STATUSES as readonly string[]).includes(status))
    return { ok: false, error: "Unknown status" };
  return run(async () => {
    const p = await payload();
    await p.update({ collection: "openings", id, data: { status } as never, ...req(user) });
  });
}

export async function deleteOpening(id: number): Promise<ActionResult> {
  const user = await officeUser();
  return run(async () => {
    const p = await payload();
    await p.delete({ collection: "openings", id, ...req(user) });
  }, "Opening deleted");
}

// ---- Working as one role -------------------------------------------------------------

/** Work as one of your roles (null: all of them). Only ever narrows permissions. */
export async function switchRole(roleId: number | null): Promise<ActionResult> {
  const user = await officeUser();
  const { cookies } = await import("next/headers");
  const { ACT_COOKIE } = await import("@/access/roles");
  const jar = await cookies();
  if (roleId === null) {
    jar.delete(ACT_COOKIE);
    revalidatePath("/office", "layout");
    return { ok: true, message: "Working with all your roles" };
  }
  const role = (user.allRoles ?? []).find((r) => r.id === roleId);
  if (!role) return { ok: false, error: "That isn't one of your roles." };
  jar.set(ACT_COOKIE, `${user.id}:${roleId}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  revalidatePath("/office", "layout");
  return { ok: true, message: `Working as ${role.name}` };
}
