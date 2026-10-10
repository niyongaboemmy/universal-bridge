import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** NFR-A11Y-01: zero serious or critical axe violations (WCAG 2.2 AA). */
export async function expectAccessible(page: Page, disableRules: string[] = []) {
  // Let entrance animations finish so contrast is measured on final colours.
  await page.waitForFunction(() =>
    document.getAnimations().every(
      (a) =>
        a.playState !== "running" ||
        a.effect?.getTiming().iterations === Infinity ||
        !(a.timeline instanceof DocumentTimeline), // scroll-driven reveals never "finish"
    ),
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .disableRules(disableRules)
    // WCAG 1.4.3 exception: text that is part of a logo has no contrast requirement.
    .exclude('a[aria-label="Universal Bridge home"]')
    .exclude("[data-logo]")
    .analyze();
  const blocking = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(
    blocking.map(
      (v) =>
        `${v.id}: ${v.help} — ${v.nodes
          .map((n) => n.target.join(" "))
          .slice(0, 3)
          .join(" | ")}`,
    ),
  ).toEqual([]);
}

export async function setTheme(page: Page, theme: "light" | "dark") {
  // Seed once; later reloads keep whatever the page stored.
  await page.addInitScript((t) => {
    if (!sessionStorage.getItem("seeded-theme")) {
      localStorage.setItem("theme", t);
      sessionStorage.setItem("seeded-theme", "1");
    }
  }, theme);
}

/** Pre-answer the cookie banner so it doesn't cover the page under test. */
export async function presetConsent(page: Page, analytics = false) {
  await page.addInitScript((a) => {
    localStorage.setItem(
      "ub-consent",
      JSON.stringify({ v: 1, analytics: a, at: new Date().toISOString() }),
    );
  }, analytics);
}

/**
 * Answer Google Analytics requests locally so test runs never reach the real GA
 * property. Returns the URLs that were requested (gtag.js and any hits).
 */
export async function stubGoogleAnalytics(
  target: Page | import("@playwright/test").BrowserContext,
) {
  const hits: string[] = [];
  const isGoogle = (url: URL) =>
    ["googletagmanager.com", "google-analytics.com", "analytics.google.com"].some(
      (d) => url.hostname === d || url.hostname.endsWith(`.${d}`),
    );
  await target.route(isGoogle, (route) => {
    hits.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "text/javascript", body: "" });
  });
  return hits;
}

/** Replace the Turnstile script with a stub that injects Cloudflare's dummy token. */
export async function stubTurnstile(page: Page) {
  await page.route("https://challenges.cloudflare.com/**", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      body: `document.querySelectorAll('.cf-turnstile').forEach(function(el){var i=document.createElement('input');i.type='hidden';i.name='cf-turnstile-response';i.value='XXXX.DUMMY.TOKEN.XXXX';el.appendChild(i);});`,
    }),
  );
}

/** Admin REST token for asserting what staff will see (ADM-02). */
export async function adminToken(request: import("@playwright/test").APIRequestContext) {
  // Shared token from global-setup.ts: avoids racing parallel logins as one user.
  if (process.env.E2E_ADMIN_TOKEN) return process.env.E2E_ADMIN_TOKEN;
  const res = await request.post("/api/users/login", {
    data: {
      email: "admin@universalbridge.rw",
      password: process.env.SEED_ADMIN_PASSWORD ?? "ub-dev-password",
    },
  });
  expect(res.ok()).toBeTruthy();
  return (await res.json()).token as string;
}

export const uniqueEmail = (tag: string) =>
  `e2e-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.org`;

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/** Emails written to the dev mailbox (.data/mail) for an address. */
export function mailTo(
  address: string,
): { subject: string; html: string; text: string; to: string }[] {
  const dir = path.resolve(".data/mail");
  try {
    return readdirSync(dir)
      .map((f) => JSON.parse(readFileSync(path.join(dir, f), "utf8")))
      .filter((m) => [m.to].flat().includes(address));
  } catch {
    return [];
  }
}

/** A small, structurally valid PDF (Payload rejects malformed PDFs). */
export const SAMPLE_PDF = readFileSync(path.resolve("tests/fixtures/sample-cv.pdf"));

export const visitorIp = () =>
  `198.18.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

export async function staffHeaders(request: import("@playwright/test").APIRequestContext) {
  return { Authorization: `JWT ${await adminToken(request)}` };
}

/**
 * Test sign-ins come from one machine; production rate-limits sign-ins per client IP
 * (20 per 15 minutes). Each test sign-in presents its own forwarded address, as
 * traffic through a proxy does, so the suite doesn't trip the limit meant for attackers.
 */
export function testClientIp() {
  const n = () => Math.floor(Math.random() * 250) + 1;
  return { "x-forwarded-for": `10.${n()}.${n()}.${n()}` };
}

/**
 * Sign in a freshly created staff account. Creating an account queues its invitation,
 * which updates the user record right away and can drop a session made at the same
 * moment; confirm the token works and sign in again if it doesn't.
 */
export async function loginStaff(
  request: import("@playwright/test").APIRequestContext,
  email: string,
  password: string,
): Promise<string> {
  for (let i = 0; i < 4; i++) {
    const res = await request.post("/api/users/login", {
      data: { email, password },
      headers: testClientIp(),
    });
    const token = ((await res.json().catch(() => ({}))) as { token?: string }).token;
    if (token) {
      await new Promise((r) => setTimeout(r, 400));
      const me = await request.get("/api/users/me", { headers: { Authorization: `JWT ${token}` } });
      if (((await me.json().catch(() => ({}))) as { user?: unknown }).user) return token;
    }
    await new Promise((r) => setTimeout(r, 600));
  }
  throw new Error(`Could not sign in ${email}`);
}
