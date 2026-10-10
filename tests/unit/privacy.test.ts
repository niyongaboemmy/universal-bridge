import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { toCsv, cronAuthorized, emailRef } = await import("@/lib/privacy");

describe("CSV export (ADM-06)", () => {
  it("quotes, flattens and neutralises spreadsheet formulas", () => {
    const csv = toCsv(
      [
        {
          ref: "L-1",
          name: 'Ann "A", B',
          message: '=HYPERLINK("x")',
          consent: { marketing: true },
          services: ["web", "ai"],
        },
      ],
      ["ref", "name", "message", "consent.marketing", "services", "missing"],
    );
    const [head, row] = csv.trim().split("\r\n");
    expect(head).toBe("ref,name,message,consent.marketing,services,missing");
    expect(row).toBe('L-1,"Ann ""A"", B","\'=HYPERLINK(""x"")",true,"[""web"",""ai""]",');
  });
});

describe("cron secret", () => {
  it("refuses everything when no secret is configured", () => {
    const saved = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    expect(cronAuthorized("Bearer undefined")).toBe(false);
    process.env.CRON_SECRET = "s3cret";
    expect(cronAuthorized("Bearer s3cret")).toBe(true);
    expect(cronAuthorized("Bearer nope")).toBe(false);
    process.env.CRON_SECRET = saved;
  });
});

describe("data-subject audit references", () => {
  it("are stable, case-insensitive and don't contain the email", () => {
    expect(emailRef("Ann@Example.org")).toBe(emailRef(" ann@example.org "));
    expect(emailRef("ann@example.org")).not.toContain("ann");
  });
});
