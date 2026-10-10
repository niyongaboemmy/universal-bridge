import { expect, test } from "@playwright/test";
import { expectAccessible, presetConsent, staffHeaders } from "./helpers";

// Pages completed after the SRS gap review: FR-HOME-11, FR-BLOG-01/02, FR-GL-09/11,
// FR-ACA-02/03, FR-PRS-01, FR-GL-02, section-root redirects, Academy terms link.

test.describe("Completed pages", () => {
  test("home shows the latest insights (FR-HOME-11)", async ({ page }) => {
    await presetConsent(page);
    await page.goto("/");
    const section = page.locator("section", { has: page.getByRole("heading", { name: "Latest insights." }) });
    await expect(section.locator("article, li")).not.toHaveCount(0);
    await expect(section.getByRole("link", { name: "All insights" })).toHaveAttribute("href", "/insights");
  });

  test("WhatsApp shortcut on every page, out of the way of the cookie banner (FR-GL-11)", async ({ page }) => {
    await page.goto("/services");
    const fab = page.getByRole("link", { name: "Chat with us on WhatsApp" });
    await expect(fab).toBeHidden(); // cookie banner is open
    await presetConsent(page);
    await page.goto("/services");
    await expect(fab).toBeVisible();
    await expect(fab).toHaveAttribute("href", /^https:\/\/wa\.me\/250782634364\?text=Hello/);
    await page.goto("/fr/services");
    await expect(page.getByRole("link", { name: "Discutez avec nous sur WhatsApp" })).toHaveAttribute("href", /text=Bonjour/);
  });

  test("section roots redirect instead of 404", async ({ request }) => {
    const cases: [string, string][] = [
      ["/company", "/company/about"],
      ["/legal", "/legal/privacy"],
      ["/fr/company", "/fr/company/about"],
    ];
    for (const [from, to] of cases) {
      const res = await request.get(from, { maxRedirects: 0 });
      expect(res.status()).toBe(308);
      expect(res.headers().location).toBe(to);
    }
  });

  test("press facts are translated (FR-PRS-01)", async ({ page }) => {
    await presetConsent(page);
    await page.goto("/fr/company/press");
    await expect(page.getByText("Raison sociale")).toBeVisible();
    await expect(page.getByText("Legal name")).toHaveCount(0);
  });

  test("program filters include duration (FR-ACA-02)", async ({ page }) => {
    await presetConsent(page);
    await page.goto("/academy/programs");
    const duration = page.getByLabel("Duration");
    await expect(duration).toBeVisible();
    await expect(duration.locator("option")).toContainText(["Any", "1–3 months"]);
  });

  test("solutions menu items have a one-line description (FR-GL-02)", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop mega-menu");
    await presetConsent(page);
    await page.goto("/");
    await page.locator("[data-site-header]").getByRole("button", { name: "Solutions", exact: true }).click();
    await expect(page.getByText("School systems and e-learning")).toBeVisible();
  });

  test("insights: topic pages from post tags, author and tags on the article (FR-BLOG-01/02)", async ({ page, request, isMobile }) => {
    test.skip(isMobile, "content change runs once");
    const headers = await staffHeaders(request);
    const post = (await (await request.get("/api/posts?limit=1&sort=-publishedAt&where[_status][equals]=published", { headers })).json()).docs[0];
    test.skip(!post, "needs a published post");
    const before = post.tags ?? [];
    await request.patch(`/api/posts/${post.id}?draft=false`, { headers, data: { tags: [...before, "Mobile Money"], _status: "published" } });
    try {
      await presetConsent(page);
      await expect
        .poll(async () => (await page.goto("/insights/tag/mobile-money"))?.status(), { timeout: 30_000 })
        .toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Topic: Mobile Money/);
      await expect(page.getByRole("link", { name: post.title }).first()).toBeVisible();
      // Revalidation is stale-while-revalidate: the first view after an edit may still be cached.
      await expect
        .poll(async () => {
          await page.goto(`/insights/${post.slug}`);
          return page.getByRole("navigation", { name: "Topics" }).getByRole("link", { name: "#Mobile Money" }).count();
        }, { timeout: 30_000 })
        .toBe(1);
      await expectAccessible(page);
    } finally {
      await request.patch(`/api/posts/${post.id}?draft=false`, { headers, data: { tags: before, _status: "published" } });
    }
  });

  test("health check reports the email outbox", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ db: "ok", outbox: expect.stringMatching(/ok|attention/) });
  });
});

// Without JavaScript every step renders, so the consent (last step) is on the page.
test.describe("Academy terms link", () => {
  test.use({ javaScriptEnabled: false });
  test("academy application links the Academy terms next to the consent", async ({ page }) => {
    await page.goto("/academy/apply");
    await expect(page.getByRole("link", { name: "Academy terms" }).first()).toHaveAttribute("href", "/legal/academy-terms");
  });
});
