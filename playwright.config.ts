import { defineConfig, devices } from "@playwright/test";

// SRS §14.1: Chromium + WebKit + Firefox and mobile viewports in CI.
// Locally we run Chromium (desktop + mobile) unless PW_ALL_BROWSERS=1.
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const all = process.env.CI === "true" || process.env.PW_ALL_BROWSERS === "1";

export default defineConfig({
  testDir: "tests/e2e",
  // One shared admin login for the whole run (see global-setup.ts).
  globalSetup: "./tests/e2e/global-setup.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // Forms, uploads and PDF rendering are heavy on a dev server; 2 workers keeps runs stable.
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : 2,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure", locale: "en-GB" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /maintenance\.spec/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testIgnore: /maintenance\.spec/ },
    ...(all
      ? [
          { name: "webkit", use: { ...devices["Desktop Safari"] }, testIgnore: /maintenance\.spec/ },
          { name: "firefox", use: { ...devices["Desktop Firefox"] }, testIgnore: /maintenance\.spec/ },
        ]
      : []),
    // Maintenance mode takes the whole public site down: run it alone, after everything else.
    {
      name: "maintenance",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /maintenance\.spec/,
      dependencies: ["chromium", "mobile"],
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "pnpm dev", url: baseURL, reuseExistingServer: true, timeout: 180_000 },
});
