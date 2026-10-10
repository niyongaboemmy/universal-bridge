import { randomBytes } from "node:crypto";

// Crockford base32: no I, L, O, U — easy to read aloud and type.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** Cryptographically random base32 string of `length` characters. */
export function randomBase32(length: number): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i]! & 31];
  return out;
}

/** Human-friendly submission reference, e.g. "L-7K3Q9MXA". */
export const submissionRef = (prefix: string) => `${prefix}-${randomBase32(8)}`;
