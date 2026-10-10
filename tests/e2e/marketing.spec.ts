import { expect, test, type APIRequestContext } from "@playwright/test";
import {
  adminToken,
  expectAccessible,
  presetConsent,
  setTheme,
  stubTurnstile,
  uniqueEmail,
} from "./helpers";

const TEMPLATES = [
  ["/", "Software, AI and devices — engineered in Kigali."],
  ["/services", "Everything you need to build, run and grow software."],
  ["/services/cloud-devops", "Cloud & DevOps"],
  ["/solutions", "Technology that understands your sector."],
  ["/solutions/agriculture", "Agriculture"],
  // Case-study list once any is published; the proof-of-work page until then (audit v2 U-1).
  ["/work", /^(Proof, not promises\.|Work you can see today\.)$/],
  ["/products", "Products we build and run."],
  ["/products/nyambika-design", "Nyambika Design"],
  ["/book", "Book a discovery call"],
] as const satisfies readonly (readonly [string, string | RegExp])[];

test.describe("S3 marketing templates", () => {
  test.beforeEach(async ({ page }) => presetConsent(page));

  for (const [path, h1] of TEMPLATES) {
    test(`${path} renders with one H1, metadata and no a11y violations`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
      // SEO-01/02: unique title, description, canonical and hreflang alternates.
      await expect(page).toHaveTitle(/Universal Bridge/);
      expect(await page.locator('meta[name="description"]').getAttribute("content")).toBeTruthy();
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        new RegExp(`${path === "/" ? "/?$" : path}$`),
      );
      for (const lang of ["en", "fr", "rw", "x-default"]) {
        await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
      }
      await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute(
        "content",
        /\/api\/og\?title=/,
      );
      await expectAccessible(page);
    });
  }

  test("templates are accessible in dark theme", async ({ page }) => {
    await setTheme(page, "dark");
    for (const path of ["/", "/services/ai-data", "/products/nyambika-design"]) {
      await page.goto(path);
      await expectAccessible(page);
    }
  });

  test("core pages are translated (I18N-06)", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Logiciels, IA et objets connectés — conçus à Kigali.",
    );
    await page.goto("/rw/services");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ibyo ukeneye byose");
    // Untranslated detail fields fall back to English rather than showing blanks.
    await page.goto("/rw/services/managed-it");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Ubufasha bwa IT no kubungabunga",
    );
    await expect(page.getByText("Fewer outages, faster fixes")).toBeVisible();
  });

  test("home hides sections without verified content (FR-HOME-07, CNT-04, OI-02)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByText("What our clients say.")).toHaveCount(0); // no approved testimonials
    await expect(page.getByText("Years building software in Kigali").last()).toBeVisible();
    await expect(page.getByText(/Verified Oct 2026/).first()).toBeVisible();
    await expect(page.getByText("Clients served")).toHaveCount(0); // unverified stat stays private
  });

  test("services overview filters by pillar (FR-SRV-01)", async ({ page }) => {
    await page.goto("/services");
    const cards = page.locator("[data-pillar]");
    await expect(cards).toHaveCount(8);
    await page.getByRole("radio", { name: "Innovation" }).click();
    await expect(page.getByRole("radio", { name: "Innovation" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(cards.filter({ visible: true })).toHaveCount(2);
    await page.getByRole("radio", { name: "All services" }).click();
    await expect(cards.filter({ visible: true })).toHaveCount(8);
    await expect(page.locator("#engagement")).toContainText("Dedicated team");
  });

  test("service page has FAQ and Service JSON-LD (SEO-04)", async ({ page }) => {
    await page.goto("/services/custom-software");
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = ld.flatMap((t) => {
      const j = JSON.parse(t);
      return j["@graph"] ? j["@graph"].map((g: { "@type": string }) => g["@type"]) : [j["@type"]];
    });
    expect(types.flat()).toEqual(
      expect.arrayContaining(["Organization", "WebSite", "BreadcrumbList", "Service", "FAQPage"]),
    );
    await page.getByText("Do we own the code and designs?").click();
    await expect(page.getByText(/the code, designs and documentation are yours/)).toBeVisible();
  });
});

test.describe("S3 SEO files", () => {
  test("sitemap lists every locale with alternates (SEO-03)", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(xml).toContain("/services/cloud-devops</loc>");
    expect(xml).toContain("/fr/services/cloud-devops</loc>");
    expect(xml).toContain("/rw/solutions/agriculture</loc>");
    expect(xml).toMatch(/hreflang="x-default"/);
  });

  test("robots allows the site and hides admin (SEO-09)", async ({ request }) => {
    const txt = await (await request.get("/robots.txt")).text();
    expect(txt).toContain("Disallow: /admin");
    expect(txt).toContain("Sitemap:");
  });

  test("brand OG image, favicons and manifest (SEO-05, SRS §4.4)", async ({ request }) => {
    const og = await request.get("/api/og?title=Hello");
    expect(og.headers()["content-type"]).toBe("image/png");
    for (const url of ["/icon.svg", "/icons/192", "/icons/maskable-512", "/apple-icon"]) {
      expect((await request.get(url)).status(), url).toBe(200);
    }
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === "maskable")).toBe(true);
  });
});

// Fixtures go through the real admin API (staff access), then are removed.
async function createCaseStudy(request: APIRequestContext, token: string, title: string) {
  const headers = { Authorization: `JWT ${token}` };
  const find = async (col: string, slug: string) =>
    (
      await (
        await request.get(`/api/${col}?where[slug][equals]=${slug}&depth=0`, { headers })
      ).json()
    ).docs[0].id;
  const res = await request.post("/api/case-studies", {
    headers,
    data: {
      title,
      _status: "published",
      client: {
        name: "Kigali Test Cooperative",
        anonymised: true,
        label: "A farming cooperative in Rwanda",
      },
      industry: await find("industries", "agriculture"),
      services: [await find("services", "embedded-iot")],
      technologies: [await find("technologies", "esp32")],
      region: "rwanda",
      year: 2026,
      summary: "Soil sensors and SMS alerts for 400 member farms.",
      results: [{ value: "31%", label: "less water used" }],
      challenge: {
        root: {
          type: "root",
          version: 1,
          direction: "ltr",
          format: "",
          indent: 0,
          children: [
            {
              type: "paragraph",
              version: 1,
              direction: "ltr",
              format: "",
              indent: 0,
              textFormat: 0,
              children: [
                {
                  type: "text",
                  version: 1,
                  text: "Farmers irrigated by guesswork.",
                  format: 0,
                  detail: 0,
                  mode: "normal",
                  style: "",
                },
              ],
            },
          ],
        },
      },
    },
  });
  expect(res.ok(), await res.text()).toBeTruthy();
  return (await res.json()).doc as { id: number; slug: string };
}

test.describe("S3 CMS-driven journeys", () => {
  test.describe.configure({ mode: "serial" });

  // Publishing changes /work for every test, so these data journeys run in one
  // project only and in order: the empty state first, then a published case study.
  test("without case studies /work shows verifiable work (audit v2 U-1)", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Data journey: runs once, in the desktop project");
    await presetConsent(page);
    await page.goto("/work");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Work you can see today.");
    await expect(page.getByRole("heading", { name: "Nyambika Design" })).toBeVisible();
    const main = page.locator("#main");
    await expect(main.getByRole("link", { name: "Verify a certificate" })).toHaveAttribute(
      "href",
      "/academy/verify",
    );
    await expect(main.getByRole("link", { name: "Request a reference call" })).toHaveAttribute(
      "href",
      "/contact?topic=sales",
    );
    await expectAccessible(page);
  });

  test("a published case study appears, is filterable and anonymised (FR-WORK-01/02/03)", async ({
    page,
    request,
    isMobile,
  }) => {
    test.skip(isMobile, "Data journey: runs once, in the desktop project");
    const token = await adminToken(request);
    const cs = await createCaseStudy(request, token, `E2E sensors ${Date.now()}`);
    try {
      await presetConsent(page);
      await expect(async () => {
        await page.goto("/work");
        await expect(page.locator(`[data-case="${cs.id}"]`)).toBeVisible();
      }).toPass({ timeout: 60_000 });
      await expect(page.locator(`[data-case="${cs.id}"]`)).toContainText(
        "A farming cooperative in Rwanda",
      );
      await expect(page.locator(`[data-case="${cs.id}"]`)).not.toContainText(
        "Kigali Test Cooperative",
      );

      await page.goto("/work?region=europe");
      await expect(page.locator(`[data-case="${cs.id}"]`)).toBeHidden();
      await page.goto("/work?industry=agriculture");
      await expect(page.locator(`[data-case="${cs.id}"]`)).toBeVisible();

      await page.locator(`[data-case="${cs.id}"] a`).first().click();
      await expect(page).toHaveURL(new RegExp(`/work/${cs.slug}$`));
      await expect(page.getByRole("region", { name: "Results" }).getByText("31%")).toBeVisible();
      await expect(page.getByText("Farmers irrigated by guesswork.")).toBeVisible();
      await expectAccessible(page);
    } finally {
      await request.delete(`/api/case-studies/${cs.id}`, {
        headers: { Authorization: `JWT ${token}` },
      });
    }
  });

  test("an editor's change is live in under 60 s (journey 7, CMS-08)", async ({
    page,
    request,
  }) => {
    const token = await adminToken(request);
    const headers = { Authorization: `JWT ${token}` };
    const service = (
      await (
        await request.get("/api/services?where[slug][equals]=managed-it&depth=0", { headers })
      ).json()
    ).docs[0];
    const original = service.summary as string;
    const edited = `Edited in E2E at ${Date.now()}`;
    try {
      const res = await request.patch(`/api/services/${service.id}?locale=en`, {
        headers,
        data: { summary: edited, _status: "published" },
      });
      expect(res.ok()).toBeTruthy();
      const started = Date.now();
      await expect(async () => {
        await page.goto("/services");
        await expect(page.getByText(edited)).toBeVisible({ timeout: 2_000 });
      }).toPass({ timeout: 60_000 });
      expect(Date.now() - started).toBeLessThan(60_000);
    } finally {
      await request.patch(`/api/services/${service.id}?locale=en`, {
        headers,
        data: { summary: original, _status: "published" },
      });
    }
  });

  test("product demo requests reach the sales inbox (FR-PRD-02)", async ({ page, request }) => {
    await presetConsent(page);
    await stubTurnstile(page);
    const email = uniqueEmail("demo");
    await page.goto("/products/nyambika-design#demo");
    const form = page.locator("#demo form");
    await form.getByLabel("Full name").fill("Demo Requester");
    await form.getByLabel("Work email").fill(email);
    await form
      .getByLabel("What would you use it for?")
      .fill("We want uniforms for 300 staff made by local cooperatives.");
    await form.getByRole("checkbox", { name: /I agree/ }).check();
    await form.getByRole("button", { name: "Send" }).click();
    await expect(page.getByRole("heading", { name: "You're connected." })).toBeVisible();
    const token = await adminToken(request);
    const lead = (
      await (
        await request.get(`/api/leads?where[email][equals]=${encodeURIComponent(email)}`, {
          headers: { Authorization: `JWT ${token}` },
        })
      ).json()
    ).docs[0];
    expect(lead).toMatchObject({ department: "sales", product: "nyambika-design" });
  });
});
