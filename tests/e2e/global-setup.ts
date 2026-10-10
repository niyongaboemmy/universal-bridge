import type { FullConfig } from "@playwright/test";

/**
 * Log in as the seeded admin once, before any worker starts, and share the token
 * through the environment (workers inherit it). Payload stores login sessions by
 * read-modify-write on the user record, so parallel logins as the same user can
 * overwrite each other's session and turn later staff calls into 403s.
 */
export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL ?? "http://localhost:3000";
  try {
    const res = await fetch(new URL("/api/users/login", baseURL), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "admin@universalbridge.rw",
        password: process.env.SEED_ADMIN_PASSWORD ?? "ub-dev-password",
      }),
    });
    if (res.ok) process.env.E2E_ADMIN_TOKEN = ((await res.json()) as { token: string }).token;
  } catch {
    // No server yet: helpers fall back to logging in themselves.
  }
}
