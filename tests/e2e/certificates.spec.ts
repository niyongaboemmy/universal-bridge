import { expect, test, type APIRequestContext } from "@playwright/test";
import { expectAccessible, presetConsent, staffHeaders, visitorIp } from "./helpers";

async function issue(request: APIRequestContext, data: Record<string, unknown> = {}) {
  const res = await request.post("/api/certificates", {
    headers: await staffHeaders(request),
    data: {
      holderName: "Jane Mukamana",
      kind: "internship",
      programTitle: "Software Engineering Internship",
      role: "Backend Intern",
      startDate: "2026-05-01",
      endDate: "2026-07-31",
      issuedAt: "2026-08-05",
      signatoryName: "Emmanuel Niyongabo",
      signatoryTitle: "Managing Director",
      ...data,
    },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  return (await res.json()).doc as { id: number; code: string; signature: string };
}

test.describe("S4 certificate verification (journey 5)", () => {
  test.use({ extraHTTPHeaders: { "x-real-ip": visitorIp() } });
  test.beforeEach(async ({ page }) => presetConsent(page));

  test("codes are unguessable and the REST API is not public (FR-CERT-03)", async ({ request }) => {
    const cert = await issue(request);
    expect(cert.code).toMatch(/^UB-2026-[0-9A-HJKMNP-TV-Z]{10}$/);
    expect((await request.get(`/api/certificates/${cert.id}`, { headers: {} })).status()).toBe(403);
  });

  test("valid certificate by code, with LinkedIn and a printable card", async ({
    page,
    request,
  }) => {
    const cert = await issue(request);
    await page.goto("/academy/verify");
    await page.getByLabel("Certificate code").fill(cert.code.toLowerCase());
    await page.getByRole("button", { name: "Verify" }).click();
    await expect(page).toHaveURL(new RegExp(`/academy/verify/${cert.code}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Verified certificate");
    await expect(page.getByText("Jane Mukamana")).toBeVisible();
    await expect(page.getByText("Backend Intern")).toBeVisible();
    const linkedIn = page.getByRole("link", { name: "Add to LinkedIn" });
    await expect(linkedIn).toHaveAttribute(
      "href",
      /linkedin\.com\/profile\/add\?startTask=CERTIFICATION_NAME/,
    );
    await expect(linkedIn).toHaveAttribute("href", new RegExp(`certId=${cert.code}`));
    await expectAccessible(page);
  });

  test("the signed QR link verifies; a tampered one is flagged (IX-05)", async ({
    page,
    request,
  }) => {
    const cert = await issue(request);
    await page.goto(`/academy/verify/${cert.code}?s=${cert.signature}`);
    await expect(page.getByText("Digital signature verified")).toBeVisible();
    // Someone edits the name on a PDF and reuses another certificate's QR signature.
    const other = await issue(request, { holderName: "Someone Else" });
    await page.goto(`/academy/verify/${cert.code}?s=${other.signature}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "This QR code doesn't match our record",
    );
  });

  test("revoked certificates say so calmly, with the reason", async ({ page, request }) => {
    const cert = await issue(request);
    const res = await request.patch(`/api/certificates/${cert.id}`, {
      headers: await staffHeaders(request),
      data: { status: "revoked", revokedReason: "Issued in error" },
    });
    expect(res.ok()).toBeTruthy();
    await page.goto(`/academy/verify/${cert.code}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "This certificate has been revoked",
    );
    await expect(page.getByText("Issued in error")).toBeVisible();
    await expect(page.getByRole("link", { name: "Add to LinkedIn" })).toHaveCount(0);
  });

  test("revoking without a reason is refused", async ({ request }) => {
    const cert = await issue(request);
    const res = await request.patch(`/api/certificates/${cert.id}`, {
      headers: await staffHeaders(request),
      data: { status: "revoked" },
    });
    expect(res.ok()).toBeFalsy();
  });

  test("unknown codes are not found", async ({ page }) => {
    await page.goto("/academy/verify/UB-2026-ZZZZZZZZZZ");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "We couldn't find this certificate",
    );
  });

  test("lookups are rate-limited (FR-CERT-03)", async ({ browser }) => {
    const ctx = await browser.newContext({ extraHTTPHeaders: { "x-real-ip": visitorIp() } });
    const page = await ctx.newPage();
    let limited = false;
    // 20 per 10 min in production; dev multiplies limits by RATE_LIMIT_SCALE (10).
    for (let batch = 0; batch < 13 && !limited; batch++) {
      const texts = await Promise.all(
        Array.from({ length: 20 }, (_, j) =>
          page.request
            .get(`/academy/verify/UB-2026-${String(batch * 20 + j).padStart(10, "0")}`)
            .then((r) => r.text()),
        ),
      );
      limited = texts.some((t) => t.includes("Too many checks"));
    }
    expect(limited).toBe(true);
    await ctx.close();
  });

  test("staff download a print-ready PDF; the public cannot (FR-CERT-04)", async ({
    request,
    playwright,
  }) => {
    const cert = await issue(request);
    const pdf = await request.get(`/api/certificate-tools/pdf/${cert.id}`, {
      headers: await staffHeaders(request),
    });
    expect(pdf.status()).toBe(200);
    expect(pdf.headers()["content-type"]).toBe("application/pdf");
    expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
    const anon = await playwright.request.newContext({
      baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    });
    expect((await anon.get(`/api/certificate-tools/pdf/${cert.id}`)).status()).toBe(403);
    await anon.dispose();
  });

  test("CSV bulk import checks first, then creates all rows (FR-CERT-04)", async ({ request }) => {
    const headers = { ...(await staffHeaders(request)), "content-type": "text/csv" };
    const bad =
      "holderName,kind,programTitle,startDate,endDate,signatoryName,signatoryTitle\nA,internship,X,2026-13-01,2026-02-01,S,T\n";
    const check = await request.post("/api/certificate-tools/import?dryRun=1", {
      headers,
      data: bad,
    });
    expect(check.status()).toBe(422);
    expect((await check.json()).errors[0].message).toContain("startDate must be a real date");

    const good =
      "holderName,kind,programTitle,role,startDate,endDate,signatoryName,signatoryTitle,issuedAt\n" +
      '"Uwase, Diane",training,UI/UX & Graphic Design,,2026-03-01,2026-04-30,Emmanuel Niyongabo,Managing Director,2026-05-02\n' +
      "Kevin Mugisha,internship,Hardware Internship,Field Intern,2026-02-01,2026-04-30,Emmanuel Niyongabo,Managing Director,2026-05-02\n";
    const dry = await request.post("/api/certificate-tools/import?dryRun=1", {
      headers,
      data: good,
    });
    expect(await dry.json()).toMatchObject({ ok: true, rows: 2, dryRun: true });
    const done = await (
      await request.post("/api/certificate-tools/import", { headers, data: good })
    ).json();
    expect(done).toMatchObject({ ok: true, created: 2 });
    expect(done.codes[0]).toMatch(/^UB-2026-/);
  });

  test("the signing public key is published", async ({ request }) => {
    const key = await (await request.get("/.well-known/ub-certificates")).json();
    expect(key).toMatchObject({ algorithm: "Ed25519" });
    expect(key.publicKey).toMatch(/^[0-9a-f]{64}$/);
  });
});
