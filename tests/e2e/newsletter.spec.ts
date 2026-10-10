import { expect, test } from "@playwright/test";
import { mailTo, presetConsent, uniqueEmail, visitorIp } from "./helpers";

test.describe("S4 newsletter (double opt-in)", () => {
  test.use({ extraHTTPHeaders: { "x-real-ip": visitorIp() } });

  test("subscribe from the footer, confirm by email", async ({ page }) => {
    await presetConsent(page);
    const email = uniqueEmail("news");
    await page.goto("/fr");
    const footer = page.locator("footer");
    await footer.getByPlaceholder("Adresse e-mail").fill(email);
    await footer.getByRole("checkbox").check();
    await footer.getByRole("button", { name: "S'abonner" }).click();
    await expect(footer.getByRole("status")).toContainText(
      "confirmez depuis votre boîte de réception",
    );
    await expect.poll(() => mailTo(email).length, { timeout: 15_000 }).toBe(1);
    const mail = mailTo(email)[0]!;
    expect(mail.subject).toBe("Confirmez votre abonnement aux analyses Universal Bridge");
    const link = /href="([^"]*\/api\/newsletter\/confirm\?token=[^"]+)"/
      .exec(mail.html)![1]!
      .replace(/&amp;/g, "&");
    await page.goto(new URL(link).pathname + new URL(link).search);
    await expect(page).toHaveURL(/\/fr\/newsletter\/confirmed$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Abonnement confirmé");
    // The token is single-use.
    await page.goto(new URL(link).pathname + new URL(link).search);
    await expect(page).toHaveURL(/\/newsletter\/invalid$/);
  });

  test("consent is required", async ({ page }) => {
    await presetConsent(page);
    await page.goto("/");
    const footer = page.locator("footer");
    await footer.getByPlaceholder("Email address").fill(uniqueEmail("noconsent"));
    await footer.getByRole("button", { name: "Subscribe" }).click();
    await expect(footer.getByRole("alert")).toContainText("Please agree to the privacy policy");
  });
});
