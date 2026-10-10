import { describe, expect, it, vi } from "vitest";
import { passwordProblem } from "@/lib/auth/password";
import { signMfaProof, verifyMfaProof } from "@/lib/auth/mfa-proof";
import {
  base32Decode,
  base32Encode,
  decryptSecret,
  encryptSecret,
  generateRecoveryCodes,
  hashRecoveryCode,
  totpAt,
  verifyTotp,
} from "@/lib/auth/totp";

vi.mock("server-only", () => ({}));
process.env.PAYLOAD_SECRET ??= "unit-test-secret";

// RFC 6238 appendix B: SHA-1 key "12345678901234567890", 8-digit codes; we use the last 6.
const RFC_SECRET = base32Encode(Buffer.from("12345678901234567890"));

describe("TOTP (ADM-01)", () => {
  it("matches the RFC 6238 test vectors", () => {
    expect(totpAt(RFC_SECRET, Math.floor(59 / 30))).toBe("287082");
    expect(totpAt(RFC_SECRET, Math.floor(1111111109 / 30))).toBe("081804");
    expect(totpAt(RFC_SECRET, Math.floor(1234567890 / 30))).toBe("005924");
    expect(totpAt(RFC_SECRET, Math.floor(2000000000 / 30))).toBe("279037");
  });

  it("round-trips base32", () => {
    const buf = Buffer.from([0, 1, 2, 250, 255, 7, 9]);
    expect(base32Decode(base32Encode(buf))).toEqual(buf);
  });

  it("accepts ±1 step of drift and refuses replays", () => {
    const now = 1234567890 * 1000;
    const step = Math.floor(1234567890 / 30);
    expect(verifyTotp(RFC_SECRET, totpAt(RFC_SECRET, step - 1), { now })).toBe(step - 1);
    expect(verifyTotp(RFC_SECRET, totpAt(RFC_SECRET, step + 1), { now })).toBe(step + 1);
    expect(verifyTotp(RFC_SECRET, totpAt(RFC_SECRET, step - 2), { now })).toBeNull();
    expect(verifyTotp(RFC_SECRET, totpAt(RFC_SECRET, step), { now, lastStep: step })).toBeNull();
    expect(verifyTotp(RFC_SECRET, "12345", { now })).toBeNull();
  });

  it("stores secrets encrypted and detects tampering", () => {
    const enc = encryptSecret("JBSWY3DPEHPK3PXP");
    expect(enc).not.toContain("JBSWY3DPEHPK3PXP");
    expect(decryptSecret(enc)).toBe("JBSWY3DPEHPK3PXP");
    const parts = enc.split(".");
    parts[3] = parts[3]!.slice(0, -2) + (parts[3]!.endsWith("A") ? "BB" : "AA");
    expect(() => decryptSecret(parts.join("."))).toThrow();
  });

  it("recovery codes are unique and hashed case-insensitively", () => {
    const codes = generateRecoveryCodes();
    expect(new Set(codes).size).toBe(10);
    expect(codes[0]).toMatch(/^[a-z2-7]{5}-[a-z2-7]{5}$/);
    expect(hashRecoveryCode(codes[0]!.toUpperCase())).toBe(hashRecoveryCode(codes[0]!));
  });
});

describe("MFA proof is bound to the session", () => {
  it("verifies only for the same user and session", async () => {
    const proof = await signMfaProof(7, "sid-a");
    expect(await verifyMfaProof(proof, 7, "sid-a")).toBe(true);
    expect(await verifyMfaProof(proof, 7, "sid-b")).toBe(false);
    expect(await verifyMfaProof(proof, 8, "sid-a")).toBe(false);
    expect(await verifyMfaProof(undefined, 7, "sid-a")).toBe(false);
  });
});

describe("password policy (NFR-SEC-05)", () => {
  it("prefers length and blocks common or personal passwords", () => {
    expect(passwordProblem("short")).toMatch(/at least 12/);
    expect(passwordProblem("password1234")).toBeNull();
    expect(passwordProblem("Password123")).toMatch(/at least/);
    expect(passwordProblem("universalbridge")).toMatch(/common/);
    expect(passwordProblem("aaaaaaaaaaaaaa")).toMatch(/repeat/);
    expect(passwordProblem("jean.claude-2026!", { email: "jean.claude@ub.rw" })).toMatch(/email/);
    expect(passwordProblem("mugisha rocks 2026", { name: "Eric Mugisha" })).toMatch(/name/);
    expect(passwordProblem("blue river under the bridge")).toBeNull();
  });
});

describe("SSO identity checks", async () => {
  process.env.GOOGLE_CLIENT_ID = "g";
  process.env.GOOGLE_CLIENT_SECRET = "s";
  process.env.MICROSOFT_CLIENT_ID = "m";
  process.env.MICROSOFT_CLIENT_SECRET = "s";
  const { PROVIDERS, emailFromClaims } = await import("@/lib/auth/sso");

  it("Google: issuer, nonce and verified email", () => {
    const ok = {
      iss: "https://accounts.google.com",
      nonce: "n",
      email: "A@UB.RW",
      email_verified: true,
    };
    expect(emailFromClaims(PROVIDERS.google, ok, "n")).toBe("a@ub.rw");
    expect(() => emailFromClaims(PROVIDERS.google, { ...ok, nonce: "x" }, "n")).toThrow(/Nonce/);
    expect(() => emailFromClaims(PROVIDERS.google, { ...ok, email_verified: false }, "n")).toThrow(
      /verified/,
    );
    expect(() =>
      emailFromClaims(PROVIDERS.google, { ...ok, iss: "https://evil.example" }, "n"),
    ).toThrow(/issuer/);
  });

  it("Microsoft: tenant-bound issuer and domain allowlist", () => {
    const tid = "11111111-2222-3333-4444-555555555555";
    const claims = {
      iss: `https://login.microsoftonline.com/${tid}/v2.0`,
      tid,
      nonce: "n",
      preferred_username: "x@ub.rw",
    };
    expect(emailFromClaims(PROVIDERS.microsoft, claims, "n")).toBe("x@ub.rw");
    expect(() => emailFromClaims(PROVIDERS.microsoft, { ...claims, tid: "other" }, "n")).toThrow(
      /issuer/,
    );
    process.env.SSO_ALLOWED_DOMAINS = "universalbridge.rw";
    expect(() => emailFromClaims(PROVIDERS.microsoft, claims, "n")).toThrow(/Domain/);
    delete process.env.SSO_ALLOWED_DOMAINS;
  });
});
