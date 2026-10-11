import { describe, expect, it } from "vitest";
import { buildCsp, securityHeaders } from "@/lib/security/csp";
import { legacyRedirects } from "@/lib/seo/legacy-redirects";
import { hasRole } from "@/access/roles";

describe("CSP (ADR-006)", () => {
  const csp = buildCsp();
  it("blocks framing, plugins and foreign form posts", () => {
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("form-action 'self'");
  });
  it("never allows eval in production", () => {
    expect(csp).not.toContain("unsafe-eval");
    expect(buildCsp({ dev: true })).toContain("unsafe-eval");
  });
  it("upgrades insecure requests only on an https site", () => {
    expect(buildCsp({ siteUrl: "https://universalbridge.rw" })).toContain(
      "upgrade-insecure-requests",
    );
    // A production build on http://localhost (CI, local checks): WebKit would upgrade
    // its own stylesheets and scripts to https and fail to load them.
    expect(buildCsp({ siteUrl: "http://localhost:3000" })).not.toContain(
      "upgrade-insecure-requests",
    );
  });
  it("sends HSTS only in production", () => {
    expect(securityHeaders().some((h) => h.key === "Strict-Transport-Security")).toBe(true);
    expect(securityHeaders({ dev: true }).some((h) => h.key === "Strict-Transport-Security")).toBe(
      false,
    );
  });
});

describe("legacy redirects (SRS §5.3)", () => {
  it("covers every old URL", () => {
    const sources = legacyRedirects.map((r) => r.source);
    for (const old of [
      "/team",
      "/agents",
      "/application",
      "/internship",
      "/online_trainings",
      "/physical_trainings",
    ]) {
      expect(sources).toContain(old);
    }
  });
});

describe("roles (SRS §3.2)", () => {
  it("super passes every check", () => {
    expect(hasRole({ roles: ["super"] }, "hr")).toBe(true);
  });
  it("roles are least-privilege", () => {
    expect(hasRole({ roles: ["sales"] }, "academy")).toBe(false);
    expect(hasRole({ roles: ["academy", "hr"] }, "hr")).toBe(true);
    expect(hasRole(null, "editor")).toBe(false);
  });
});

import { localizePath, stripLocale } from "@/i18n/routing";

describe("locale paths (I18N-02)", () => {
  it("strips locale prefixes", () => {
    expect(stripLocale("/fr/services")).toBe("/services");
    expect(stripLocale("/rw")).toBe("/");
    expect(stripLocale("/services")).toBe("/services");
    expect(stripLocale("/framework")).toBe("/framework");
  });
  it("adds prefixes as-needed (English has none)", () => {
    expect(localizePath("/fr/services", "en")).toBe("/services");
    expect(localizePath("/services", "rw")).toBe("/rw/services");
    expect(localizePath("/", "fr")).toBe("/fr");
  });
});
