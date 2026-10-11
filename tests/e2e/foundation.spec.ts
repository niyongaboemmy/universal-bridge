import { expect, test } from "@playwright/test";
import { expectAccessible, presetConsent, setTheme } from "./helpers";

test.describe("S1 foundation", () => {
  test.beforeEach(async ({ page }) => presetConsent(page));

  for (const [path, lang] of [
    ["/", "en"],
    ["/fr", "fr"],
    ["/rw", "rw"],
  ] as const) {
    test(`home renders in ${lang} with lang attribute`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  for (const theme of ["light", "dark"] as const) {
    test(`home is accessible in ${theme} theme`, async ({ page }) => {
      await setTheme(page, theme);
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expectAccessible(page);
    });
  }

  test("skip link moves focus to main content", async ({ page, isMobile, browserName }) => {
    test.skip(isMobile, "keyboard journey");
    await page.goto("/");
    // Safari's Tab skips links by default; Option+Tab is how its keyboard users reach them.
    await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("language switcher keeps the current page", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: /Change language/ }).click();
    await page.getByRole("link", { name: "Français" }).click();
    await expect(page).toHaveURL(/\/fr$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });

  test("theme toggle switches and persists", async ({ page, isMobile }) => {
    await setTheme(page, "light");
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Open menu" }).click();
    const toggle = page.getByRole("button", { name: "Dark theme" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    if (isMobile) {
      // After the reload, wait for the drawer to be open before looking inside it.
      await expect(async () => {
        await page.getByRole("button", { name: "Open menu" }).click();
        await expect(page.getByRole("dialog")).toBeVisible({ timeout: 2000 });
      }).toPass({ timeout: 15_000 });
    }
    // aria-pressed appears once React has loaded (the server can't know the saved theme).
    await expect(page.getByRole("button", { name: "Dark theme" })).toHaveAttribute(
      "aria-pressed",
      "true",
      { timeout: 30_000 },
    );
  });

  test("unknown pages return a localised 404", async ({ page }) => {
    const res = await page.goto("/fr/this-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Ce pont n'est pas encore terminé",
    );
  });

  test("legacy URLs 301 to their new home (SRS §5.3)", async ({ request }) => {
    for (const [from, to] of [
      ["/team", "/company/leadership"],
      ["/agents", "/company/partners"],
      ["/application", "/academy/apply"],
      ["/internship", "/academy/internships"],
      ["/online_trainings", "/academy/programs?mode=online"],
    ]) {
      const res = await request.get(from!, { maxRedirects: 0 });
      expect(res.status(), from).toBe(301);
      expect(res.headers().location, from).toContain(to);
    }
  });

  test("security headers are sent (NFR-SEC-02)", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });

  test("health endpoint checks the database", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    expect((await res.json()).db).toBe("ok");
  });
});
