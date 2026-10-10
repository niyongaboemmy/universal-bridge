import { describe, expect, it } from "vitest";
import { delta, fmtMoney, hoursSince, timeAgo } from "@/components/office/format";
import { BOT, classify } from "@/lib/analytics/ua";

describe("analytics visitor classification", () => {
  it("recognises devices, browsers and systems", () => {
    expect(
      classify(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1",
      ),
    ).toEqual({ device: "mobile", browser: "Safari", os: "iOS" });
    expect(
      classify(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128.0 Safari/537.36 Edg/128.0",
      ),
    ).toEqual({ device: "desktop", browser: "Edge", os: "Windows" });
    expect(
      classify(
        "Mozilla/5.0 (Linux; Android 14; SM-A145F) AppleWebKit/537.36 SamsungBrowser/25.0 Chrome/121 Mobile Safari/537.36",
      ),
    ).toMatchObject({ device: "mobile", browser: "Samsung Internet", os: "Android" });
  });
  it("ignores bots and scripts", () => {
    for (const ua of [
      "Googlebot/2.1",
      "curl/8.4",
      "Mozilla/5.0 (X11) HeadlessChrome/120",
      "python-requests/2.31",
      "UptimeRobot/2.0",
    ])
      expect(BOT.test(ua)).toBe(true);
    expect(BOT.test("Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/128 Safari/537.36")).toBe(
      false,
    );
  });
});

describe("dashboard formatting", () => {
  it("only shows a change when there is something to compare with", () => {
    expect(delta(12, 0)).toBeUndefined();
    expect(delta(15, 10)).toBe(50);
    expect(delta(5, 10)).toBe(-50);
  });
  it("formats money and ages", () => {
    expect(fmtMoney(2500000)).toBe("2.5M RWF");
    expect(fmtMoney(250000)).toBe("250,000 RWF");
    expect(fmtMoney(null)).toBe("—");
    const now = Date.parse("2026-10-10T12:00:00Z");
    expect(timeAgo("2026-10-10T11:58:00Z", now)).toBe("2 min ago");
    expect(timeAgo("2026-10-09T12:00:00Z", now)).toBe("1 d ago");
    expect(hoursSince("2026-10-10T06:00:00Z", now)).toBe(6);
  });
});
