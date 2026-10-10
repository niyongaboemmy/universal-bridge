/**
 * Proof that a staff session passed MFA: HMAC over the user id and Payload's
 * session id (sid), kept in an httpOnly cookie. Bound to one session, so a
 * stolen proof is useless with another login, and it dies with the session.
 * Web Crypto only: runs in the proxy and on the server.
 */
export const MFA_COOKIE = "ub-mfa";
export const MFA_HEADER = "x-ub-mfa";

const enc = new TextEncoder();
let cachedKey: Promise<CryptoKey> | null = null;

function hmacKey() {
  const secret = process.env.MFA_ENCRYPTION_KEY || process.env.PAYLOAD_SECRET || "";
  cachedKey ??= crypto.subtle.importKey(
    "raw",
    enc.encode(`ub-mfa-proof:${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return cachedKey;
}

const b64url = (buf: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

export async function signMfaProof(userId: string | number, sid: string): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), enc.encode(`${userId}.${sid}`));
  return b64url(sig);
}

export async function verifyMfaProof(
  proof: string | undefined | null,
  userId: string | number,
  sid: string | undefined,
): Promise<boolean> {
  if (!proof || !sid) return false;
  const expected = await signMfaProof(userId, sid);
  if (expected.length !== proof.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ proof.charCodeAt(i);
  return diff === 0;
}

/**
 * Two-step verification is off until UB switches it on (normal email + password
 * sign-in for now). "required": every staff account must enrol. "enrolled": only
 * accounts that turned it on are asked. Anything else: off.
 */
export function mfaMode(): "required" | "enrolled" | "off" {
  const v = process.env.MFA_ENFORCEMENT;
  return v === "required" || v === "enrolled" ? v : "off";
}

/** SSO (Google / Microsoft) is off until UB registers the apps and sets SSO_ENABLED=1. */
export const ssoEnabled = () => process.env.SSO_ENABLED === "1";
