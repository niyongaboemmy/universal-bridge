import { expect, test } from "@playwright/test";
import {
  expectAccessible,
  mailTo,
  presetConsent,
  staffHeaders,
  stubTurnstile,
  uniqueEmail,
  visitorIp,
} from "./helpers";

test.beforeEach(async ({ page }) => presetConsent(page));

test.describe("S5 company and labs pages", () => {
  for (const [path, heading] of [
    ["/labs", "Where new ideas get built."],
    ["/labs/coding-hub", "Coding Hub"],
    ["/company/about", "Technology that connects people and opportunities."],
    ["/company/leadership", "Leadership"],
    ["/company/events", "Events & hackathons"],
    ["/company/press", "Press"],
    ["/insights", "Insights"],
    [
      "/insights/building-web-apps-for-3g",
      "Building web apps that work on 3G and a mid-range Android",
    ],
    ["/legal/privacy", "Privacy policy"],
  ] as const) {
    test(`${path} renders and is accessible`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expectAccessible(page);
    });
  }

  test("labs lists the three hubs and links to each (FR-LAB-01)", async ({ page }) => {
    await page.goto("/labs");
    for (const hub of ["Coding Hub", "AI Innovations Hub", "Embedded Systems Hub"])
      await expect(page.getByRole("heading", { name: hub })).toBeVisible();
    await page
      .getByRole("link", { name: /Embedded Systems Hub|Explore/ })
      .last()
      .click();
    await expect(page).toHaveURL(/\/labs\/embedded-systems-hub$/);
    await expect(page.getByText("Pilot")).toBeVisible();
    // AI renders are labelled (OI-06).
    await expect(page.getByText("Concept").first()).toBeVisible();
  });

  test("leadership shows names from the current site, no personal contacts (FR-TEAM-03)", async ({
    page,
  }) => {
    await page.goto("/company/leadership");
    await expect(page.getByText("Emmanuel Niyongabo")).toBeVisible();
    await expect(page.getByText("Chief Technology Officer")).toBeVisible();
    await expect(
      page
        .locator('a[href^="mailto:"], a[href^="tel:"]')
        .filter({ hasNot: page.locator("footer *") }),
    ).toHaveCount(await page.locator('footer a[href^="mailto:"], footer a[href^="tel:"]').count());
  });

  test("localized pages fall back to English content where untranslated", async ({ page }) => {
    await page.goto("/fr/company/about");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Une technologie qui relie les personnes et les opportunités.",
    );
  });
});

test.describe("S5 insights", () => {
  test("category tabs filter posts and are shareable links (FR-BLOG-01)", async ({ page }) => {
    await page.goto("/insights");
    await page.getByRole("link", { name: "Academy", exact: true }).last().click();
    await expect(page).toHaveURL(/\/insights\/category\/academy$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Academy");
    await expect(
      page.getByRole("heading", { name: /Hiring your first junior developer/ }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /data protection law/ })).toHaveCount(0);
  });

  test("post has a table of contents, share links and Article JSON-LD (FR-BLOG-02)", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "The table of contents is a desktop sidebar");
    await page.goto("/insights/rwanda-data-protection-law-software");
    const toc = page.getByRole("navigation", { name: "On this page" });
    await toc.getByRole("link", { name: "Be ready for requests and incidents" }).click();
    await expect(page).toHaveURL(/#h-be-ready-for-requests-and-incidents$/);
    await expect(
      page.getByRole("heading", { name: "Be ready for requests and incidents" }),
    ).toBeInViewport();
    await expect(page.getByRole("link", { name: "Share: LinkedIn" })).toHaveAttribute(
      "href",
      /linkedin\.com/,
    );
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.some((s) => s.includes('"BlogPosting"') || s.includes('"Article"'))).toBeTruthy();
  });

  test("RSS feed and llms.txt (FR-BLOG-04, SEO)", async ({ request }) => {
    const rss = await request.get("/feed.xml");
    expect(rss.headers()["content-type"]).toMatch(/xml/);
    const xml = await rss.text();
    expect(xml).toContain("<rss");
    expect(xml.match(/<item>/g)?.length).toBeGreaterThanOrEqual(4);
    const llms = await (await request.get("/llms.txt")).text();
    expect(llms).toMatch(/^# Universal Bridge/);
    expect(llms).toContain("/services/");
  });

  test("sitemap includes S4 and S5 pages in every locale", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const path of [
      "/labs/coding-hub",
      "/insights/building-web-apps-for-3g",
      "/company/leadership",
      "/legal/privacy",
      "/academy/programs",
    ])
      expect(xml).toContain(path);
    expect(xml).toContain("/fr/labs");
  });
});

test.describe("S5 events", () => {
  test.use({ extraHTTPHeaders: { "x-real-ip": visitorIp() } });

  test("past events have no registration form", async ({ page }) => {
    await page.goto("/company/events/ub-hackathon-2024");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("UB Hackathon 2024");
    await expect(page.getByRole("button", { name: "Register" })).toHaveCount(0);
  });

  test("register for an upcoming event with a team name (FR-EVT-01)", async ({ page, request }) => {
    await stubTurnstile(page);
    const email = uniqueEmail("event");
    await page.goto("/company/events");
    await page.getByRole("link", { name: "Sample event — Build Night" }).click();
    await expect(page.getByRole("heading", { name: "Agenda" })).toBeVisible();
    await page.getByLabel("Full name").fill("Aline Uwimana");
    await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
    await page.getByLabel("Organisation or school").fill("University of Rwanda");
    await page.getByLabel("Team name").fill("Bridge Builders");
    await page.getByRole("checkbox", { name: /I agree/ }).check();
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page.getByText(/Reference: A-/)).toBeVisible();
    await expect.poll(() => mailTo(email).length, { timeout: 15_000 }).toBe(1);
    const app = (
      await (
        await request.get(
          `/api/applications?where[email][equals]=${encodeURIComponent(email)}&depth=1`,
          {
            headers: await staffHeaders(request),
          },
        )
      ).json()
    ).docs[0];
    expect(app).toMatchObject({ type: "event", status: "received" });
    expect(app.event.slug).toBe("sample-build-night");
    expect(app.data.teamName).toBe("Bridge Builders");
    // Free the seat again: the sample event has a capacity, and runs add up.
    await request.delete(`/api/applications/${app.id}`, { headers: await staffHeaders(request) });
  });
});

test.describe("S5 signature interactions", () => {
  test("⌘K palette searches pages and runs quick actions (FR-GL-08)", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search" }).click();
    const box = page.getByRole("combobox", { name: "Search services, work, programs…" });
    await expect(box).toBeFocused();
    await box.fill("coding");
    await expect(page.getByRole("option", { name: /Coding Hub/ })).toBeVisible();
    await box.fill("zzzqqq");
    await expect(page.getByText("No results for “zzzqqq”.")).toBeVisible();
    await box.fill("book");
    await box.press("Enter");
    await expect(page).toHaveURL(/\/book$/);
  });

  test("palette opens with the keyboard shortcut and closes on Escape", async ({ page }) => {
    await page.goto("/insights");
    await page.locator("body").press("ControlOrMeta+k");
    const box = page.getByRole("combobox");
    await expect(box).toBeFocused();
    await box.press("Escape");
    await expect(box).toBeHidden();
  });

  test("404 bridge game reconnects with the keyboard and goes home (FR-GL-09)", async ({
    page,
  }) => {
    const res = await page.goto("/this-page-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("link", { name: "Services" }).last()).toBeVisible();
    await expectAccessible(page);
    await page.getByRole("button", { name: "Missing bridge piece" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status").filter({ hasText: "Connected!" })).toBeVisible();
    await expect(page).toHaveURL(/\/$/, { timeout: 5_000 });
  });

  test("home story block shows Ideas → Code → Impact", async ({ page }) => {
    await page.goto("/");
    for (const step of [
      "Start with the problem.",
      "Ship every two weeks.",
      "Measure what matters.",
    ])
      await expect(page.getByRole("heading", { name: step })).toBeAttached();
  });

  test("globe and living circuit run on capable desktops", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop-only effects");
    await page.goto("/");
    await expect(page.locator("canvas[data-active=true]")).toBeAttached();
    await page.goto("/company/about");
    await page.locator("[data-globe]").scrollIntoViewIfNeeded();
    await expect(page.locator("[data-globe][data-active]")).toBeAttached({ timeout: 10_000 });
  });

  test("reduced motion: no canvas effects, content still there", async ({ page, isMobile }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/company/about");
    // Phones never run the globe, so its space is removed altogether (audit v2 R-1).
    if (isMobile) await expect(page.locator("[data-globe]")).toBeHidden();
    else await page.locator("[data-globe]").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(page.locator("[data-globe][data-active]")).toHaveCount(0);
    await expect(page.getByText("UTC+2, all year")).toBeVisible();
    await page.goto("/");
    await expect(page.locator("canvas[data-active=true]")).toHaveCount(0);
  });

  test("Lite mode turns the effects off", async ({ page, isMobile }) => {
    test.skip(isMobile, "Desktop-only effects");
    await page.addInitScript(() => localStorage.setItem("ub-lite", "on"));
    await page.goto("/");
    await page.waitForTimeout(500);
    await expect(page.locator("canvas[data-active=true]")).toHaveCount(0);
  });
});

test.describe("layout at phone width", () => {
  for (const path of [
    "/",
    "/labs",
    "/company/about",
    "/insights",
    "/company/events",
    "/insights/building-web-apps-for-3g",
  ])
    test(`${path} has no horizontal overflow`, async ({ page, isMobile }) => {
      test.skip(!isMobile, "Phone viewport only");
      await page.goto(path);
      const [scroll, inner] = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        window.innerWidth,
      ]);
      expect(scroll).toBeLessThanOrEqual(inner);
    });
});
