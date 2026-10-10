import { expect, test } from "@playwright/test";
import { presetConsent, staffHeaders, uniqueEmail } from "./helpers";

// ADM-06 CSV export, ADM-09 data-subject requests, §11 retention cron.

test.describe("Staff data tools", () => {
  test.skip(({ isMobile }) => isMobile, "API checks run once");

  test("CSV export: staff only, filtered, logged, formula-safe", async ({ request }) => {
    expect((await request.get("/api/staff/export/leads")).status()).toBe(401);
    expect(
      (
        await request.get("/api/staff/export/users", { headers: await staffHeaders(request) })
      ).status(),
    ).toBe(404);
    const res = await request.get("/api/staff/export/leads?status=new", {
      headers: await staffHeaders(request),
    });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/csv");
    expect(res.headers()["content-disposition"]).toMatch(
      /attachment; filename="ub-leads-\d{4}-\d{2}-\d{2}\.csv"/,
    );
    const csv = await res.text();
    expect(csv.split("\r\n")[0]).toContain("ref,createdAt,status,department,name,email");
    for (const line of csv.split("\r\n").slice(1).filter(Boolean))
      expect(line.split(",")[2]).toBe("new");
    const log = await request.get(
      "/api/audit-log?where[action][equals]=export.csv&sort=-at&limit=1",
      { headers: await staffHeaders(request) },
    );
    expect((await log.json()).docs[0].entity).toBe("leads");
  });

  test("privacy request: find, download and erase one person", async ({ page, request }) => {
    const email = uniqueEmail("dsr");
    await presetConsent(page);
    await page.goto("/");
    const footer = page.locator("footer");
    await footer.getByPlaceholder("Email address").fill(email);
    await footer.getByRole("checkbox").check();
    await footer.getByRole("button", { name: "Subscribe" }).click();
    await expect(footer.getByRole("status")).toBeVisible();

    const headers = await staffHeaders(request);
    const found = await (
      await request.get(`/api/staff/privacy?email=${encodeURIComponent(email)}`, { headers })
    ).json();
    expect(found.subscribers).toBe(1);
    const dl = await request.get(
      `/api/staff/privacy?email=${encodeURIComponent(email)}&download=1`,
      { headers },
    );
    expect(dl.headers()["content-disposition"]).toContain("attachment");
    const bundle = await dl.json();
    expect(bundle.subscribers[0].email).toBe(email);
    expect(bundle.subscribers[0].token).toBeUndefined();

    expect(
      (
        await request.post("/api/staff/privacy", {
          headers,
          data: { email, confirm: "nope@example.org" },
        })
      ).status(),
    ).toBe(400);
    const erased = await (
      await request.post("/api/staff/privacy", { headers, data: { email, confirm: email } })
    ).json();
    expect(erased.subscribers).toBe(1);
    expect(
      (
        await (
          await request.get(`/api/staff/privacy?email=${encodeURIComponent(email)}`, { headers })
        ).json()
      ).subscribers,
    ).toBe(0);

    const log = await request.get("/api/audit-log?where[entity][equals]=privacy&sort=-at&limit=3", {
      headers,
    });
    const entries = (await log.json()).docs as { action: string; meta: Record<string, unknown> }[];
    expect(entries.map((e) => e.action)).toContain("privacy.erase");
    expect(JSON.stringify(entries)).not.toContain(email); // hashed reference only
  });

  test("privacy tool page is in the admin for super admins", async ({ page, request }) => {
    const token = (await staffHeaders(request)).Authorization.replace("JWT ", "");
    await page
      .context()
      .addCookies([{ name: "payload-token", value: token, url: "http://localhost:3000" }]);
    await page.goto("/admin/privacy");
    await expect(page.getByRole("heading", { name: "Privacy requests" })).toBeVisible();
    await page.getByLabel("Email address").fill("nobody-here@example.org");
    await page.getByRole("button", { name: "Find" }).click();
    await expect(
      page.getByRole("heading", { name: /Nothing held for nobody-here@example.org/ }),
    ).toBeVisible();
    await page.goto("/admin/collections/leads");
    await expect(page.getByRole("link", { name: /Export CSV/ })).toHaveAttribute(
      "href",
      "/api/staff/export/leads",
    );
  });

  test("cron routes refuse requests without the secret", async ({ request }) => {
    expect((await request.get("/api/cron/outbox")).status()).toBe(401);
    expect(
      (
        await request.get("/api/cron/outbox", { headers: { authorization: "Bearer undefined" } })
      ).status(),
    ).toBe(401);
    expect((await request.get("/api/cron/retention")).status()).toBe(401);
    if (process.env.CRON_SECRET) {
      const dry = await request.get("/api/cron/retention?dry=1", {
        headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
      });
      expect(await dry.json()).toMatchObject({
        dryRun: true,
        leads: expect.any(Number),
        outbox: expect.any(Number),
      });
    }
  });
});
