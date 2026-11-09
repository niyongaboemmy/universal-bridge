/**
 * Vizulla Browser downloads: which installer fits which computer. Pure
 * functions shared by the server (release parsing) and the browser
 * (operating-system detection), so both agree on the same five installers.
 */

export const PLATFORMS = [
  "mac-arm64",
  "mac-x64",
  "win-x64",
  "linux-appimage",
  "linux-deb",
] as const;
export type PlatformId = (typeof PLATFORMS)[number];
export type OsFamily = "mac" | "windows" | "linux";

export const PLATFORM_OS: Record<PlatformId, OsFamily> = {
  "mac-arm64": "mac",
  "mac-x64": "mac",
  "win-x64": "windows",
  "linux-appimage": "linux",
  "linux-deb": "linux",
};

/** Installer file names as the Vizulla release workflow publishes them. */
const ASSET_PATTERNS: Record<PlatformId, RegExp> = {
  "mac-arm64": /^Vizulla-[\d.]+(?:-[\w.]+)?-mac-arm64\.dmg$/,
  "mac-x64": /^Vizulla-[\d.]+(?:-[\w.]+)?-mac-x64\.dmg$/,
  "win-x64": /^Vizulla-[\d.]+(?:-[\w.]+)?-win-x64\.exe$/,
  "linux-appimage": /^Vizulla-[\d.]+(?:-[\w.]+)?-linux-x86_64\.AppImage$/,
  "linux-deb": /^Vizulla-[\d.]+(?:-[\w.]+)?-linux-amd64\.deb$/,
};

export function isPlatformId(value: string): value is PlatformId {
  return (PLATFORMS as readonly string[]).includes(value);
}

export function platformOfAsset(name: string): PlatformId | null {
  return PLATFORMS.find((p) => ASSET_PATTERNS[p].test(name)) ?? null;
}

/** "a6bc…  Vizulla-0.3.2-mac-arm64.dmg" lines → file name → SHA-256. */
export function parseChecksums(text: string): Map<string, string> {
  const sums = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const m = /^([a-f0-9]{64})\s+\*?(.+)$/i.exec(line.trim());
    if (m) sums.set(m[2]!.trim(), m[1]!.toLowerCase());
  }
  return sums;
}

export type Detection = {
  /** null: a phone or tablet, or a system Vizulla doesn't run on. */
  os: OsFamily | "mobile" | null;
  platform: PlatformId | null;
  /** False when a Mac's chip couldn't be read (the default is Apple silicon). */
  certain: boolean;
};

/**
 * Picks the installer for this visitor. `architecture` comes from User-Agent
 * Client Hints (Chromium browsers); `gpu` is the WebGL renderer string, which
 * names the Apple M-series chip or an Intel/AMD GPU where the browser allows it.
 */
export function detectPlatform(input: {
  userAgent: string;
  uaPlatform?: string | null;
  architecture?: string | null;
  gpu?: string | null;
  touchPoints?: number;
}): Detection {
  const ua = input.userAgent;
  const hint = (input.uaPlatform ?? "").toLowerCase();
  if (/android|iphone|ipad|ipod/i.test(ua) || hint === "android" || hint === "ios")
    return { os: "mobile", platform: null, certain: true };
  const mac = hint === "macos" || /macintosh|mac os x/i.test(ua);
  // iPadOS asks for the desktop site and reports itself as a Mac with a touch screen.
  if (mac && (input.touchPoints ?? 0) > 1) return { os: "mobile", platform: null, certain: true };
  if (mac) {
    const arch = (input.architecture ?? "").toLowerCase();
    if (arch === "arm") return { os: "mac", platform: "mac-arm64", certain: true };
    if (arch === "x86") return { os: "mac", platform: "mac-x64", certain: true };
    const gpu = input.gpu ?? "";
    if (/apple m\d/i.test(gpu)) return { os: "mac", platform: "mac-arm64", certain: true };
    if (/intel|amd|radeon|nvidia/i.test(gpu))
      return { os: "mac", platform: "mac-x64", certain: true };
    // Every Mac sold since 2020 has Apple silicon.
    return { os: "mac", platform: "mac-arm64", certain: false };
  }
  if (hint === "windows" || /windows/i.test(ua))
    return { os: "windows", platform: "win-x64", certain: true };
  if (hint === "linux" || hint === "chrome os" || /linux|x11|cros/i.test(ua))
    return { os: "linux", platform: "linux-appimage", certain: true };
  return { os: null, platform: null, certain: false };
}
