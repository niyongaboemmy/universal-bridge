import { describe, expect, it } from "vitest";
import { buildCsp } from "@/lib/security/csp";
import { GA_DEFAULT_ID, resolveSettings } from "@/lib/settings";

// Google Analytics 4: on by default with the company stream, switchable in Settings,
// and allowed by the CSP (it still loads only after consent — tests/e2e/shell.spec.ts).

describe("Google Analytics settings", () => {
  it("uses the company stream when nothing is set", () => {
    expect(GA_DEFAULT_ID).toBe("G-110J66XQ0H");
    expect(resolveSettings(null).gaMeasurementId).toBe(GA_DEFAULT_ID);
  });

  it("uses another stream from Settings, and can be switched off", () => {
    expect(
      resolveSettings({ integrations: { gaMeasurementId: "G-ABC1234" } } as never).gaMeasurementId,
    ).toBe("G-ABC1234");
    expect(
      resolveSettings({ integrations: { gaEnabled: false, gaMeasurementId: "G-ABC1234" } } as never)
        .gaMeasurementId,
    ).toBeUndefined();
  });
});

describe("CSP allows Google Analytics", () => {
  const csp = Object.fromEntries(
    buildCsp()
      .split("; ")
      .map((d) => [d.split(" ")[0], d]),
  );
  it("loads gtag.js and sends hits to Google's endpoints only", () => {
    expect(csp["script-src"]).toContain("https://www.googletagmanager.com");
    expect(csp["connect-src"]).toContain("https://*.google-analytics.com");
    expect(csp["connect-src"]).toContain("https://*.analytics.google.com");
    expect(csp["img-src"]).toContain("https://*.google-analytics.com");
    expect(csp["frame-src"]).not.toContain("google");
  });
});
