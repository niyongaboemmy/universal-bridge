import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { adminToken, expectAccessible, presetConsent, stubTurnstile, uniqueEmail } from "./helpers";

function mailTo(address: string) {
  const dir = path.resolve(".data/mail");
  try {
    return readdirSync(dir)
      .map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")))
      .filter((m) => [m.to].flat().includes(address));
  } catch {
    return [];
  }
}

async function fillValid(page: Page, email: string) {
  await page.getByLabel("Full name").fill("Amina Uwase");
  await page.getByLabel("Work email").fill(email);
  // Optional fields sit in a closed "More details" panel (UI/UX audit v2 U-3).
  await page.getByText("More details (optional)").click();
  await page.getByLabel("Company or organisation").fill("Kigali Cooperative Union");
  await page.getByLabel(/^Country/).selectOption("RW");
  await page.locator("#contact-phone").fill("0782 634 364");
  await page.getByLabel("Budget (USD)").selectOption("15to50k");
  await page
    .getByLabel("Tell us about your project")
    .fill("We need a mobile app so our 2,000 members can track orders and payments.");
  await page.getByRole("checkbox", { name: /I agree/ }).check();
}

test.describe("S2 project inquiry (journey 1 partial)", () => {
  test.use({ extraHTTPHeaders: { "x-real-ip": `203.0.113.${Math.floor(Math.random() * 250)}` } });
  test.beforeEach(async ({ page }) => {
    await presetConsent(page);
    await stubTurnstile(page);
  });

  test("shows an error summary and inline errors (FR-FORM-02)", async ({ page }) => {
    await page.goto("/contact");
    await page.getByRole("button", { name: "Send" }).click();
    const summary = page.locator("form").getByRole("alert");
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("Please fix 4 problems below");
    await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#contact-consent-error")).toHaveText(
      "Please agree to the privacy policy so we can reply.",
    );
    await summary.getByRole("link", { name: /Full name/ }).click();
    await expect(page.getByLabel("Full name")).toBeFocused();
    await expectAccessible(page);
  });

  test("submits, emails both sides and lands in the admin inbox", async ({ page, request }) => {
    const email = uniqueEmail("lead");
    await page.goto("/contact?utm_source=linkedin&utm_campaign=launch");
    await fillValid(page, email);
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("heading", { name: "You're connected." })).toBeFocused();
    const refText = await page.getByText(/^Reference: L-/).textContent();
    const ref = refText!.replace("Reference: ", "").trim();

    // Confirmation email to the visitor (sent by the outbox after the response).
    await expect.poll(() => mailTo(email).length, { timeout: 15_000 }).toBe(1);
    expect(mailTo(email)[0].subject).toContain(ref);

    // Staff see it, with tracking and consent recorded (FR-FORM-04/06/09).
    const token = await adminToken(request);
    const res = await request.get(`/api/leads?where[ref][equals]=${ref}`, {
      headers: { Authorization: `JWT ${token}` },
    });
    const lead = (await res.json()).docs[0];
    expect(lead).toMatchObject({
      status: "new",
      department: "sales",
      phone: "+250782634364",
      budgetRange: "15to50k",
      botCheck: "passed",
    });
    expect(lead.tracking.utm).toMatchObject({ utm_source: "linkedin", utm_campaign: "launch" });
    expect(lead.consent.version).toBe("privacy-2026-10-v1");
    expect(lead.consent.text).toContain("privacy policy");
  });

  test("leads are not readable without staff access (ADM-01)", async ({ request }) => {
    const res = await request.get("/api/leads");
    expect(res.status()).toBe(403);
  });

  test("works in French and preselects a department from ?topic", async ({ page }) => {
    await page.goto("/fr/contact?topic=academy");
    await expect(page.getByRole("radio", { name: "Académie et formations" })).toBeChecked();
    await expect(page.getByLabel("Budget (USD)")).toHaveCount(0);
  });

  test("keyboard-only user completes the form (journey 9)", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard journey");
    const email = uniqueEmail("kbd");
    await page.goto("/contact");
    await page.getByLabel("Full name").focus();
    await page.keyboard.type("Jean Mugisha");
    await page.keyboard.press("Tab");
    await page.keyboard.type(email);
    // Jump to the message field and consent via Tab only.
    for (
      let i = 0;
      i < 20 &&
      !(await page
        .getByLabel("Tell us about your project")
        .evaluate((el) => el === document.activeElement));
      i++
    ) {
      await page.keyboard.press("Tab");
    }
    await page.keyboard.type("Please quote a support retainer for our 40 office computers.");
    for (
      let i = 0;
      i < 6 &&
      !(await page
        .getByRole("checkbox", { name: /I agree/ })
        .evaluate((el) => el === document.activeElement));
      i++
    ) {
      await page.keyboard.press("Tab");
    }
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: "Send" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "You're connected." })).toBeVisible();
  });
});

test.describe("progressive enhancement (FR-FORM-10)", () => {
  // Each run is a distinct visitor, so production rate limits (3/h without JS) don't collide.
  test.use({
    javaScriptEnabled: false,
    extraHTTPHeaders: { "x-real-ip": `198.51.100.${Math.floor(Math.random() * 250)}` },
  });

  test("the form submits without JavaScript and is flagged for review", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail("nojs");
    await page.goto("/contact");
    await page.getByLabel("Full name").fill("No Script Person");
    await page.getByLabel("Work email").fill(email);
    await page
      .getByLabel("Tell us about your project")
      .fill("Testing the no-JavaScript path for the project inquiry form.");
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("heading", { name: "You're connected." })).toBeVisible();
    const token = await adminToken(request);
    const res = await request.get(`/api/leads?where[email][equals]=${encodeURIComponent(email)}`, {
      headers: { Authorization: `JWT ${token}` },
    });
    expect((await res.json()).docs[0].botCheck).toBe("missing");
  });

  test("server validation re-renders errors and keeps typed values", async ({ page }) => {
    await page.goto("/contact");
    await page.getByLabel("Full name").fill("Kept Value");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("Please fix");
    await expect(page.getByLabel("Full name")).toHaveValue("Kept Value");
  });
});
