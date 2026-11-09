import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectPlatform, parseChecksums, platformOfAsset } from "@/features/vizulla/platforms";

const UA = {
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  safari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  windows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  linux:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
};

describe("detectPlatform", () => {
  it("reads a Mac's chip from client hints", () => {
    expect(detectPlatform({ userAgent: UA.mac, uaPlatform: "macOS", architecture: "arm" })).toEqual(
      {
        os: "mac",
        platform: "mac-arm64",
        certain: true,
      },
    );
    expect(
      detectPlatform({ userAgent: UA.mac, uaPlatform: "macOS", architecture: "x86" }).platform,
    ).toBe("mac-x64");
  });

  it("falls back to the GPU name, then to Apple silicon (not certain)", () => {
    expect(detectPlatform({ userAgent: UA.safari, gpu: "Apple M2 Pro" }).platform).toBe(
      "mac-arm64",
    );
    expect(
      detectPlatform({ userAgent: UA.safari, gpu: "Intel(R) Iris(TM) Plus Graphics" }).platform,
    ).toBe("mac-x64");
    expect(detectPlatform({ userAgent: UA.safari, gpu: "Apple GPU" })).toEqual({
      os: "mac",
      platform: "mac-arm64",
      certain: false,
    });
  });

  it("recommends the Windows installer and the Linux AppImage", () => {
    expect(detectPlatform({ userAgent: UA.windows }).platform).toBe("win-x64");
    expect(detectPlatform({ userAgent: UA.linux }).platform).toBe("linux-appimage");
  });

  it("treats phones and iPads (which claim to be Macs) as mobile", () => {
    expect(detectPlatform({ userAgent: UA.android }).os).toBe("mobile");
    expect(detectPlatform({ userAgent: UA.iphone }).os).toBe("mobile");
    expect(detectPlatform({ userAgent: UA.safari, touchPoints: 5 }).os).toBe("mobile");
  });

  it("returns nothing for systems Vizulla doesn't run on", () => {
    expect(detectPlatform({ userAgent: "curl/8.0" })).toEqual({
      os: null,
      platform: null,
      certain: false,
    });
  });
});

describe("release assets", () => {
  it("matches the installer names the Vizulla release publishes", () => {
    expect(platformOfAsset("Vizulla-0.3.2-mac-arm64.dmg")).toBe("mac-arm64");
    expect(platformOfAsset("Vizulla-0.3.2-mac-x64.dmg")).toBe("mac-x64");
    expect(platformOfAsset("Vizulla-0.3.2-win-x64.exe")).toBe("win-x64");
    expect(platformOfAsset("Vizulla-0.3.2-linux-x86_64.AppImage")).toBe("linux-appimage");
    expect(platformOfAsset("Vizulla-0.3.2-linux-amd64.deb")).toBe("linux-deb");
    expect(platformOfAsset("Vizulla-1.0.0-beta.1-win-x64.exe")).toBe("win-x64");
  });

  it("ignores zips, SBOMs and cloud binaries", () => {
    for (const name of [
      "Vizulla-0.3.2-mac-arm64.zip",
      "vizulla-0.3.2-sbom.cdx.json",
      "vizulla-cloud-0.3.2-linux-amd64.tar.gz",
      "SHA256SUMS.txt",
    ])
      expect(platformOfAsset(name)).toBeNull();
  });

  it("parses SHA256SUMS.txt", () => {
    const sums = parseChecksums(
      "a6bcc9af231f317b4edfa348919d7dbb824c2c6b2b49ce7b515a107bfbf23880  Vizulla-0.3.2-mac-arm64.dmg\nnot a line\n",
    );
    expect(sums.get("Vizulla-0.3.2-mac-arm64.dmg")).toBe(
      "a6bcc9af231f317b4edfa348919d7dbb824c2c6b2b49ce7b515a107bfbf23880",
    );
    expect(sums.size).toBe(1);
  });
});

describe("downloadUrlFor", () => {
  const release = {
    tag_name: "v0.3.2",
    published_at: "2026-11-08T22:10:40Z",
    draft: false,
    assets: [
      {
        id: 7,
        name: "Vizulla-0.3.2-win-x64.exe",
        size: 138_000_000,
        browser_download_url:
          "https://github.com/o/r/releases/download/v0.3.2/Vizulla-0.3.2-win-x64.exe",
      },
    ],
  };
  beforeEach(() => {
    vi.resetModules();
    vi.doMock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("asks GitHub for a signed link with the token, and only accepts GitHub hosts", async () => {
    vi.stubEnv("VIZULLA_GITHUB_TOKEN", "t0ken");
    const calls: { url: string; auth: string | null }[] = [];
    let location = "https://release-assets.githubusercontent.com/x?sig=1";
    vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
      calls.push({ url, auth: new Headers(init.headers).get("authorization") });
      if (url.endsWith("/releases/latest")) return Response.json(release);
      return new Response(null, { status: 302, headers: { location } });
    });
    const { downloadUrlFor } = await import("@/features/vizulla/releases");
    expect(await downloadUrlFor("win-x64")).toBe(location);
    expect(calls.at(-1)).toEqual({
      url: expect.stringMatching(/\/releases\/assets\/7$/),
      auth: "Bearer t0ken",
    });
    expect(await downloadUrlFor("mac-arm64")).toBeNull();
    location = "https://evil.example/x";
    expect(await downloadUrlFor("win-x64")).toBeNull();
  });

  it("uses the public URL without a token, and null when GitHub is down", async () => {
    vi.stubEnv("VIZULLA_GITHUB_TOKEN", "");
    vi.stubGlobal("fetch", async () => Response.json(release));
    let mod = await import("@/features/vizulla/releases");
    expect(await mod.downloadUrlFor("win-x64")).toBe(release.assets[0]!.browser_download_url);
    vi.resetModules();
    vi.doMock("next/cache", () => ({ unstable_cache: (fn: () => unknown) => fn }));
    vi.stubGlobal("fetch", async () => new Response("nope", { status: 404 }));
    vi.spyOn(console, "warn").mockImplementation(() => {});
    mod = await import("@/features/vizulla/releases");
    expect(await mod.getVizullaRelease()).toBeNull();
    expect(await mod.downloadUrlFor("win-x64")).toBeNull();
  });
});
