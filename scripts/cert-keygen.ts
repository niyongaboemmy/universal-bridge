// pnpm cert:keygen — prints a new Ed25519 private key (32 bytes, hex) for CERT_SIGNING_KEY.
// Store it in the hosting secret manager. Rotating it invalidates QR signatures on
// certificates already printed (their codes still verify; the signature check won't).
import { randomBytes } from "node:crypto";
console.log(randomBytes(32).toString("hex"));
