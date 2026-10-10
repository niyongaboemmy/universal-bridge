/** Coarse user-agent classification for analytics (no fingerprinting detail kept). */
export const BOT =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|playwright/i;

export function classify(ua: string) {
  const device = /ipad|tablet/i.test(ua)
    ? "tablet"
    : /mobi|android|iphone/i.test(ua)
      ? "mobile"
      : "desktop";
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\/|opera/i.test(ua)
      ? "Opera"
      : /samsungbrowser/i.test(ua)
        ? "Samsung Internet"
        : /chrome|crios/i.test(ua)
          ? "Chrome"
          : /firefox|fxios/i.test(ua)
            ? "Firefox"
            : /safari/i.test(ua)
              ? "Safari"
              : "Other";
  const os = /windows/i.test(ua)
    ? "Windows"
    : /iphone|ipad|ios/i.test(ua)
      ? "iOS"
      : /android/i.test(ua)
        ? "Android"
        : /mac os/i.test(ua)
          ? "macOS"
          : /linux/i.test(ua)
            ? "Linux"
            : "Other";
  return { device, browser, os };
}
