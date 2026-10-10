import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const secret = () => process.env.PAYLOAD_SECRET ?? "dev";

/** Signed, non-expiring unsubscribe token for an email (no lookup table needed). */
export function unsubscribeToken(email: string) {
  return createHmac("sha256", `${secret()}:unsubscribe`)
    .update(email.toLowerCase())
    .digest("base64url")
    .slice(0, 32);
}

export function checkUnsubscribeToken(email: string, token: string) {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
