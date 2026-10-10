import { describe, expect, it } from "vitest";
import { errorText, summaryText, type FormCopy } from "@/components/forms/copy";
import { DEPARTMENTS as LEAD_DEPARTMENTS } from "@/collections/Leads";
import { contactSchema, DEPARTMENTS } from "@/features/contact/schema";
import { formDataToObject, issuesToFieldErrors } from "@/lib/forms/form-data";
import { toE164 } from "@/lib/forms/phone";
import { backoffMs, MAX_ATTEMPTS } from "@/lib/outbox";
import { __resetMemoryLimits, hashKey, rateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { randomBase32, submissionRef } from "@/lib/ids";

const valid = {
  department: "sales",
  name: "Amina Uwase",
  email: "amina@example.org",
  message: "We need a mobile app for our cooperative members.",
  consent: "on",
};

function errorsOf(input: unknown) {
  const r = contactSchema.safeParse(input);
  return r.success
    ? {}
    : issuesToFieldErrors(r.error.issues.map((i) => ({ path: i.path, message: i.message })));
}

describe("contact schema (FR-FORM-01)", () => {
  it("accepts a minimal valid inquiry", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it("requires consent, unticked by default (FR-FORM-04)", () => {
    expect(errorsOf({ ...valid, consent: undefined }).consent).toBe("consent");
    expect(contactSchema.safeParse({ ...valid, consent: true }).success).toBe(true);
  });
  it("returns i18n keys with arguments", () => {
    const e = errorsOf({ ...valid, name: "A", email: "nope", message: "short" });
    expect(e.name).toBe("tooShort:2");
    expect(e.email).toBe("email");
    expect(e.message).toBe("tooShort:20");
  });
  it("reports 'required' rather than 'too short' for empty fields", () => {
    expect(errorsOf({ ...valid, name: "   " }).name).toBe("required");
  });
  it("rejects unknown departments and budgets", () => {
    expect(errorsOf({ ...valid, department: "spam" }).department).toBe("required");
    expect(errorsOf({ ...valid, budgetRange: "a million" }).budgetRange).toBeDefined();
    expect(contactSchema.safeParse({ ...valid, budgetRange: "" }).success).toBe(true);
  });
  it("keeps the lead and form department lists in sync", () => {
    expect([...DEPARTMENTS]).toEqual([...LEAD_DEPARTMENTS]);
  });
});

describe("FormData parsing", () => {
  it("collects checkbox groups and drops action/turnstile keys", () => {
    const fd = new FormData();
    fd.append("services", "cloud-devops");
    fd.append("services", "ai-data");
    fd.append("name", "Jean");
    fd.append("$ACTION_ID_abc", "");
    fd.append("cf-turnstile-response", "token");
    expect(formDataToObject(fd, ["services", "other"])).toEqual({
      services: ["cloud-devops", "ai-data"],
      name: "Jean",
      other: [],
    });
  });
});

describe("phone normalisation (FR-FORM-07)", () => {
  it("defaults to Rwanda and outputs E.164", () => {
    expect(toE164("0782 634 364")).toBe("+250782634364");
    expect(toE164("+254 712 345 678", "RW")).toBe("+254712345678");
    expect(toE164("030 1234567", "DE")).toBe("+49301234567");
  });
  it("treats empty as null and nonsense as invalid", () => {
    expect(toE164("")).toBeNull();
    expect(toE164("12")).toBe(false);
  });
});

describe("rate limiting (FR-FORM-03)", () => {
  it("allows up to the limit, then blocks", async () => {
    __resetMemoryLimits();
    const opts = { limit: 2, windowSec: 60 };
    expect((await rateLimit("t", "1.2.3.4", opts)).success).toBe(true);
    expect((await rateLimit("t", "1.2.3.4", opts)).success).toBe(true);
    expect((await rateLimit("t", "1.2.3.4", opts)).success).toBe(false);
    expect((await rateLimit("t", "5.6.7.8", opts)).success).toBe(true);
  });
  it("never stores raw identifiers", () => {
    const key = hashKey("amina@example.org");
    expect(key).not.toContain("amina");
    expect(key).toHaveLength(32);
    expect(hashKey("AMINA@example.org")).toBe(key);
  });
});

describe("Turnstile (FR-FORM-03)", () => {
  it("treats a missing token as no-JS, not as a bot", async () => {
    expect(await verifyTurnstile(null)).toBe("missing");
  });
  it("passes Cloudflare's test key without a network call outside production", async () => {
    process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
    expect(await verifyTurnstile("XXXX.DUMMY.TOKEN.XXXX")).toBe("passed");
  });
});

describe("outbox backoff (NFR-REL-02)", () => {
  it("doubles each attempt and gives up after 5", () => {
    expect([1, 2, 3, 4].map(backoffMs)).toEqual([60_000, 120_000, 240_000, 480_000]);
    expect(MAX_ATTEMPTS).toBe(5);
  });
});

describe("references", () => {
  it("uses unambiguous base32", () => {
    const s = randomBase32(200);
    expect(s).toMatch(/^[0-9A-HJKMNP-TV-Z]+$/);
    expect(submissionRef("L")).toMatch(/^L-[0-9A-Z]{8}$/);
  });
});

describe("client error copy", () => {
  const copy = {
    errors: { required: "Required.", tooShort: "At least {min} characters." },
    errorSummaryOne: "Fix 1 problem:",
    errorSummaryOther: "Fix {count} problems:",
  } as unknown as FormCopy;
  it("fills arguments", () => {
    expect(errorText(copy, "tooShort:20")).toBe("At least 20 characters.");
    expect(errorText(copy, undefined)).toBeUndefined();
  });
  it("pluralises the summary", () => {
    expect(summaryText(copy, 1)).toBe("Fix 1 problem:");
    expect(summaryText(copy, 3)).toBe("Fix 3 problems:");
  });
});
