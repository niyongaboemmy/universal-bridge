import { describe, expect, it } from "vitest";
import { PERMISSION_KEYS, SYSTEM_ROLES } from "@/access/permissions";
import { actingUser, can, hasRole, permissionsOf, roleSlugs } from "@/access/roles";
import { anonymiseIp, device, recordLabel } from "@/lib/audit";
import { resolveSettings } from "@/lib/settings";
import { categoryOf, describe as describeLog } from "@/features/office/logs";

const role = (slug: string) => SYSTEM_ROLES.find((r) => r.slug === slug)!;

describe("permissions", () => {
  it("super holds everything, without listing it", () => {
    expect(can({ roles: [{ slug: "super", permissions: [] }] }, "settings.manage")).toBe(true);
  });
  it("roles grant only their permissions", () => {
    const sales = { roles: [role("sales")] };
    expect(can(sales, "requests.manage")).toBe(true);
    expect(can(sales, "people.view")).toBe(false);
    expect(can(sales, "people.view", "demos.view")).toBe(true);
  });
  it("several roles add up", () => {
    const u = { roles: [role("hr"), role("academy")] };
    expect(permissionsOf(u).has("applicants.job")).toBe(true);
    expect(permissionsOf(u).has("applicants.academy")).toBe(true);
  });
  it("members carry a single role", () => {
    expect(can({ role: role("applicant") }, "member.applications")).toBe(true);
    expect(can({ role: role("visitor") }, "member.applications")).toBe(false);
  });
  it("unpopulated roles grant nothing (fail closed)", () => {
    expect(can({ roles: [3, 4] }, "office.overview")).toBe(false);
    expect(can(null, "office.overview")).toBe(false);
  });
  it("slugs still work for hasRole", () => {
    expect(roleSlugs({ roles: ["editor", { slug: "hr" }] })).toEqual(["editor", "hr"]);
    expect(hasRole({ roles: [{ slug: "super" }] }, "hr")).toBe(true);
  });
  it("built-in roles only use known permissions", () => {
    for (const r of SYSTEM_ROLES)
      for (const p of r.permissions) expect(PERMISSION_KEYS).toContain(p);
  });
});

describe("system settings", () => {
  it("falls back to defaults", () => {
    const s = resolveSettings(null);
    expect(s.registrationOpen).toBe(true);
    expect(s.retention.leadsMonths).toBe(24);
    expect(s.maxUploadBytes).toBe(5 * 1024 * 1024);
  });
  it("stored values win", () => {
    const s = resolveSettings({
      email: { fromName: "UB", fromAddress: "no-reply@ub.rw", inboxes: { sales: "sales@ub.rw" } },
      uploads: { maxMb: 8 },
      accounts: { registrationOpen: false, ssoDomains: "UB.rw, ub.com" },
    } as never);
    expect(s.emailFrom).toBe("UB <no-reply@ub.rw>");
    expect(s.inbox.sales).toBe("sales@ub.rw");
    expect(s.maxUploadBytes).toBe(8 * 1024 * 1024);
    expect(s.registrationOpen).toBe(false);
    expect(s.ssoDomains).toEqual(["ub.rw", "ub.com"]);
  });
});

describe("system logs", () => {
  it("reads like a sentence, with from → to", () => {
    const d = describeLog({
      id: 1,
      at: "2026-10-10T10:00:00Z",
      action: "update",
      entity: "leads",
      entityId: "7",
      label: "L-ABC",
      actorName: "Grace",
      meta: { fields: ["status"], from: "new", to: "contacted" },
    });
    expect(d).toMatchObject({
      actor: "Grace",
      verb: "moved request",
      target: "L-ABC",
      href: "/office/requests/7",
    });
    expect(d.change).toEqual({ from: "new", to: "contacted" });
  });
  it("names public and system actors", () => {
    expect(
      describeLog({
        id: 2,
        at: "",
        action: "submit",
        entity: "applications",
        actorType: "public",
        meta: { type: "academy" },
      }).actor,
    ).toBe("Website visitor");
    expect(describeLog({ id: 3, at: "", action: "retention.purge", entity: "privacy" }).actor).toBe(
      "System",
    );
  });
  it("sorts actions into categories", () => {
    expect(categoryOf("auth.login", "users")).toBe("security");
    expect(categoryOf("update", "applications")).toBe("records");
    expect(categoryOf("live-edit.publish", "pages")).toBe("content");
    expect(categoryOf("role.update", "roles")).toBe("accounts");
    expect(categoryOf("export.csv", "leads")).toBe("privacy");
  });
  it("keeps personal data out", () => {
    expect(anonymiseIp("41.186.22.17")).toBe("41.186.22.0");
    expect(anonymiseIp("2001:db8:85a3:8d3:1319:8a2e:370:7348")).toBe("2001:db8:85a3::");
    expect(recordLabel("leads", { ref: "L-1", name: "Private Person" })).toBe("L-1");
    expect(recordLabel("leads", { name: "Private Person" })).toBeUndefined();
    expect(
      device("Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit Chrome/130 Safari/537"),
    ).toBe("Chrome · macOS");
  });
});

describe("working as one role", () => {
  const editor = { id: 2, ...role("editor") };
  const sales = { id: 5, ...role("sales") };
  const user = { id: 9, roles: [editor, sales] };
  const h = (v?: string) =>
    new Headers(v ? { cookie: `x=1; ub-act=${encodeURIComponent(v)}` } : {});

  it("narrows to the chosen role", () => {
    const u = actingUser(user, h("9:2"));
    expect(can(u, "content.site")).toBe(true);
    expect(can(u, "requests.view")).toBe(false);
  });
  it("without the cookie, all roles count", () => {
    expect(can(actingUser(user, h()), "requests.view")).toBe(true);
  });
  it("a cookie for someone else, or a role they don't have, changes nothing", () => {
    expect(actingUser(user, h("8:2"))).toBe(user);
    expect(actingUser(user, h("9:1"))).toBe(user);
  });
  it("can only narrow: a super admin working as editor loses super", () => {
    const sup = { id: 1, ...role("super") };
    const u = actingUser({ id: 9, roles: [sup, editor] }, h("9:2"));
    expect(can(u, "settings.manage")).toBe(false);
  });
});
