import { expect, test } from "@playwright/test";
import { expectAccessible, presetConsent, stubGoogleAnalytics } from "./helpers";

test.describe("S2 site shell", () => {
  test("mega-menu works with mouse and keyboard (FR-GL-02)", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop navigation");
    await presetConsent(page);
    await page.goto("/");
    // Scoped to the header: the footer's link groups are disclosure buttons on phones too.
    const header = page.locator("[data-site-header]");
    const trigger = header.getByRole("button", { name: "Services", exact: true });
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator("#mega-0");
    await expect(panel.getByRole("link", { name: /Cloud & DevOps/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    // ↓ opens and focuses the first link; ↓ again moves on
    await page.keyboard.press("ArrowDown");
    await expect(panel.getByRole("link").first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(panel.getByRole("link").nth(1)).toBeFocused();
    // → moves to the next trigger
    await page.keyboard.press("Escape");
    await page.keyboard.press("ArrowRight");
    await expect(header.getByRole("button", { name: "Solutions", exact: true })).toBeFocused();
    await expectAccessible(page);
  });

  test("mobile drawer is a modal with focus inside (FR-GL-03)", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile navigation");
    await presetConsent(page);
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Main" });
    await expect(drawer).toBeVisible();
    await drawer.getByText("Academy").click();
    await expect(drawer.getByRole("link", { name: "Internships" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });

  test("header turns to glass after scrolling (FR-GL-01)", async ({ page }) => {
    await presetConsent(page);
    await page.goto("/contact");
    const header = page.locator("[data-site-header]");
    await expect(header).toHaveAttribute("data-scrolled", "false");
    await page.mouse.wheel(0, 600);
    await expect(header).toHaveAttribute("data-scrolled", "true");
  });

  test("footer shows company channels and legal links (SRS §5.4)", async ({ page }) => {
    await presetConsent(page);
    await page.goto("/fr");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "hello@universalbridge.rw" })).toBeVisible();
    await expect(
      footer.getByRole("link", { name: "Politique de confidentialité" }),
    ).toHaveAttribute("href", "/fr/legal/privacy");
    await expect(footer.getByRole("navigation", { name: "Académie" })).toBeVisible();
  });

  test("rejecting cookies fires no analytics (journey 10, PRV-04)", async ({ page }) => {
    const google = await stubGoogleAnalytics(page);
    const analytics: string[] = [];
    await page.route("https://plausible.io/**", (route) => {
      analytics.push(route.request().url());
      return route.fulfill({ status: 204, body: "" });
    });
    await page.goto("/");
    const banner = page.getByRole("dialog", { name: "Your privacy" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Reject all" }).click();
    await expect(banner).toBeHidden();
    await page.goto("/contact");
    await page.waitForLoadState("networkidle");
    expect(analytics).toEqual([]);
    expect(google).toEqual([]);
    expect(await page.evaluate(() => "gtag" in window)).toBe(false);
    await expect(page.getByRole("dialog", { name: "Your privacy" })).toBeHidden();
  });

  test("accepting loads analytics; settings can be reopened from the footer", async ({ page }) => {
    const google = await stubGoogleAnalytics(page);
    const analytics: string[] = [];
    await page.route("https://plausible.io/**", (route) => {
      analytics.push(route.request().url());
      return route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
    });
    // First-party page views always start on consent; Plausible only when a domain is set.
    page.on("request", (r) => {
      if (new URL(r.url()).pathname === "/api/collect") analytics.push(r.url());
    });
    await page.goto("/");
    await page.getByRole("button", { name: "Accept all" }).click();
    await expect.poll(() => analytics.length).toBeGreaterThan(0);
    // Google Analytics 4: Google's gtag.js for the company stream, ads features off.
    await expect
      .poll(() => google.find((u) => u.includes("/gtag/js?id=G-")) ?? "")
      .toContain("googletagmanager.com/gtag/js?id=G-110J66XQ0H");
    const config = await page.evaluate(() =>
      JSON.stringify(
        ((window as unknown as { dataLayer: IArguments[] }).dataLayer ?? []).map((a) =>
          Array.from(a),
        ),
      ),
    );
    expect(config).toContain('"config","G-110J66XQ0H"');
    expect(config).toContain('"allow_google_signals":false');
    expect(config).toContain('"ad_storage":"denied"');

    await page.getByRole("button", { name: "Cookie settings" }).click();
    await expect(page.getByRole("switch", { name: /Analytics/ })).toBeChecked();

    // Withdrawing consent stops Google Analytics at once and deletes its cookies.
    await page.evaluate(() => {
      document.cookie = "_ga=GA1.1.123.456; path=/";
      document.cookie = "_ga_110J66XQ0H=GS1.1.1; path=/";
    });
    await page.getByRole("switch", { name: /Analytics/ }).uncheck();
    await page.getByRole("button", { name: "Save choices" }).click();
    await expect
      .poll(async () => (await page.context().cookies()).map((c) => c.name))
      .not.toContain("_ga");
    expect((await page.context().cookies()).map((c) => c.name)).not.toContain("_ga_110J66XQ0H");
    expect(
      await page.evaluate(
        () => (window as unknown as Record<string, unknown>)["ga-disable-G-110J66XQ0H"],
      ),
    ).toBe(true);
    await expect(page.locator("script[data-gtag]")).toHaveCount(0);
  });
});

test.describe("mobile menu without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("opens and closes via Invoker Commands (works before hydration)", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "mobile navigation");
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Main" });
    await expect(drawer).toBeVisible();
    await drawer.getByRole("button", { name: "Close menu" }).click();
    await expect(drawer).toBeHidden();
  });
});
