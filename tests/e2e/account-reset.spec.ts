import { expect, test } from "@playwright/test";
import { mailTo, presetConsent, staffHeaders, testClientIp, uniqueEmail } from "./helpers";

// INT-01 / website accounts: "forgot password" sends a branded email in the member's
// language, and its link sets a new password and signs them in.

test("website account: reset email in the member's language → new password → signed in", async ({
  page,
  request,
  isMobile,
}) => {
  test.skip(isMobile, "runs once, on desktop");
  const headers = await staffHeaders(request);
  const email = uniqueEmail("member-reset");
  const created = await request.post("/api/members", {
    headers,
    data: { name: "Aline Uwase", email, password: "a quiet river at dawn", locale: "fr" },
  });
  expect(created.ok(), await created.text()).toBeTruthy();
  const id = (await created.json()).doc.id as number;
  try {
    const forgot = await request.post("/api/members/forgot-password", {
      headers: testClientIp(),
      data: { email },
    });
    expect(forgot.ok(), await forgot.text()).toBeTruthy();
    const subject = "Réinitialisez votre mot de passe Universal Bridge";
    await expect.poll(() => mailTo(email).map((m) => m.subject)).toContain(subject);
    const mail = mailTo(email).find((m) => m.subject === subject)!;
    expect(mail.html).toContain('lang="fr"');
    expect(mail.text).toContain("Bonjour Aline,");
    const href = /href="https?:\/\/[^/"]+(\/fr\/account\/reset\?token=[^"]+)"/.exec(mail.html)?.[1];
    expect(href).toBeTruthy();

    await presetConsent(page);
    await page.goto(href!.replaceAll("&amp;", "&"));
    await page.locator("input[name=password]").fill("a brighter river at noon");
    await page.getByRole("button", { name: "Enregistrer le mot de passe" }).click();
    await page.waitForURL(/\/fr\/account\?reset=1/);
  } finally {
    await request.delete(`/api/members/${id}`, { headers });
  }
});
