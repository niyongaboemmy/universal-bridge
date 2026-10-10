import { createHmac } from "node:crypto";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { mailTo, staffHeaders, uniqueEmail } from "./helpers";

// ADM-01 / NFR-SEC-05: invitations, password policy, normal sign-in. The two-step
// verification journey runs only when the server has MFA on (E2E_MFA=1 + MFA_ENFORCEMENT).

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function totp(secret: string, offsetSteps = 0) {
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const ch of secret.replace(/\s/g, "")) {
    value = (value << 5) | ALPHABET.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000) + offsetSteps));
  const h = createHmac("sha1", Buffer.from(bytes)).update(counter).digest();
  const o = h[h.length - 1]! & 15;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, "0");
}

const PASSWORD = "copper river 2026 bridge";

async function createStaff(request: APIRequestContext, email: string) {
  const res = await request.post("/api/users", {
    headers: await staffHeaders(request),
    data: { name: "E2E Staff", email, password: PASSWORD, roles: ["editor"] },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  return (await res.json()).doc.id as number;
}

/** The /login/reset link in the newest email with this subject. */
function resetLink(email: string, subject: string) {
  const mail = mailTo(email)
    .reverse()
    .find((m) => m.subject === subject);
  const href = /href="https?:\/\/[^/"]+(\/login\/reset\?[^"]+)"/.exec(mail?.html ?? "")?.[1];
  expect(href, `no reset link in "${subject}"`).toBeTruthy();
  return href!.replaceAll("&amp;", "&");
}

const NEW_PASSWORD = "lantern meadow 2026 harbour";

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
}

test.describe("Admin authentication", () => {
  test.skip(({ isMobile }) => isMobile, "admin flows run once, on desktop");

  test("weak passwords are refused, on create and on reset", async ({ request }) => {
    const create = await request.post("/api/users", {
      headers: await staffHeaders(request),
      data: { name: "Weak", email: uniqueEmail("weak"), password: "short1", roles: ["editor"] },
    });
    expect(create.status()).toBe(400);
    expect(await create.text()).toContain("at least 12");
    const reset = await request.post("/api/users/reset-password", {
      data: { token: "x", password: "password123" },
    });
    expect(reset.status()).toBe(400);
  });

  test("invite email, then normal email + password sign-in opens the admin", async ({
    page,
    request,
  }) => {
    test.skip(process.env.E2E_MFA === "1", "MFA journey below covers sign-in");
    const email = uniqueEmail("staff");
    const id = await createStaff(request, email);
    try {
      await expect
        .poll(() => mailTo(email).map((m) => m.subject))
        .toContain("You're invited to Universal Bridge Office");
      expect(mailTo(email)[0]!.html).toMatch(/\/login\/reset\?token=[\w-]+&(amp;)?invite=1/);
      await login(page, email);
      // Staff land in the office; the CMS is one click away.
      await page.waitForURL(/\/office/);
      await page.goto("/admin");
      await expect(page).toHaveURL(/\/admin(?!\/login)/);
      await expect(page.getByRole("link", { name: "Two-step verification" })).toHaveCount(0);
      expect((await page.request.get("/api/pages?limit=1")).status()).toBe(200);
      // The staff MFA page is switched off and sends people back to the admin.
      await page.goto("/staff/mfa");
      await expect(page).toHaveURL(/\/admin(?!\/login)/);
      const log = await request.get(`/api/audit-log?where[entityId][equals]=${id}&limit=20`, {
        headers: await staffHeaders(request),
      });
      const actions = ((await log.json()).docs as { action: string }[]).map((d) => d.action);
      expect(actions).toEqual(expect.arrayContaining(["user.create", "auth.login"]));
    } finally {
      await request.delete(`/api/users/${id}`, { headers: await staffHeaders(request) });
    }
  });

  test("invitation link: branded email → set a password → signed in to the office", async ({
    page,
    request,
  }) => {
    test.skip(process.env.E2E_MFA === "1", "MFA journey below covers sign-in");
    const email = uniqueEmail("invitee");
    const id = await createStaff(request, email);
    try {
      const subject = "You're invited to Universal Bridge Office";
      await expect.poll(() => mailTo(email).map((m) => m.subject)).toContain(subject);
      const mail = mailTo(email).find((m) => m.subject === subject)!;
      expect(mail.html).toContain("ub-mark-white-email.png");
      expect(mail.text).toContain("Accept invitation");
      const link = resetLink(email, subject);
      await page.goto(link);
      await expect(page.getByRole("heading", { name: "Welcome, E2E" })).toBeVisible();
      await expect(page.getByText(email)).toBeVisible();
      // The policy is checked live and again on the server.
      await page.getByLabel("New password").fill("short");
      await expect(page.getByText("Use at least 12 characters", { exact: false })).toBeVisible();
      await page.getByLabel("New password").fill("123456789012");
      await expect(page.getByText("This password is too common.")).toBeVisible();
      await page.getByLabel("New password").fill(NEW_PASSWORD);
      await page.getByLabel("Repeat password").fill(`${NEW_PASSWORD}!`);
      await page.getByRole("button", { name: "Activate account" }).click();
      await expect(page.locator("main").getByRole("alert")).toContainText("don't match");
      await page.getByLabel("Repeat password").fill(NEW_PASSWORD);
      await page.getByRole("button", { name: "Activate account" }).click();
      await page.waitForURL(/\/office/);
      // The link works once.
      await page.context().clearCookies();
      await page.goto(link);
      await expect(page.getByRole("heading", { name: "This link has expired" })).toBeVisible();
    } finally {
      await request.delete(`/api/users/${id}`, { headers: await staffHeaders(request) });
    }
  });

  test("forgot password: request a link → choose a new password → old one stops working", async ({
    page,
    request,
  }) => {
    test.skip(process.env.E2E_MFA === "1", "MFA journey below covers sign-in");
    const email = uniqueEmail("forgot");
    const id = await createStaff(request, email);
    try {
      test.slow();
      // Wait for the invitation first: a later one would replace the reset token.
      await expect
        .poll(() => mailTo(email).map((m) => m.subject))
        .toContain("You're invited to Universal Bridge Office");
      // Payload sends at most one password email per account every 15 seconds.
      await page.waitForTimeout(15_500);
      await page.goto("/login?forgot=1");
      await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
      await page.getByLabel("Email").fill(email);
      await page.getByRole("button", { name: "Send link" }).click();
      await expect(page.getByText("a link is on its way")).toBeVisible();
      const subject = "Reset your Universal Bridge password";
      await expect.poll(() => mailTo(email).map((m) => m.subject)).toContain(subject);
      await page.goto(resetLink(email, subject));
      await expect(page.getByRole("heading", { name: "Choose a new password" })).toBeVisible();
      await page.getByLabel("New password").fill(NEW_PASSWORD);
      await page.getByLabel("Repeat password").fill(NEW_PASSWORD);
      await page.getByRole("button", { name: "Set password & sign in" }).click();
      await page.waitForURL(/\/office/);
      // The old password no longer works.
      await page.context().clearCookies();
      await login(page, email);
      await expect(page.locator("main").getByRole("alert")).toContainText("don't match");
    } finally {
      await request.delete(`/api/users/${id}`, { headers: await staffHeaders(request) });
    }
  });

  test("old Payload reset links and expired links land on the branded page", async ({ page }) => {
    await page.goto("/admin/reset/not-a-real-token");
    await expect(page).toHaveURL(/\/login\/reset\?token=not-a-real-token/);
    await expect(page.getByRole("heading", { name: "This link has expired" })).toBeVisible();
    await page.getByRole("link", { name: "Send me a new link" }).click();
    await expect(page.getByRole("heading", { name: "Reset your password" })).toBeVisible();
  });

  test("invite → set up two-step verification → every new sign-in needs a code", async ({
    page,
    browser,
    request,
  }) => {
    test.skip(process.env.E2E_MFA !== "1", "two-step verification is switched off for now");
    const email = uniqueEmail("staff");
    const id = await createStaff(request, email);
    try {
      // The invitation is a "set your password" email with a reset link.
      await expect
        .poll(() => mailTo(email).map((m) => m.subject))
        .toContain("You're invited to Universal Bridge Office");
      expect(mailTo(email)[0]!.html).toMatch(/\/login\/reset\?token=[\w-]+&(amp;)?invite=1/);

      // First sign-in, then enrol from the staff page.
      await login(page, email);
      await page.waitForURL(/\/(office|staff\/mfa)/);
      await page.goto("/staff/mfa");
      await page.getByRole("button", { name: "Set up two-step verification" }).click();
      const secret = (await page.locator("[data-secret]").textContent())!.replace(/\s/g, "");
      await expect(page.getByRole("img", { name: /QR code/ })).toBeVisible();
      await page.getByLabel(/6-digit code/).fill("000000");
      await page.getByRole("button", { name: "Turn on two-step verification" }).click();
      await expect(page.locator("main").getByRole("alert")).toContainText("didn't match");
      await page.getByLabel(/6-digit code/).fill(totp(secret));
      await page.getByRole("button", { name: "Turn on two-step verification" }).click();
      const list = page.getByRole("list", { name: "Recovery codes" });
      await expect(list.locator("li")).toHaveCount(10);
      const codes = await list.locator("li").allTextContents();
      expect(codes).toHaveLength(10);
      await page.getByRole("button", { name: /continue/ }).click();
      await expect(page).toHaveURL(/\/(office|admin)/);

      // A new browser: the password alone no longer opens the admin or the API.
      const ctx = await browser.newContext();
      const fresh = await ctx.newPage();
      await login(fresh, email);
      await fresh.waitForURL(/\/staff\/mfa\?next=/);
      await expect(fresh.getByRole("heading", { name: "Confirm it's you" })).toBeVisible();
      const api = await fresh.request.get("/api/pages?limit=1");
      expect(api.status()).toBe(401);
      expect(await api.text()).toContain("MFA_REQUIRED");

      // A recovery code works once.
      await fresh.getByRole("button", { name: "Use a recovery code" }).click();
      await fresh.getByLabel(/recovery codes/).fill(codes[0]!);
      await fresh.getByRole("button", { name: "Verify" }).click();
      await fresh.waitForURL(/\/(office|admin)(?!\/login)/);
      expect((await fresh.request.get("/api/pages?limit=1")).status()).toBe(200);
      await ctx.close();

      // Reused recovery codes are refused.
      const ctx2 = await browser.newContext();
      const again = await ctx2.newPage();
      await login(again, email);
      await again.waitForURL(/\/staff\/mfa/);
      await again.getByRole("button", { name: "Use a recovery code" }).click();
      await again.getByLabel(/recovery codes/).fill(codes[0]!);
      await again.getByRole("button", { name: "Verify" }).click();
      await expect(again.locator("main").getByRole("alert")).toContainText("didn't work");
      // The next app code works.
      await again.getByRole("button", { name: "Use the authenticator app instead" }).click();
      await again.getByLabel(/6-digit code/).fill(totp(secret, 1));
      await again.getByRole("button", { name: "Verify" }).click();
      await again.waitForURL(/\/(office|admin)(?!\/login)/);
      await ctx2.close();

      // Sign-ins and MFA events are in the audit log.
      const log = await request.get(`/api/audit-log?where[entityId][equals]=${id}&limit=50`, {
        headers: await staffHeaders(request),
      });
      const actions = ((await log.json()).docs as { action: string }[]).map((d) => d.action);
      expect(actions).toEqual(
        expect.arrayContaining([
          "user.create",
          "auth.login",
          "auth.mfa-enrolled",
          "auth.mfa-verified",
          "auth.mfa-failed",
        ]),
      );
    } finally {
      await request.delete(`/api/users/${id}`, { headers: await staffHeaders(request) });
    }
  });
});
