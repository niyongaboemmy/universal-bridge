import { describe, expect, it } from "vitest";
import {
  isOpenNow,
  tzOffsetMinutes,
  workingOverlap,
  DEFAULT_OFFICE_HOURS,
} from "@/lib/time/office-hours";

describe("tzOffsetMinutes", () => {
  it("Kigali is UTC+2 all year (no DST)", () => {
    expect(tzOffsetMinutes("Africa/Kigali", new Date("2026-01-15T12:00:00Z"))).toBe(120);
    expect(tzOffsetMinutes("Africa/Kigali", new Date("2026-07-15T12:00:00Z"))).toBe(120);
  });
  it("handles DST zones", () => {
    expect(tzOffsetMinutes("Europe/Berlin", new Date("2026-01-15T12:00:00Z"))).toBe(60);
    expect(tzOffsetMinutes("Europe/Berlin", new Date("2026-07-15T12:00:00Z"))).toBe(120);
  });
});

describe("isOpenNow", () => {
  it("is open on a weekday at 10:00 Kigali (08:00 UTC)", () => {
    expect(isOpenNow(DEFAULT_OFFICE_HOURS, new Date("2026-10-14T08:00:00Z"))).toBe(true);
  });
  it("is closed at 17:00 Kigali and at weekends", () => {
    expect(isOpenNow(DEFAULT_OFFICE_HOURS, new Date("2026-10-14T15:00:00Z"))).toBe(false);
    expect(isOpenNow(DEFAULT_OFFICE_HOURS, new Date("2026-10-17T08:00:00Z"))).toBe(false);
  });
});

describe("workingOverlap (IX-03)", () => {
  const summer = new Date("2026-07-15T12:00:00Z");
  it("Berlin in summer overlaps fully: same clock time", () => {
    expect(workingOverlap("Europe/Berlin", summer).hours).toBe(8);
  });
  it("London in summer: 1 h behind → 7 h overlap", () => {
    expect(workingOverlap("Europe/London", summer).hours).toBe(7);
  });
  it("New York in summer: 6 h behind → 2 h overlap", () => {
    expect(workingOverlap("America/New_York", summer).hours).toBe(2);
  });
  it("Los Angeles: no overlap", () => {
    expect(workingOverlap("America/Los_Angeles", summer).hours).toBe(0);
  });
  it("Kigali itself: 8 h", () => {
    expect(workingOverlap("Africa/Kigali", summer).hours).toBe(8);
  });
});
