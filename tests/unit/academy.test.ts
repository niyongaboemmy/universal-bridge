import { describe, expect, it } from "vitest";
import { academySchema } from "@/features/academy/schema";
import { intakeView } from "@/lib/cms/academy";
import type { Intake } from "@/payload-types";

const base = {
  intake: "1",
  name: "Aline Uwimana",
  email: "aline@example.org",
  dateOfBirth: "2001-05-20",
  educationLevel: "bachelor",
  currentStatus: "student",
  preferredMode: "online",
  motivation: "I want to build web apps for cooperatives in my district and get a developer job.",
  consent: "on",
};
const errorsOf = (input: object) => {
  const r = academySchema.safeParse(input);
  return r.success
    ? {}
    : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
};

describe("academy schema (SRS §7.2, PRV-08)", () => {
  it("accepts an adult applicant", () => {
    expect(academySchema.safeParse(base).success).toBe(true);
  });
  it("requires a guardian for under-18s", () => {
    const minor = {
      ...base,
      dateOfBirth: new Date(Date.now() - 15 * 365.25 * 86_400_000).toISOString().slice(0, 10),
    };
    expect(errorsOf(minor)).toMatchObject({
      guardianName: "under18Guardian",
      guardianConsent: "under18Guardian",
    });
    expect(
      academySchema.safeParse({ ...minor, guardianName: "Jeanne M", guardianConsent: "on" })
        .success,
    ).toBe(true);
  });
  it("rejects implausible birth dates", () => {
    expect(errorsOf({ ...base, dateOfBirth: "1900-01-01" }).dateOfBirth).toBe("date");
  });
  it("keeps gender and date-of-birth-related fields minimal (PRV-07)", () => {
    expect(academySchema.safeParse({ ...base, gender: "" }).success).toBe(true);
  });
});

describe("intake view (IX-12, FR-ACA-06)", () => {
  const intake = (o: Partial<Intake>) =>
    ({
      id: 1,
      label: "x",
      program: 1,
      startDate: "2027-02-01",
      applicationDeadline: "2027-01-15",
      capacity: 20,
      accepted: 5,
      status: "open",
      updatedAt: "",
      createdAt: "",
      ...o,
    }) as Intake;
  const now = new Date("2027-01-10T08:00:00Z");
  it("computes seats and days left", () => {
    expect(intakeView(intake({}), now)).toMatchObject({
      seatsLeft: 15,
      full: false,
      open: true,
      daysToDeadline: 6,
    });
  });
  it("is full at capacity but still open for the waitlist", () => {
    expect(intakeView(intake({ accepted: 20 }), now)).toMatchObject({
      seatsLeft: 0,
      full: true,
      open: true,
    });
  });
  it("closes after the deadline day or when closed manually", () => {
    expect(intakeView(intake({}), new Date("2027-01-16T08:00:00Z")).open).toBe(false);
    expect(intakeView(intake({}), new Date("2027-01-15T20:00:00Z")).open).toBe(true);
    expect(intakeView(intake({ status: "closed" }), now).open).toBe(false);
  });
});
