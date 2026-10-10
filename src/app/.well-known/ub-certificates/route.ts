import { NextResponse } from "next/server";
import { publicKeyHex } from "@/lib/certificates/sign";

// IX-05: public key so third parties can verify certificate QR signatures offline.
export async function GET() {
  return NextResponse.json({
    issuer: "Universal Bridge Ltd",
    algorithm: "Ed25519",
    message: "<code>|<holderName NFC>|<issuedAt YYYY-MM-DD>",
    signatureEncoding: "base64url, in the ?s= parameter of the QR URL",
    publicKey: await publicKeyHex(),
  });
}
