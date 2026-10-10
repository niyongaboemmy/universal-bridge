import { describe, expect, it } from "vitest";
import { deviceLabel, memberResetEmail, staffInviteEmail, staffResetEmail } from "@/emails/account";
import { applicationStatusEmail } from "@/emails/application";
import { leadConfirmationEmail } from "@/emails/lead";

// INT-01: every email uses the branded layout; account emails carry working links.

describe("account emails", () => {
  it("invitation: branded, links to the set-password page, lists role and inviter", async () => {
    const m = await staffInviteEmail({
      token: "tok123",
      name: "Jean Mugisha",
      email: "jean@example.org",
      roles: ["Editor"],
      invitedBy: "Aline Uwase",
    });
    expect(m.subject).toBe("You're invited to Universal Bridge Office");
    expect(m.html).toContain("/brand/ub-mark-white-email.png");
    expect(m.html).toContain("/login/reset?token=tok123&amp;invite=1");
    expect(m.html).toContain("prefers-color-scheme: dark");
    expect(m.text).toContain("Hi Jean,");
    expect(m.text).toContain("Role: Editor");
    expect(m.text).toContain("Invited by: Aline Uwase");
    expect(m.text).toContain("In 3 days");
  });

  it("staff reset: one-hour link, request details, no invitation wording", async () => {
    const m = await staffResetEmail({
      token: "a b",
      email: "jean@example.org",
      device: "Chrome · macOS",
    });
    expect(m.subject).toBe("Reset your Universal Bridge password");
    expect(m.html).toContain("/login/reset?token=a%20b");
    expect(m.html).not.toContain("invite=1");
    expect(m.text).toContain("From: Chrome · macOS");
    expect(m.text).toContain("Hi jean,");
  });

  it("member reset is in the member's language and links to the localized page", async () => {
    const fr = await memberResetEmail({ token: "t", email: "a@example.org", locale: "fr" });
    expect(fr.subject).toBe("Réinitialisez votre mot de passe Universal Bridge");
    expect(fr.html).toContain('lang="fr"');
    expect(fr.html).toContain("/fr/account/reset?token=t");
    const en = await memberResetEmail({ token: "t", email: "a@example.org", locale: "xx" });
    expect(en.html).toContain("/account/reset?token=t");
    expect(en.html).not.toContain("/en/account");
  });

  it("names the browser and system without storing the raw user agent", () => {
    expect(
      deviceLabel(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
      ),
    ).toBe("Chrome · macOS");
    expect(
      deviceLabel(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Safari/605.1",
      ),
    ).toBe("Safari · iOS");
    expect(deviceLabel(undefined)).toBeNull();
    expect(deviceLabel("curl/8.0")).toBeNull();
  });
});

describe("site emails use the shared layout", () => {
  it("lead confirmation quotes the message in a panel (no side bar) with a booking button", async () => {
    const m = await leadConfirmationEmail({
      ref: "UB-1",
      name: "Amina Uwase",
      email: "amina@example.org",
      department: "sales",
      message: "Hello there",
      locale: "en",
    });
    expect(m.html).toContain("ub-panel");
    expect(m.html).not.toContain("border-left");
    expect(m.html).toContain("/book");
    expect(m.text).toContain("Hello there");
  });

  it("status update shows progress in the applicant's language", async () => {
    const m = await applicationStatusEmail({
      ref: "UB-A-1",
      name: "Amina Uwase",
      subject: "Data Bootcamp",
      locale: "fr",
      status: "shortlisted",
    });
    expect(m.html).toContain("Vous êtes présélectionné·e");
    expect(m.html).toContain("✓");
    expect(m.text).toContain("Décision finale");
  });
});
