import { createHash } from "node:crypto";
import * as ed from "@noble/ed25519";
import { randomBase32 } from "@/lib/ids";

/**
 * IX-05 signed certificates. The QR code carries an Ed25519 signature over
 * the code, holder name and issue date, so a forged PDF that reuses a real
 * code with a different name fails verification.
 */
export function certificateCode(year = new Date().getFullYear()) {
  return `UB-${year}-${randomBase32(10)}`; // FR-CERT-03: unguessable (50 bits)
}

export const CODE_PATTERN = /^UB-\d{4}-[0-9A-HJKMNP-TV-Z]{10}$/;

function privateKey(): Uint8Array {
  const hex = process.env.CERT_SIGNING_KEY;
  if (hex && /^[0-9a-f]{64}$/i.test(hex)) return Uint8Array.from(Buffer.from(hex, "hex"));
  if (process.env.NODE_ENV === "production")
    throw new Error("CERT_SIGNING_KEY (32-byte hex) is required in production");
  // Development: a stable key derived from the Payload secret.
  return Uint8Array.from(
    createHash("sha256")
      .update(`cert:${process.env.PAYLOAD_SECRET ?? "dev"}`)
      .digest(),
  );
}

/**
 * The issue date as a Kigali calendar day. Payload stores dates as instants
 * (local midnight → "2026-08-04T22:00:00Z"), so slicing the ISO string would
 * give the previous day.
 */
export function kigaliDay(value: string | Date) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Kigali",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function signedMessage(c: { code: string; holderName: string; issuedAt: string }) {
  return new TextEncoder().encode(
    `${c.code}|${c.holderName.trim().normalize("NFC")}|${kigaliDay(c.issuedAt)}`,
  );
}

const b64url = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64url");

export async function signCertificate(c: { code: string; holderName: string; issuedAt: string }) {
  return b64url(await ed.signAsync(signedMessage(c), privateKey()));
}

export async function verifyCertificateSignature(
  c: { code: string; holderName: string; issuedAt: string },
  signature: string,
) {
  try {
    const publicKey = await ed.getPublicKeyAsync(privateKey());
    return await ed.verifyAsync(
      Uint8Array.from(Buffer.from(signature, "base64url")),
      signedMessage(c),
      publicKey,
    );
  } catch {
    return false;
  }
}

/** Public key for third parties who want to verify offline (published at /.well-known). */
export async function publicKeyHex() {
  return Buffer.from(await ed.getPublicKeyAsync(privateKey())).toString("hex");
}
