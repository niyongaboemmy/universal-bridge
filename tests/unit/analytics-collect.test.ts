import { afterEach, describe, expect, it } from "vitest";
import { externalReferrer, ownHosts, visitorCountry } from "@/lib/analytics/collect";

// Website analytics: country without IP lookups, and the site never counts as its own source.

describe("visitor country", () => {
  it("comes from the browser's time zone when the host sends no country header", () => {
    const h = new Headers();
    expect(visitorCountry(h, "Africa/Kigali")).toBe("RW");
    expect(visitorCountry(h, "Africa/Kampala")).toBe("UG");
    expect(visitorCountry(h, "Europe/Paris")).toBe("FR");
    expect(visitorCountry(h, "America/New_York")).toBe("US");
    // Old names some browsers still report.
    expect(visitorCountry(h, "Asia/Calcutta")).toBe("IN");
    expect(visitorCountry(h, "Europe/Kiev")).toBe("UA");
  });

  it("prefers a CDN country header, ignoring unknown and Tor markers", () => {
    expect(visitorCountry(new Headers({ "cf-ipcountry": "ke" }), "Africa/Kigali")).toBe("KE");
    expect(visitorCountry(new Headers({ "cf-ipcountry": "XX" }), "Africa/Kigali")).toBe("RW");
    expect(visitorCountry(new Headers({ "cf-ipcountry": "T1" }), "")).toBe("");
  });

  it("is empty for unknown or junk time zones", () => {
    expect(visitorCountry(new Headers(), "UTC")).toBe("");
    expect(visitorCountry(new Headers(), "Mars/Olympus")).toBe("");
    expect(visitorCountry(new Headers(), 42)).toBe("");
    expect(visitorCountry(new Headers(), "x".repeat(200))).toBe("");
  });
});

describe("referrer", () => {
  const before = process.env.NEXT_PUBLIC_SITE_URL;
  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = before;
  });

  it("a move within the site is not a source, even behind a proxy on localhost", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://universalbridge.rw";
    const own = ownHosts(new Headers({ host: "localhost:3000" }), "localhost:3000");
    expect(externalReferrer("https://universalbridge.rw/services", own)).toBe("");
    expect(externalReferrer("https://www.universalbridge.rw/", own)).toBe("");
    expect(externalReferrer("https://www.google.com/search?q=ub", own)).toBe("google.com");
    expect(externalReferrer("https://l.facebook.com/", own)).toBe("l.facebook.com");
  });

  it("uses the forwarded host when there is one", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "";
    const own = ownHosts(new Headers({ "x-forwarded-host": "universalbridge.rw" }), "127.0.0.1");
    expect(externalReferrer("https://universalbridge.rw/academy", own)).toBe("");
  });

  it("ignores empty and malformed referrers", () => {
    const own = new Set(["universalbridge.rw"]);
    expect(externalReferrer("", own)).toBe("");
    expect(externalReferrer("not a url", own)).toBe("");
    expect(externalReferrer(null, own)).toBe("");
  });
});
