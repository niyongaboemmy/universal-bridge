import path from "node:path";
import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import {
  adminToken,
  presetConsent,
  staffHeaders,
  stubTurnstile,
  uniqueEmail,
  loginStaff,
} from "./helpers";

// Sign-in, roles & permissions, settings, system logs, openings and website accounts.

const SITE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const PASSWORD = "quiet harbour lantern 26";
const CV = path.resolve("tests/fixtures/sample-cv.pdf");

async function asStaff(page: Page, token: string) {
  await page.context().addCookies([{ name: "payload-token", value: token, url: SITE }]);
}

async function roleId(request: APIRequestContext, slug: string) {
  const res = await request.get(`/api/roles?where[slug][equals]=${slug}&depth=0`, {
    headers: await staffHeaders(request),
  });
  return (await res.json()).docs[0] as { id: number; permissions: string[] };
}

async function staff(request: APIRequestContext, roles: (string | number)[]) {
  const email = uniqueEmail("access");
  const res = await request.post("/api/users", {
    headers: await staffHeaders(request),
    data: { name: "Access Test", email, password: PASSWORD, roles },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  const id = (await res.json()).doc.id as number;
  const token = await loginStaff(request, email, PASSWORD);
  return { id, email, token: token as string };
}

test.describe("Staff access", () => {
  test.skip(({ isMobile }) => isMobile, "staff screens run on desktop");
  test.describe.configure({ mode: "serial" });

  test("one sign-in page: wrong password is refused, then the office opens", async ({
    page,
    request,
  }) => {
    const s = await staff(request, ["editor"]);
    try {
      await page.goto("/admin/login");
      await expect(page).toHaveURL(/\/login/);
      await page.getByLabel("Email").fill(s.email);
      await page.getByLabel("Password", { exact: true }).fill("not the password at all");
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page.locator("main").getByRole("alert")).toContainText("don't match");
      await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
      await page.getByRole("button", { name: "Sign in" }).click();
      await page.waitForURL(/\/office$/);
      // The CMS is one click away.
      await expect(page.getByRole("link", { name: "Content (CMS)" })).toBeVisible();
    } finally {
      await request.delete(`/api/users/${s.id}`, { headers: await staffHeaders(request) });
    }
  });

  test("a custom role opens exactly what it is given", async ({ page, request }) => {
    const headers = await staffHeaders(request);
    const name = `Ops ${Date.now()}`;
    const created = await request.post("/api/roles", {
      headers,
      data: { name, audience: "staff", permissions: ["office.overview"] },
    });
    expect(created.ok(), await created.text()).toBeTruthy();
    const role = (await created.json()).doc as { id: number };
    const s = await staff(request, [role.id]);
    try {
      await asStaff(page, s.token);
      await page.goto("/office/people");
      await expect(page).toHaveURL(/denied=people/);
      const nav = page.getByRole("navigation", { name: "Company dashboard" });
      await expect(nav.getByRole("link", { name: "Employees" })).toHaveCount(0);

      // Grant it in the matrix (as a super admin).
      await asStaff(page, await adminToken(request));
      await page.goto("/office/roles");
      await page.getByRole("switch", { name: `Employees · view for ${name}` }).click();
      await expect(page.getByRole("status").last()).toContainText("on");

      await asStaff(page, s.token);
      await page.goto("/office/people");
      await expect(page.getByRole("heading", { name: "Employees" })).toBeVisible();
      // …but not the settings.
      await page.goto("/office/settings");
      await expect(page).toHaveURL(/denied=settings/);
    } finally {
      await request.delete(`/api/users/${s.id}`, { headers });
      await request.delete(`/api/roles/${role.id}`, { headers });
    }
  });

  test("only a super admin can hand out the super admin role", async ({ request }) => {
    const headers = await staffHeaders(request);
    const managers = await request.post("/api/roles", {
      headers,
      data: { name: `Account managers ${Date.now()}`, permissions: ["users.manage", "cms.access"] },
    });
    const role = (await managers.json()).doc as { id: number };
    const s = await staff(request, [role.id]);
    const sup = await roleId(request, "super");
    try {
      const res = await request.patch(`/api/users/${s.id}`, {
        headers: { Authorization: `JWT ${s.token}` },
        data: { roles: [role.id, sup.id] },
      });
      expect(res.status()).toBe(403);
    } finally {
      await request.delete(`/api/users/${s.id}`, { headers });
      await request.delete(`/api/roles/${role.id}`, { headers });
    }
  });

  test("settings save, and system logs say who did it", async ({ page, request }) => {
    await asStaff(page, await adminToken(request));
    await page.goto("/office/settings?s=workflow");
    await page.getByLabel(/Currency for deal values/).selectOption("USD");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("status").last()).toContainText("Settings saved");
    await page.goto("/office/settings?s=workflow");
    await expect(page.getByLabel(/Currency for deal values/)).toHaveValue("USD");
    await page.getByLabel(/Currency for deal values/).selectOption("RWF");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("status").last()).toContainText("Settings saved");

    await page.goto("/office/logs?category=settings");
    await expect(page.getByText("changed settings").first()).toBeVisible();
    await page.getByText("changed settings").first().click();
    await expect(page.getByText("settings.update").first()).toBeVisible();
  });
});

test.describe("Openings and website accounts", () => {
  test.describe.configure({ mode: "serial" });

  test("an opening goes live, a visitor registers, applies and follows it", async ({
    page,
    request,
    isMobile,
  }) => {
    const headers = await staffHeaders(request);
    const stamp = Date.now();
    const slug = `e2e-opening-${stamp}`;
    const title = `E2E Data Internship ${stamp}`;
    const created = await request.post("/api/openings", {
      headers,
      data: {
        title,
        slug,
        kind: "internship",
        status: "open",
        seats: 4,
        closesAt: new Date(Date.now() + 10 * 86_400_000).toISOString(),
        fields: [
          { key: "school", label: "School", type: "text", required: true },
          { key: "track", label: "Track", type: "radio", required: true, options: "Data\nWeb" },
          { key: "cv", label: "CV", type: "file", required: true },
        ],
      },
    });
    expect(created.ok(), await created.text()).toBeTruthy();
    const openingId = (await created.json()).doc.id as number;
    const email = uniqueEmail("member");
    try {
      await presetConsent(page);
      await stubTurnstile(page);
      // The list is cached and refreshed in the background after a change.
      await expect
        .poll(
          async () => {
            await page.goto("/apply");
            return page.getByRole("link", { name: new RegExp(title) }).count();
          },
          { timeout: 30_000 },
        )
        .toBeGreaterThan(0);
      await page.getByRole("link", { name: new RegExp(title) }).click();
      await expect(page.getByRole("heading", { name: title })).toBeVisible();

      await page.getByRole("link", { name: "Create an account" }).first().click();
      await page.getByLabel("Full name").fill("Aline Uwase");
      await page.getByLabel("Email", { exact: true }).fill(email);
      await page.getByLabel("Password").fill("a quiet river at dawn");
      await page.getByRole("button", { name: "Create account" }).click();
      await page.waitForURL(new RegExp(`/apply/${slug}`));
      await expect(page.getByText("Applying as Aline Uwase")).toBeVisible();
      await expect(page.getByLabel("Email", { exact: true })).toHaveValue(email);

      // Required questions are enforced.
      await page.getByRole("button", { name: "Apply now" }).click();
      await expect(page.getByText("This field is required.").first()).toBeVisible();

      await page.getByLabel("School").fill("University of Rwanda");
      await page.getByText("Data", { exact: true }).click();
      await page.locator("input[name=q_cv]").setInputFiles(CV);
      await page.getByRole("checkbox", { name: /I agree/ }).check();
      await page.getByRole("button", { name: "Apply now" }).click();
      await expect(page.getByRole("status")).toContainText("Application received");

      await page.getByRole("link", { name: /Follow it/ }).click();
      await expect(page.getByText("Applicant", { exact: true })).toBeVisible();
      await expect(page.getByText(title)).toBeVisible();

      // Staff see it on the opening's own funnel.
      if (!isMobile) {
        await asStaff(page, await adminToken(request));
        await page.goto(`/office/openings/${openingId}`);
        await expect(page.getByRole("link", { name: /Applicants \(1\)/ })).toBeVisible();
      }
    } finally {
      const apps = await request.get(
        `/api/applications?where[opening][equals]=${openingId}&depth=0`,
        { headers },
      );
      for (const a of (await apps.json()).docs as { id: number }[])
        await request.delete(`/api/applications/${a.id}`, { headers });
      await request.delete(`/api/openings/${openingId}`, { headers });
      const members = await request.get(`/api/members?where[email][equals]=${email}`, { headers });
      for (const m of ((await members.json()).docs ?? []) as { id: number }[])
        await request.delete(`/api/members/${m.id}`, { headers });
    }
  });
});
