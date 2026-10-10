import { describe, expect, it } from "vitest";
import { isRealDate, parseCsv, validateCertRows } from "@/lib/certificates/csv";
import {
  certificateCode,
  CODE_PATTERN,
  kigaliDay,
  signCertificate,
  verifyCertificateSignature,
} from "@/lib/certificates/sign";
import { normaliseCode } from "@/lib/certificates/lookup";
import { sniff } from "@/lib/uploads";
import { ageOn } from "@/lib/time/age";

describe("certificate codes (FR-CERT-03)", () => {
  it("are UB-YYYY- plus 10 unambiguous characters", () => {
    const codes = new Set(Array.from({ length: 500 }, () => certificateCode(2026)));
    expect(codes.size).toBe(500);
    for (const c of codes) expect(c).toMatch(CODE_PATTERN);
  });
  it("normalise what people type", () => {
    expect(normaliseCode(" ub-2026-7k3q9mxa2b ")).toBe("UB-2026-7K3Q9MXA2B");
    expect(normaliseCode("UB-2026-0OIL")).toBe("UB-2026-0011");
  });
});

describe("certificate signatures (IX-05)", () => {
  const cert = { code: "UB-2026-7K3Q9MXA2B", holderName: "Jane Mukamana", issuedAt: "2026-08-05" };
  it("verify the signed details", async () => {
    const sig = await signCertificate(cert);
    expect(await verifyCertificateSignature(cert, sig)).toBe(true);
  });
  it("fail when the name is changed", async () => {
    const sig = await signCertificate(cert);
    expect(await verifyCertificateSignature({ ...cert, holderName: "Someone Else" }, sig)).toBe(
      false,
    );
    expect(await verifyCertificateSignature(cert, "garbage")).toBe(false);
  });
  it("use the Kigali calendar day for stored instants", async () => {
    expect(kigaliDay("2026-08-04T22:00:00.000Z")).toBe("2026-08-05");
    expect(kigaliDay("2026-08-05")).toBe("2026-08-05");
    const sig = await signCertificate(cert);
    expect(
      await verifyCertificateSignature({ ...cert, issuedAt: "2026-08-04T22:00:00.000Z" }, sig),
    ).toBe(true);
  });
});

describe("CSV import (FR-CERT-04)", () => {
  it("parses quotes, escaped quotes and CRLF", () => {
    expect(parseCsv('a,b\r\n"x, y","say ""hi"""\r\n')).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"'],
    ]);
  });
  it("rejects impossible dates", () => {
    expect(isRealDate("2026-02-28")).toBe(true);
    expect(isRealDate("2026-02-30")).toBe(false);
    expect(isRealDate("2026-13-01")).toBe(false);
  });
  it("reports problems per line", () => {
    const rows = parseCsv(
      "holderName,kind,programTitle,startDate,endDate,signatoryName,signatoryTitle\nA,course,X,2026-05-01,2026-04-01,S,T\n",
    );
    const { valid, errors } = validateCertRows(rows);
    expect(valid).toHaveLength(0);
    expect(errors[0]).toMatchObject({ line: 2 });
    expect(errors[0]!.message).toContain("kind must be internship or training");
    expect(errors[0]!.message).toContain("endDate is before startDate");
  });
  it("requires the columns", () => {
    expect(validateCertRows(parseCsv("holderName\nA\n")).errors[0]!.message).toContain(
      "Missing columns",
    );
  });
});

describe("upload sniffing (NFR-SEC-06)", () => {
  it("recognises real files by their bytes", () => {
    expect(sniff(Buffer.from("%PDF-1.7 ..."))?.ext).toBe("pdf");
    expect(sniff(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0]))?.ext).toBe(
      "doc",
    );
    expect(
      sniff(
        Buffer.concat([
          Buffer.from([0x50, 0x4b, 0x03, 0x04]),
          Buffer.from("....word/document.xml"),
        ]),
      )?.ext,
    ).toBe("docx");
  });
  it("rejects disguised files", () => {
    expect(sniff(Buffer.from("MZ\x90\x00 executable"))).toBeNull();
    expect(
      sniff(Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("xl/workbook.xml")])),
    ).toBeNull();
    expect(sniff(Buffer.from("<script>alert(1)</script>"))).toBeNull();
  });
});

describe("age (PRV-08)", () => {
  it("counts birthdays correctly", () => {
    const on = new Date("2026-10-09T12:00:00Z");
    expect(ageOn("2008-10-09", on)).toBe(18);
    expect(ageOn("2008-10-10", on)).toBe(17);
  });
});
