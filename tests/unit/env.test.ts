import { describe, expect, it } from "vitest";
import { checkEnv } from "@/lib/env";

describe("configuration check (NFR-MNT-06)", () => {
  const good = {
    DATABASE_URL: "postgres://db/ub",
    PAYLOAD_SECRET: "x".repeat(40),
    NEXT_PUBLIC_SITE_URL: "https://universalbridge.rw",
    REVALIDATE_SECRET: "r-secret",
    CRON_SECRET: "c-secret",
    RATE_LIMIT_SALT: "salt-value",
  } as unknown as NodeJS.ProcessEnv;

  it("passes a complete production config", () => {
    expect(checkEnv(good).errors).toEqual([]);
  });

  it("flags example values, short secrets, http and half-configured services", () => {
    const { errors } = checkEnv({
      ...good,
      CRON_SECRET: "change-me",
      PAYLOAD_SECRET: "short",
      NEXT_PUBLIC_SITE_URL: "http://universalbridge.rw",
      S3_BUCKET: "media",
    } as unknown as NodeJS.ProcessEnv);
    expect(errors.join("\n")).toMatch(/CRON_SECRET/);
    expect(errors.join("\n")).toMatch(/at least 32/);
    expect(errors.join("\n")).toMatch(/https/);
    expect(errors.join("\n")).toMatch(/S3 credentials/);
  });

  it("warns about recommended services", () => {
    expect(checkEnv(good).warnings.join("\n")).toMatch(/RESEND_API_KEY/);
  });
});
