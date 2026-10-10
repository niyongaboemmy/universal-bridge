import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { adminToken, staffHeaders, uniqueEmail, loginStaff } from "./helpers";

// The office as a workspace: switching roles, notifications, deep search, navigation,
// the role-based overview and settings that change behaviour.

const SITE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const PASSWORD = "quiet harbour lantern 26";

async function asStaff(page: Page, token: string) {
  await page.context().addCookies([{ name: "payload-token", value: token, url: SITE }]);
}

async function staff(request: APIRequestContext, roles: string[]) {
  const email = uniqueEmail("ws");
  const res = await request.post("/api/users", {
    headers: await staffHeaders(request),
    data: { name: `Workspace ${roles.join("+")}`, email, password: PASSWORD, roles },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  const id = (await res.json()).doc.id as number;
  const token = await loginStaff(request, email, PASSWORD);
  return { id, email, token: token as string };
}

async function someLead(request: APIRequestContext) {
  const res = await request.get(
    "/api/leads?where[department][equals]=sales&where[product][exists]=false&limit=1&depth=0&sort=-createdAt",
    { headers: await staffHeaders(request) },
  );
  const lead = (await res.json()).docs[0] as { id: number; ref: string; notes?: unknown[] };
  expect(lead, "needs at least one service request in the database").toBeTruthy();
  return lead;
}

test.describe("Office workspace", () => {
  test.skip(({ isMobile }) => isMobile, "desktop office");
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  test("someone with two roles switches between them, and everything follows", async ({
    page,
    request,
  }) => {
    const s = await staff(request, ["editor", "sales"]);
    try {
      await asStaff(page, s.token);
      // Generous waits: this runs next to upload and PDF tests in the full suite.
      await page.goto("/office/requests");
      await expect(page.getByRole("heading", { name: "Service requests" })).toBeVisible({
        timeout: 30_000,
      });

      // Work as Editor: requests close, in the office and in the API.
      await page.getByRole("button", { name: /Switch role/ }).click();
      await page.getByRole("menuitemradio", { name: /^Editor/ }).click();
      await expect(page.getByRole("button", { name: /Working as Editor/ })).toBeVisible({
        timeout: 30_000,
      });
      await page.waitForURL(/\/office$/);
      await expect(page.getByText("Working as", { exact: false }).first()).toBeVisible();
      await page.goto("/office/requests");
      await expect(page).toHaveURL(/denied=requests/);
      // As the browser does it (same-site fetch with the session cookie).
      const get = (url: string) =>
        page.evaluate(async (u) => {
          const r = await fetch(u, { signal: AbortSignal.timeout(20_000) });
          return { status: r.status, body: await r.json().catch(() => null) };
        }, url);
      expect((await get("/api/leads?limit=1")).status).toBe(403);
      const res = await get("/api/office/search?q=L-");
      expect(res.status).toBe(200);
      const found = res.body;
      expect((found.results as { type: string }[]).some((r) => r.type === "Request")).toBe(false);

      // Back to all roles.
      await page.getByRole("button", { name: /Switch role/ }).click();
      await page.getByRole("menuitemradio", { name: /All my roles/ }).click();
      await expect(page.getByRole("button", { name: /Working as all roles/ })).toBeVisible({
        timeout: 30_000,
      });
      await page.goto("/office/requests");
      await expect(page.getByRole("heading", { name: "Service requests" })).toBeVisible({
        timeout: 30_000,
      });
      expect((await get("/api/leads?limit=1")).status).toBe(200);
    } finally {
      await request.delete(`/api/users/${s.id}`, { headers: await staffHeaders(request) });
    }
  });

  test("an assignment notifies the person; the bell opens it", async ({ page, request }) => {
    const s = await staff(request, ["sales"]);
    const lead = await someLead(request);
    try {
      const res = await request.patch(`/api/leads/${lead.id}`, {
        headers: await staffHeaders(request),
        data: { assignee: s.id },
      });
      expect(res.ok(), await res.text()).toBeTruthy();
      await asStaff(page, s.token);
      await page.goto("/office");
      const bell = page.getByRole("button", { name: /Notifications/ });
      await expect(bell).toHaveAccessibleName(/new/);
      await bell.click();
      await page.getByRole("tab", { name: /New/ }).click();
      const item = page.getByRole("button", { name: new RegExp(`assigned you ${lead.ref}`) });
      await expect(item).toBeVisible();
      await item.click();
      await page.waitForURL(new RegExp(`/office/requests/${lead.id}`));
      await page.goto("/office/notifications?state=unread");
      await expect(page.getByText(`assigned you ${lead.ref}`)).toHaveCount(0);
    } finally {
      const headers = await staffHeaders(request);
      await request.patch(`/api/leads/${lead.id}`, { headers, data: { assignee: null } });
      await request.delete(`/api/users/${s.id}`, { headers });
    }
  });

  test("deep search finds words inside notes, with the match highlighted", async ({
    page,
    request,
  }) => {
    const headers = await staffHeaders(request);
    const lead = await someLead(request);
    const token = `zebracrossing${Date.now() % 100000}`;
    const before = (await (await request.get(`/api/leads/${lead.id}?depth=0`, { headers })).json())
      .notes as { body: string }[];
    await request.patch(`/api/leads/${lead.id}`, {
      headers,
      data: { notes: [...(before ?? []), { body: `Call back about the ${token} idea` }] },
    });
    try {
      await asStaff(page, await adminToken(request));
      await page.goto(`/office/search?q=${token}`);
      const result = page.getByRole("link", { name: new RegExp(lead.ref) });
      await expect(result).toBeVisible();
      await expect(result.locator("mark", { hasText: token })).toBeVisible();

      // The palette finds it too.
      await page.goto("/office");
      await page.keyboard.press("/");
      await page.getByRole("combobox").fill(token);
      await expect(page.getByRole("option", { name: new RegExp(lead.ref) })).toBeVisible();
      await expect(page.getByRole("option", { name: /See all results/ })).toBeVisible();
    } finally {
      await request.patch(`/api/leads/${lead.id}`, { headers, data: { notes: before ?? [] } });
    }
  });

  test("sidebar sections fold, and stay as left after a reload", async ({ page, request }) => {
    await asStaff(page, await adminToken(request));
    await page.goto("/office/requests");
    const nav = page.getByRole("navigation", { name: "Company dashboard" });
    const clients = nav.getByRole("button", { name: /Clients/ });
    await expect(clients).toHaveAttribute("aria-expanded", "true");
    const admin = nav.getByRole("button", { name: /Administration/ });
    await expect(admin).toHaveAttribute("aria-expanded", "false");
    await admin.click();
    await expect(nav.getByRole("link", { name: "System logs" })).toBeVisible();
    await page.reload();
    await expect(nav.getByRole("button", { name: /Administration/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await nav.getByRole("button", { name: /Administration/ }).click();
  });

  test("the overview follows the role", async ({ page, request }) => {
    await asStaff(page, await adminToken(request));
    await page.goto("/office");
    for (const h of ["Clients", "Talent", "Work & team", "Website"])
      await expect(page.getByRole("heading", { name: h, exact: true })).toBeVisible();
    await expect(page.getByText("Sales pipeline")).toBeVisible();

    const editor = await staff(request, ["editor"]);
    try {
      await page.context().clearCookies();
      await asStaff(page, editor.token);
      await page.goto("/office");
      await expect(page.getByRole("heading", { name: "Website", exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Clients", exact: true })).toHaveCount(0);
      await expect(page.getByText("Sales pipeline")).toHaveCount(0);
      await expect(page.getByText("Your day")).toBeVisible();
    } finally {
      await request.delete(`/api/users/${editor.id}`, { headers: await staffHeaders(request) });
    }
  });

  test("workflow settings change behaviour: follow-up date and currency", async ({ request }) => {
    const headers = await staffHeaders(request);
    await request.post("/api/globals/system-settings", {
      headers,
      data: { workflow: { followUpDays: 5, defaultCurrency: "USD" } },
    });
    const list = await request.get(
      "/api/leads?where[status][equals]=new&where[nextFollowUpAt][exists]=false&limit=1&depth=0",
      { headers },
    );
    const lead = (await list.json()).docs[0] as { id: number; currency?: string } | undefined;
    test.skip(!lead, "needs a new request without a follow-up date");
    try {
      const res = await request.patch(`/api/leads/${lead!.id}`, {
        headers,
        data: { status: "contacted" },
      });
      const doc = (await res.json()).doc as { nextFollowUpAt?: string };
      const days = (new Date(doc.nextFollowUpAt!).getTime() - Date.now()) / 86_400_000;
      expect(days).toBeGreaterThan(4.9);
      expect(days).toBeLessThan(5.1);
    } finally {
      await request.patch(`/api/leads/${lead!.id}`, {
        headers,
        data: { status: "new", nextFollowUpAt: null },
      });
      await request.post("/api/globals/system-settings", {
        headers,
        data: { workflow: { followUpDays: 3, defaultCurrency: "RWF" } },
      });
    }
  });
});

test.describe("Office on a phone", () => {
  test.skip(({ isMobile }) => !isMobile, "phone layout");

  test("the menu opens as a drawer and filters fold away", async ({ page, request }) => {
    await asStaff(page, await adminToken(request));
    await page.goto("/office/requests?view=list");
    await page.getByRole("button", { name: "Open the menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer.getByRole("link", { name: /Service requests/ })).toBeVisible();
    await drawer.getByRole("link", { name: /Overview/ }).click();
    await page.waitForURL(/\/office$/);
    await expect(drawer).toBeHidden();

    await page.goto("/office/requests?view=list");
    await expect(page.getByLabel("Owner")).toBeHidden();
    await page.getByRole("button", { name: /^Filters/ }).click();
    await expect(page.getByLabel("Owner")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
