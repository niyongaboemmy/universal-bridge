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
