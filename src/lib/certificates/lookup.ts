import "server-only";
import type { Certificate } from "@/payload-types";
import { payload } from "@/lib/cms/payload";
import { rateLimit } from "@/lib/security/rate-limit";
import { CODE_PATTERN, verifyCertificateSignature } from "./sign";

export type VerifyResult =
  | { state: "rate-limited" }
  | { state: "not-found"; code: string }
  | {
      state: "valid" | "revoked";
      certificate: PublicCertificate;
      signature: "ok" | "mismatch" | "absent";
    };

/** FR-CERT-02: only these fields are ever shown publicly. */
export type PublicCertificate = Pick<
  Certificate,
  | "code"
  | "holderName"
  | "kind"
  | "programTitle"
  | "role"
  | "startDate"
  | "endDate"
  | "issuedAt"
  | "signatoryName"
  | "signatoryTitle"
  | "status"
  | "revokedReason"
>;

export function normaliseCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
}

/** FR-CERT-03: lookups are rate-limited per IP; unknown codes reveal nothing. */
export async function verifyCertificate(
  rawCode: string,
  ip: string,
  signature?: string | null,
): Promise<VerifyResult> {
  const limit = await rateLimit("cert", ip, { limit: 20, windowSec: 600 });
  if (!limit.success) return { state: "rate-limited" };
  const code = normaliseCode(rawCode).replace(/^UB-(\d{4})-?/, "UB-$1-");
  if (!CODE_PATTERN.test(code)) return { state: "not-found", code };
  const res = await (
    await payload()
  ).find({
    collection: "certificates",
    where: { code: { equals: code } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  const c = res.docs[0];
  if (!c) return { state: "not-found", code };
  const certificate: PublicCertificate = {
    code: c.code,
    holderName: c.holderName,
    kind: c.kind,
    programTitle: c.programTitle,
    role: c.role,
    startDate: c.startDate,
    endDate: c.endDate,
    issuedAt: c.issuedAt,
    signatoryName: c.signatoryName,
    signatoryTitle: c.signatoryTitle,
    status: c.status,
    revokedReason: c.revokedReason,
  };
  let sig: "ok" | "mismatch" | "absent" = "absent";
  if (signature) {
    sig = (await verifyCertificateSignature(
      { code: c.code!, holderName: c.holderName, issuedAt: c.issuedAt },
      signature,
    ))
      ? "ok"
      : "mismatch";
  }
  return { state: c.status === "revoked" ? "revoked" : "valid", certificate, signature: sig };
}

/** IX-05: LinkedIn "Add licence or certification" deep link. */
export function linkedInAddUrl(c: PublicCertificate, verifyUrl: string) {
  const issued = new Date(c.issuedAt);
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: c.programTitle,
    organizationName: "Universal Bridge Ltd",
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certUrl: verifyUrl,
    certId: c.code ?? "",
  });
  return `https://www.linkedin.com/profile/add?${params}`;
}

/** URL printed into the QR code: verify page + signature. */
export function qrUrl(base: string, code: string, signature: string) {
  return `${base}/academy/verify/${code}?s=${signature}`;
}
