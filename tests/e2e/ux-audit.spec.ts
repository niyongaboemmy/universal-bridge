import { expect, test } from "@playwright/test";
import { presetConsent, setTheme } from "./helpers";

// Regression tests for docs/UI-UX-AUDIT.md — one block per finding.

test.beforeEach(async ({ page }) => presetConsent(page));

const TEMPLATES = [
  "/",
  "/fr",
  "/services",
  "/services/ai-data",
  "/solutions",
  "/work",
  "/products/nyambika-design",
  "/book",
  "/contact",
  "/academy",
  "/academy/programs",
  "/academy/programs/full-stack-web-development",
  "/academy/apply",
  "/academy/internships",
  "/academy/verify",
  "/company/about",
  "/company/leadership",
  "/company/careers",
  "/company/partners",
  "/company/events",
  "/company/press",
  "/labs",
  "/labs/coding-hub",
  "/insights",
  "/insights/building-web-apps-for-3g",
  "/legal/privacy",
];

test.describe("P0-1 no horizontal overflow at 360 px", () => {
  test.use({ viewport: { width: 360, height: 780 } });
  for (const path of TEMPLATES)
    test(path, async ({ page, isMobile }) => {
      test.skip(!isMobile, "Runs once, in the phone project");
      await page.goto(path);
      const [scroll, client] = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        document.documentElement.clientWidth,
      ]);
      expect(scroll).toBe(client);
      // Hidden overflow too: text clipped by an overflow-hidden card is still cut off.
      // Swipe rails (horizontal scrollers) are intentional and skipped.
      const clipped = await page.evaluate(() => {
        const W = document.documentElement.clientWidth;
        const inRail = (el: Element) => {
          for (let a = el.parentElement; a; a = a.parentElement)
            if (getComputedStyle(a).overflowX === "auto") return true;
          return false;
        };
        return [...document.querySelectorAll("main h1, main h2, main h3, main p, main a, main li")]
          .filter(
            (el) => el.getClientRects().length && !el.closest("[aria-hidden=true]") && !inRail(el),
          )
          .filter((el) => el.getBoundingClientRect().right > W + 1)
          .map((el) => `${el.tagName} "${(el.textContent ?? "").trim().slice(0, 40)}"`)
          .slice(0, 5);
      });
      expect(clipped).toEqual([]);
    });
});

test.describe("P0-2 booking never dead-ends", () => {
  test("missing calendar shows working alternatives; otherwise it loads on request", async ({
    page,
  }) => {
    await page.goto("/book");
    const fallback = page.getByRole("heading", {
      name: "Online booking isn't available right now",
    });
    if (await fallback.isVisible()) {
      await expect(page.locator("iframe")).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Request a call" })).toHaveAttribute(
        "href",
        "/contact?topic=sales",
      );
      await expect(page.getByRole("link", { name: "Email us" })).toHaveAttribute(
        "href",
        /^mailto:/,
      );
    } else {
      // Cal.com reachable or unknown: nothing third-party loads until asked.
      await expect(page.locator("iframe")).toHaveCount(0);
      await page.getByRole("button", { name: "Show available times" }).click();
      await expect(page.locator("iframe")).toHaveAttribute("src", /app\.cal\.com/);
    }
  });
});

test.describe("P1-1 hero image is fetched first", () => {
  test("the first hero image is eager with high priority; others stay lazy", async ({ page }) => {
    await page.goto("/academy");
    const hero = page.locator("main section").first().locator("img").first();
    await expect(hero).toHaveAttribute("loading", "eager");
    await expect(hero).toHaveAttribute("fetchpriority", "high");
    // One image element per hero, so phones don't download a second copy.
    await expect(page.locator("main section").first().locator("img")).toHaveCount(1);
  });
});

test.describe("P1-2 / P2-1 theme toggle", () => {
  test("states which theme is on, before and after switching", async ({ page, isMobile }) => {
    test.skip(isMobile, "Header toggle is in the drawer on phones (covered in foundation.spec)");
    await setTheme(page, "dark");
    await page.goto("/contact");
    const toggle = page.getByRole("button", { name: "Dark theme" });
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    // The moon (not the sun) is visible in dark mode, decided by CSS before hydration.
    const [sun, moon] = await toggle
      .locator("svg")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    expect([sun, moon]).toEqual(["0", "1"]);
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme-switching", /.*/);
  });
});

test.describe("P1-3 contact details are never truncated", () => {
  for (const width of [1440, 1024, 390])
    test(`at ${width} px`, async ({ page, isMobile }) => {
      test.skip(isMobile, "Viewport set explicitly");
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/contact");
      const links = page.locator('#contact-options ~ ul a, [aria-labelledby="contact-options"] a');
      await expect(links.first()).toBeVisible();
      for (const overflow of await links.evaluateAll((els) =>
        els.map((el) => el.scrollWidth - el.clientWidth),
      ))
        expect(overflow).toBeLessThanOrEqual(0);
    });
});

test.describe("P1-4 one primary-action colour", () => {
  test("header CTA, hero CTA and form submit share the spark colour", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Header CTA is in the drawer on phones");
    const bg = (loc: import("@playwright/test").Locator) =>
      loc.evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.goto("/");
    const header = await bg(page.locator("header").getByRole("link", { name: "Let's talk" }));
    const hero = await bg(page.locator("main section").first().getByRole("link").first());
    await page.goto("/contact");
    const submit = await bg(page.getByRole("button", { name: "Send" }));
    expect(header).toBe("rgb(254, 118, 13)");
    expect(hero).toBe(header);
    expect(submit).toBe(header);
  });
});

test.describe("P2-2 dark mode keeps the Night/Day rhythm", () => {
  test("Day sections are lighter than Night sections in dark theme", async ({ page }) => {
    await setTheme(page, "dark");
    await page.goto("/");
    const [day, night] = await page.evaluate(() => [
      getComputedStyle(document.body).backgroundColor,
      getComputedStyle(document.querySelector(".night")!).getPropertyValue("--night-bg").trim(),
    ]);
    expect(night).not.toBe("");
    expect(day).not.toBe(night);
  });
});

test.describe("P2-9 shared English links stay English", () => {
  test("a saved Kinyarwanda choice doesn't hijack a deep link, and offers a switch", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([{ name: "UB_LOCALE", value: "rw", url: baseURL! }]);
    await page.goto("/legal/privacy");
    await expect(page).toHaveURL(/\/legal\/privacy$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const offer = page.getByRole("complementary", {
      name: "Iyi paji iraboneka no mu Kinyarwanda.",
    });
    await offer.getByRole("link", { name: "Soma mu Kinyarwanda" }).click();
    await expect(page).toHaveURL(/\/rw\/legal\/privacy$/);
    // The home page still opens in the saved language.
    await page.goto("/");
    await expect(page).toHaveURL(/\/rw$/);
  });

  test("the offer can be dismissed", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "UB_LOCALE", value: "fr", url: baseURL! }]);
    await page.goto("/services");
    await page.getByRole("button", { name: "Fermer" }).click();
    await page.reload();
    await expect(page.getByRole("complementary", { name: /disponible en français/ })).toHaveCount(
      0,
    );
  });
});

test.describe("Home services pillar carousel", () => {
  test("one slide per pillar, every service once, with Send request and View", async ({ page }) => {
    await page.goto("/");
    const carousel = page.locator(".svc-pairs");
    await expect(carousel.locator("nav a")).toHaveCount(4);
    const cards = carousel.locator("article");
    await expect(cards).toHaveCount(8);
    const first = cards.first();
    await expect(first.getByRole("link", { name: "Send request" })).toHaveAttribute(
      "href",
      /^\/contact\?topic=sales&service=[\w-]+$/,
    );
    await expect(first.getByRole("link", { name: /^View: / })).toHaveAttribute(
      "href",
      /^\/services\/[\w-]+$/,
    );
    // A tab brings its pillar into the track (the page itself does not jump).
    await carousel.locator("nav a", { hasText: "Innovation" }).click();
    await expect(page.locator("#svc-innovation")).toHaveAttribute("data-active", "");
    await expect(carousel.locator("nav a", { hasText: "Innovation" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(carousel.locator("[data-count]")).toHaveText("03");
  });

  test("arrows step through pillars, manual navigation pauses auto-advance, and it moves on by itself", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Phones start paused (calm motion); covered by the next test");
    await page.goto("/");
    const carousel = page.locator(".svc-pairs");
    await carousel.scrollIntoViewIfNeeded();
    await expect(carousel).toHaveAttribute("data-ready", "");
    const count = carousel.locator("[data-count]");
    await expect(count).toHaveText("01");
    // Auto-advance (7 s dwell) while nobody touches it.
    await page.mouse.move(0, 0);
    await expect(count).toHaveText("02", { timeout: 12_000 });
    await carousel.getByRole("button", { name: "Next services" }).click();
    await expect(count).toHaveText("03");
    await expect(carousel).toHaveAttribute("data-paused", "");
    await expect(carousel.locator("nav a").nth(2)).toHaveAttribute("aria-current", "true");
    await carousel.getByRole("button", { name: "Previous services" }).click();
    await expect(count).toHaveText("02");
    await carousel.getByRole("button", { name: "Resume auto-scroll" }).click();
    await expect(carousel).not.toHaveAttribute("data-paused", "");
  });
});

test.describe("Home services carousel on phones", () => {
  test("starts paused so nothing moves while reading; swipe arrows and play still work", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "phones only");
    await page.goto("/");
    const carousel = page.locator(".svc-pairs");
    await carousel.scrollIntoViewIfNeeded();
    await expect(carousel).toHaveAttribute("data-ready", "");
    await expect(carousel).toHaveAttribute("data-paused", "");
    const count = carousel.locator("[data-count]");
    await expect(count).toHaveText("01");
    await carousel.getByRole("button", { name: "Next services" }).click();
    await expect(count).toHaveText("02");
    await carousel.getByRole("button", { name: "Resume auto-scroll" }).click();
    await expect(carousel).not.toHaveAttribute("data-paused", "");
  });
});

test.describe("v2 U-3 / U-4 shorter contact form", () => {
  test("only what we need to reply is visible; optional details are one click away", async ({
    page,
  }) => {
    await page.goto("/contact");
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Tell us about your project")).toBeVisible();
    await expect(page.getByLabel("Company or organisation")).toBeHidden();
    await page.getByText("More details (optional)").click();
    await expect(page.getByLabel("Company or organisation")).toBeVisible();
  });
});

// v2 U-1 (/work empty state) lives in marketing.spec.ts, ordered before the case-study journey.

test.describe("v2 V-1 hero shows what we build", () => {
  test("home hero has the differentiating headline and the live-product showcase", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Software, AI and devices — engineered in Kigali.",
    );
    const showcase = page.locator(".showcase");
    await expect(showcase).toBeVisible();
    await expect(showcase.locator(".phone-screens")).toHaveCount(1);
    if (!isMobile) await expect(page.locator("main section").first().locator("img")).toHaveCount(0);
  });
});

test.describe("v2 M-3 cross-page transitions", () => {
  test("same-origin navigations opt in to view transitions", async ({ page }) => {
    await page.goto("/");
    const supported = await page.evaluate(() => "CSSViewTransitionRule" in window);
    test.skip(!supported, "This browser ignores @view-transition (navigations still work)");
    const optedIn = await page.evaluate(() =>
      [...document.styleSheets].some((sheet) => {
        try {
          return [...sheet.cssRules].some((r) => r.cssText.includes("@view-transition"));
        } catch {
          return false;
        }
      }),
    );
    expect(optedIn).toBe(true);
  });
});

test.describe("Header logo follows the theme", () => {
  const ink = (page: import("@playwright/test").Page) =>
    page
      .locator("header [data-logo] svg")
      .first()
      .evaluate((el) => getComputedStyle(el).color);

  test("light theme is white paper: master-blue logo, top of the hero and scrolled", async ({
    page,
  }) => {
    await setTheme(page, "light");
    await page.goto("/");
    expect(await ink(page)).toBe("rgb(1, 69, 184)");
    await page.getByRole("heading", { name: /From first idea/ }).scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 400);
    await page.mouse.wheel(0, -40);
    await expect.poll(() => ink(page)).toBe("rgb(1, 69, 184)");
  });

  test("white in dark theme", async ({ page }) => {
    await setTheme(page, "dark");
    await page.goto("/contact");
    expect(await ink(page)).toBe("rgb(255, 255, 255)");
  });

  test("Labs hub in light theme: paper header with dark nav text", async ({ page, isMobile }) => {
    test.skip(isMobile, "Nav links are in the drawer on phones");
    await setTheme(page, "light");
    await page.goto("/labs/coding-hub");
    expect(await ink(page)).toBe("rgb(1, 69, 184)");
    await expect(page.locator("header").getByRole("link", { name: "Work" })).toHaveCSS(
      "color",
      "rgb(10, 22, 51)",
    );
  });
});

test.describe("Header after a client-side navigation", () => {
  test("after navigating from the home page the header keeps the blue logo and dark nav", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Header nav links are in the drawer on phones");
    await setTheme(page, "light");
    await page.goto("/");
    const logo = page.locator("header [data-logo] svg").first();
    await expect
      .poll(() => logo.evaluate((el) => getComputedStyle(el).color))
      .toBe("rgb(1, 69, 184)");
    await page.locator("header").getByRole("link", { name: "Insights" }).click();
    await expect(page).toHaveURL(/\/insights$/);
    await expect
      .poll(() => logo.evaluate((el) => getComputedStyle(el).color))
      .toBe("rgb(1, 69, 184)");
    await expect(page.locator("header").getByRole("link", { name: "Work" })).not.toHaveCSS(
      "color",
      "rgb(247, 248, 250)",
    );
  });
});

test.describe("Ideas → Code → Impact story (desktop pin)", () => {
  test("the stage always shows the visual of the step being read", async ({ page, isMobile }) => {
    test.skip(isMobile, "The pinned stage is desktop-only; phones show the visuals inline");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    // The pinned stage is driven by scroll timelines; other browsers get the inline fallback.
    const scrollTimelines = await page.evaluate(
      () => CSS.supports("animation-timeline: view()") && CSS.supports("timeline-scope: --s0"),
    );
    test.skip(!scrollTimelines, "No scroll-driven animations here: visuals show inline instead");
    const steps = page.locator(".story__step");
    const opacities = () =>
      page
        .locator(".story__visual")
        .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
    // Scroll so a step's top sits at the given fraction of the viewport.
    const place = async (i: number, at: number) => {
      await steps
        .nth(i)
        .evaluate(
          (el, f) => window.scrollBy(0, el.getBoundingClientRect().top - innerHeight * f),
          at,
        );
      await page.waitForTimeout(300);
    };
    // As soon as step 1 comes into view (the moment from the bug report), its visual is there.
    await place(0, 0.55);
    expect((await opacities())[0]).toBeGreaterThan(0.95);
    // Each step, read in the middle of the screen, owns the stage.
    for (const i of [0, 1, 2]) {
      await place(i, 0.22);
      const o = await opacities();
      expect(o[i]).toBeGreaterThan(0.95);
      for (const [j, v] of o.entries()) if (j !== i) expect(v).toBeLessThan(0.05);
      await expect(page.locator(".story__dot").nth(i)).toHaveCSS(
        "background-color",
        "rgb(254, 118, 13)",
      );
    }
  });
});

test.describe("Kigali globe is never missing", () => {
  const state = (page: import("@playwright/test").Page) =>
    page
      .locator("[data-globe]")
      .first()
      .evaluate((el) => {
        const img = [...el.querySelectorAll("img")].find(
          (i) => getComputedStyle(i).display !== "none",
        )!;
        return {
          active: el.dataset.active ?? null,
          loaded: img.complete && img.naturalWidth > 0,
          frame: getComputedStyle(img).opacity,
        };
      });

  test("without the live globe (here: reduced motion) the pre-rendered globe shows", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "The globe column is desktop/tablet only");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/company/about");
    await page.locator("[data-globe]").scrollIntoViewIfNeeded();
    await expect.poll(() => state(page)).toEqual({ active: null, loaded: true, frame: "1" });
  });

  test("with WebGL the live globe takes over from the frame", async ({ page, isMobile }) => {
    test.skip(isMobile, "The globe column is desktop/tablet only");
    await page.goto("/company/about");
    const webgl2 = await page.evaluate(
      () => !!document.createElement("canvas").getContext("webgl2"),
    );
    test.skip(!webgl2, "No WebGL2 in this browser: the pre-rendered globe stays (tested above)");
    await page.locator("[data-globe]").scrollIntoViewIfNeeded();
    await expect
      .poll(() => state(page), { timeout: 10_000 })
      .toMatchObject({ active: "true", frame: "0" });
  });
});

test.describe("Services request: quick picks", () => {
  test("a quick pick opens the form with that service ticked", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Popular requests" })
      .getByRole("link", { name: "Automate with AI" })
      .click();
    await expect(page).toHaveURL(/\/contact\?topic=sales&service=ai-data$/);
    await expect(page.getByRole("checkbox", { name: /AI, Machine Learning/ })).toBeChecked();
    await expect(page.getByRole("checkbox", { name: /AI, Machine Learning/ })).toBeVisible();
  });
});

test.describe("Animations keep running on a 3G estimate", () => {
  test("Chrome reporting 3g does not switch Lite mode on; data saver still does", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "Phones always use calm motion (Lite mode); checked below");
    const fake = (type: string, saveData: boolean) =>
      page.addInitScript(
        ([t, s]) =>
          Object.defineProperty(navigator, "connection", {
            value: { effectiveType: t, saveData: s },
            configurable: true,
          }),
        [type, saveData] as const,
      );
    await fake("3g", false);
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveAttribute("data-lite", "on");
    expect(await page.evaluate(() => document.getAnimations().length)).toBeGreaterThan(10);
  });

  test("phones get calm motion (Lite mode) unless the visitor turned it off", async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, "phones only");
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-lite", "on");
    await page.evaluate(() => localStorage.setItem("ub-lite", "off"));
    await page.reload();
    await expect(page.locator("html")).not.toHaveAttribute("data-lite", "on");
  });

  test("data saver switches Lite mode on", async ({ page }) => {
    await page.addInitScript(() =>
      Object.defineProperty(navigator, "connection", {
        value: { effectiveType: "4g", saveData: true },
        configurable: true,
      }),
    );
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-lite", "on");
  });
});

test.describe("Hero circuit pulses run on a 3G estimate", () => {
  test("the live circuit canvas starts when Chrome reports 3g", async ({ page, isMobile }) => {
    test.skip(isMobile, "The live circuit is desktop-only");
    await page.addInitScript(() =>
      Object.defineProperty(navigator, "connection", {
        value: { effectiveType: "3g", saveData: false },
        configurable: true,
      }),
    );
    await page.goto("/");
    await expect(page.locator('canvas[data-fx="circuit"]')).toHaveAttribute("data-active", "true");
  });
});

test.describe("Footer", () => {
  test("live office hours, link groups collapse on phones only, no sideways scroll", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/contact");
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();
    await expect(footer.locator(".footer-hours")).toHaveAttribute("data-ready", "");
    await expect(footer.locator("[data-status]")).toHaveText(/^(Open now|Closed now)$/);
    await expect(footer.locator("[data-time]")).toHaveText(/^\d{2}:\d{2}$/);
    const firstLink = footer.getByRole("navigation").first().getByRole("link").first();
    if (isMobile) {
      await expect(firstLink).toBeHidden();
      await footer.locator("summary").first().click();
      await expect(firstLink).toBeVisible();
    } else {
      await expect(firstLink).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
});
