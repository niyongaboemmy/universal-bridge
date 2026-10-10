import { expect, test } from "@playwright/test";
import { adminToken, staffHeaders } from "./helpers";

// Runs alone after the other projects (playwright.config.ts): it takes the public site down.

const SITE = process.env.E2E_BASE_URL ?? "http://localhost:3000";

test("maintenance mode: visitors get the holding page (503), staff still see the site", async ({
  browser,
  request,
}) => {
  const headers = await staffHeaders(request);
  const set = (on: boolean) =>
    request.post("/api/globals/system-settings", {
      headers,
      data: {
        site: { maintenance: on, maintenanceMessage: on ? "Back in a moment (e2e)." : null },
      },
    });
  expect((await set(true)).ok()).toBeTruthy();
  const visitor = await browser.newContext();
  try {
    // The proxy re-reads the switch every 15 s.
    await expect
      .poll(async () => (await visitor.request.get("/services")).status(), {
        timeout: 40_000,
        intervals: [2000],
      })
      .toBe(503);
    const page = await visitor.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "We're improving the site" })).toBeVisible();
    await expect(page.getByText("Back in a moment (e2e).")).toBeVisible();

    const staff = await browser.newContext();
    await staff.addCookies([
      { name: "payload-token", value: await adminToken(request), url: SITE },
    ]);
    expect((await staff.request.get("/services")).status()).toBe(200);
    // The office says it's on.
    const office = await staff.newPage();
    await office.goto("/office");
    await expect(office.getByText("Maintenance mode is on.")).toBeVisible();
    await staff.close();
  } finally {
    await set(false);
    await expect
      .poll(async () => (await visitor.request.get("/services")).status(), {
        timeout: 40_000,
        intervals: [2000],
      })
      .toBe(200);
    await visitor.close();
  }
});
