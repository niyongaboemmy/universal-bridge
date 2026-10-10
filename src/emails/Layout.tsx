import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { CSSProperties, ReactNode } from "react";
import { localizePath, type Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/utils";
import { emailTranslator } from "./translator";

/**
 * The Universal Bridge email design system (INT-01). Every email (website,
 * office, password and invitations) is built from these pieces so they look
 * the same everywhere. Inline styles carry the design; the <style> block only
 * adds what clients that support it can do on top: hover states, dark mode and
 * the phone layout. Images are PNG (most clients don't render SVG).
 */
export const colors = {
  blue: "#0145B8",
  blueDark: "#01338A",
  navy: "#0A1633",
  orange: "#FE760D",
  muted: "#4F5767",
  line: "#E3E7EE",
  canvas: "#EEF1F6",
  soft: "#F5F7FB",
  blueSoft: "#EAF1FF",
  orangeSoft: "#FFF3E8",
  greenSoft: "#E8F6EF",
  green: "#0F7A50",
  amber: "#B45309",
};

// The website's fonts: Inter for text, Plus Jakarta Sans for headlines (web fonts
// load in Apple Mail, iOS and some others; the rest fall back to system sans).
const font = "Inter, 'Segoe UI', Helvetica, Arial, sans-serif";
const display = "'Plus Jakarta Sans', Inter, 'Segoe UI', Helvetica, Arial, sans-serif";

const css = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body { -webkit-text-size-adjust: 100%; }
  a { text-decoration: none; }
  .ub-btn { transition: background-color .15s ease, box-shadow .15s ease; }
  .ub-btn:hover { background-color: #E8650A !important; box-shadow: 0 10px 24px -10px rgba(254,118,13,.85) !important; }
  .ub-btn-alt:hover { background-color: ${colors.blueSoft} !important; }
  .ub-link:hover { text-decoration: underline !important; }
  .ub-foot a:hover { color: ${colors.orange} !important; }
  @media (max-width: 620px) {
    .ub-wrap { padding: 16px 10px !important; }
    .ub-hero { padding: 28px 22px 26px !important; }
    .ub-body { padding: 26px 22px 22px !important; }
    .ub-title { font-size: 23px !important; line-height: 30px !important; }
    .ub-btn, .ub-btn-alt { display: block !important; text-align: center !important; }
    .ub-kv-k, .ub-kv-v { display: block !important; width: 100% !important; }
    .ub-kv-k { padding-bottom: 0 !important; }
  }
  @media (prefers-color-scheme: dark) {
    html, body, .ub-canvas, .ub-canvas > table > tbody > tr > td { background-color: #070D1E !important; }
    .ub-rule { border-top-color: #24335A !important; }
    .ub-body p.ub-dot-num { background-color: #1E3A7A !important; color: #CFE0FF !important; }
    .ub-body p.ub-dot-todo { background-color: #24335A !important; color: #A3ADC2 !important; }
    .ub-body p.ub-dot-done, .ub-body p.ub-dot-now { color: #FFFFFF !important; }
    .ub-body { background-color: #0F1830 !important; border-color: #1E2A47 !important; }
    .ub-body p, .ub-body td, .ub-body li { color: #E6EAF2 !important; }
    .ub-body .ub-muted { color: #A3ADC2 !important; }
    .ub-panel { background-color: #16213F !important; border-color: #24335A !important; }
    .ub-btn-alt { background-color: transparent !important; color: #8FB4FF !important; border-color: #8FB4FF !important; }
    .ub-link { color: #8FB4FF !important; }
    .ub-foot p, .ub-foot a { color: #8D97AD !important; }
  }
`;

/** Shared text styles for the body of an email. */
export const emailText: CSSProperties = {
  fontSize: 15,
  lineHeight: "24px",
  color: colors.navy,
  margin: "0 0 16px",
};
export const emailMuted: CSSProperties = {
  fontSize: 13,
  lineHeight: "20px",
  color: colors.muted,
  margin: "0 0 6px",
};
export const emailHeading: CSSProperties = {
  fontSize: 13,
  lineHeight: "18px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: colors.muted,
  margin: "24px 0 10px",
};

export function EmailLayout({
  lang,
  preview,
  eyebrow,
  title,
  intro,
  footer,
  privacy,
  children,
}: {
  lang: string;
  preview: string;
  /** Small orange label above the title (e.g. "Account", "Application"). */
  eyebrow?: string;
  /** Headline in the blue header. Without one, the header shows only the logo. */
  title?: string;
  intro?: string;
  footer?: string;
  privacy?: string;
  children: ReactNode;
}) {
  const locale = (["en", "fr", "rw"].includes(lang) ? lang : "en") as Locale;
  const t = emailTranslator(locale);
  const links: [string, string][] = [
    [t("layout.website"), siteUrl(localizePath("/", locale))],
    [t("layout.services"), siteUrl(localizePath("/services", locale))],
    [t("layout.academy"), siteUrl(localizePath("/academy", locale))],
    [t("layout.contact"), siteUrl(localizePath("/contact", locale))],
  ];
  return (
    <Html lang={lang} dir="ltr">
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- an email, not a page */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <style>{css}</style>
      </Head>
      <Preview>{preview}</Preview>
      <Body
        className="ub-canvas"
        style={{ backgroundColor: colors.canvas, fontFamily: font, margin: 0, padding: 0 }}
      >
        <Container
          className="ub-wrap"
          style={{ maxWidth: 600, margin: "0 auto", padding: "32px 16px" }}
        >
          {/* Header: navy→blue, with a plain colour for clients that drop gradients. */}
          <Section
            className="ub-hero"
            bgcolor={colors.navy}
            style={{
              backgroundColor: colors.navy,
              backgroundImage: `linear-gradient(135deg, ${colors.navy} 0%, #0B2C78 55%, ${colors.blue} 100%)`,
              borderRadius: "20px 20px 0 0",
              padding: title ? "30px 36px 32px" : "24px 36px",
            }}
          >
            <Row>
              <Column style={{ width: 44, verticalAlign: "middle" }}>
                <Link href={siteUrl(localizePath("/", locale))}>
                  <Img
                    src={siteUrl("/brand/ub-mark-white-email.png")}
                    width="41"
                    height="24"
                    alt="Universal Bridge"
                    style={{ display: "block", border: 0 }}
                  />
                </Link>
              </Column>
              <Column style={{ verticalAlign: "middle" }}>
                <Text
                  style={{
                    margin: 0,
                    fontFamily: display,
                    fontSize: 16,
                    lineHeight: "20px",
                    fontWeight: 700,
                    color: "#FFFFFF",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Universal Bridge <span style={{ color: colors.orange }}>Ltd</span>
                </Text>
              </Column>
            </Row>
            {title && (
              <>
                {eyebrow && (
                  <Text
                    style={{
                      margin: "30px 0 0",
                      fontSize: 12,
                      lineHeight: "16px",
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: colors.orange,
                    }}
                  >
                    {eyebrow}
                  </Text>
                )}
                <Text
                  className="ub-title"
                  style={{
                    margin: eyebrow ? "8px 0 0" : "30px 0 0",
                    fontFamily: display,
                    fontSize: 27,
                    lineHeight: "34px",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#FFFFFF",
                  }}
                >
                  {title}
                </Text>
                {intro && (
                  <Text
                    style={{
                      margin: "10px 0 0",
                      fontSize: 15,
                      lineHeight: "23px",
                      color: "#C9D6F2",
                    }}
                  >
                    {intro}
                  </Text>
                )}
              </>
            )}
          </Section>
          {/* Brand rule: blue into orange, like the bridge on the website. */}
          <Section
            bgcolor={colors.orange}
            style={{
              height: 4,
              lineHeight: "4px",
              fontSize: 0,
              backgroundColor: colors.orange,
              backgroundImage: `linear-gradient(90deg, ${colors.blue} 0%, #6B9CFF 45%, ${colors.orange} 100%)`,
            }}
          >
            &nbsp;
          </Section>
          <Section
            className="ub-body"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "0 0 20px 20px",
              border: `1px solid ${colors.line}`,
              borderTop: 0,
              padding: "32px 36px 28px",
            }}
          >
            {children}
          </Section>

          <Section className="ub-foot" style={{ padding: "26px 12px 0", textAlign: "center" }}>
            <Text style={{ margin: "0 0 12px", fontSize: 13, lineHeight: "20px" }}>
              {links.map(([label, href], i) => (
                <span key={href}>
                  {i > 0 && <span style={{ color: "#B5BCCB" }}>&nbsp;&nbsp;·&nbsp;&nbsp;</span>}
                  <Link href={href} style={{ color: colors.blue, fontWeight: 600 }}>
                    {label}
                  </Link>
                </span>
              ))}
            </Text>
            <Text style={{ fontSize: 12, lineHeight: "18px", color: colors.muted, margin: 0 }}>
              {footer ?? t("footer")}
            </Text>
            {privacy && (
              <Text
                style={{ fontSize: 12, lineHeight: "18px", color: colors.muted, margin: "8px 0 0" }}
              >
                {privacy}
              </Text>
            )}
            <Text
              style={{ fontSize: 11, lineHeight: "16px", color: "#8A93A6", margin: "14px 0 0" }}
            >
              © {new Date().getFullYear()} Universal Bridge Ltd · Kigali, Rwanda
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/** Call to action. Primary is orange (the brand's "go" colour); secondary is a blue outline. */
export function EmailButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const primary = variant === "primary";
  return (
    <Button
      href={href}
      className={primary ? "ub-btn" : "ub-btn-alt"}
      style={{
        backgroundColor: primary ? colors.orange : "#FFFFFF",
        color: primary ? "#FFFFFF" : colors.blue,
        border: primary ? `1px solid ${colors.orange}` : `1.5px solid ${colors.blue}`,
        borderRadius: 12,
        padding: "14px 26px",
        fontSize: 15,
        lineHeight: "20px",
        fontWeight: 700,
        textDecoration: "none",
        display: "inline-block",
        boxShadow: primary ? "0 8px 20px -10px rgba(254,118,13,.7)" : undefined,
      }}
    >
      {children}
    </Button>
  );
}

/** Buttons in a row (stacked full-width on phones). */
export function EmailActions({ children }: { children: ReactNode }) {
  return <Section style={{ margin: "8px 0 24px" }}>{children}</Section>;
}

/** The raw link under a button, for clients that block buttons. */
export function LinkFallback({ href, label }: { href: string; label: string }) {
  return (
    <Text className="ub-muted" style={{ ...emailMuted, fontSize: 12, lineHeight: "18px" }}>
      {label}
      <br />
      <Link
        href={href}
        className="ub-link"
        style={{ color: colors.blue, wordBreak: "break-all", fontSize: 12 }}
      >
        {href}
      </Link>
    </Text>
  );
}

const PANEL: Record<"neutral" | "info" | "warn" | "success", [string, string, string]> = {
  neutral: [colors.soft, colors.line, colors.navy],
  info: [colors.blueSoft, "#CFDDFB", colors.navy],
  warn: [colors.orangeSoft, "#FFD8B5", "#7A3606"],
  success: [colors.greenSoft, "#BFE5D2", "#0B5137"],
};

/** A soft, rounded box for quotes, notices and summaries. */
export function Panel({
  children,
  tone = "neutral",
  title,
}: {
  children: ReactNode;
  tone?: keyof typeof PANEL;
  title?: string;
}) {
  const [bg, border, fg] = PANEL[tone];
  return (
    <Section
      className="ub-panel"
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: "16px 18px",
        margin: "0 0 20px",
      }}
    >
      {title && (
        <Text style={{ ...emailMuted, fontWeight: 700, color: fg, margin: "0 0 6px" }}>
          {title}
        </Text>
      )}
      <Text
        style={{ fontSize: 14, lineHeight: "22px", color: fg, margin: 0, whiteSpace: "pre-wrap" }}
      >
        {children}
      </Text>
    </Section>
  );
}

/** Label / value rows (request details, account details). Empty values are skipped. */
export function Details({ rows }: { rows: [string, ReactNode | null | undefined][] }) {
  const shown = rows.filter(([, v]) => v !== null && v !== undefined && v !== "");
  return (
    <Section
      className="ub-panel"
      style={{
        backgroundColor: colors.soft,
        border: `1px solid ${colors.line}`,
        borderRadius: 14,
        padding: "6px 18px",
        margin: "0 0 22px",
      }}
    >
      {shown.map(([k, v], i) => (
        <Row
          key={k}
          className={i ? "ub-rule" : undefined}
          style={{ borderTop: i ? `1px solid ${colors.line}` : undefined }}
        >
          <Column
            className="ub-kv-k ub-muted"
            style={{
              width: "38%",
              padding: "10px 12px 10px 0",
              fontSize: 13,
              lineHeight: "20px",
              color: colors.muted,
              verticalAlign: "top",
            }}
          >
            {k}
            {/* Shows only in the plain-text version ("Label: value"). */}
            <span style={{ display: "none", fontSize: 0 }}>: </span>
          </Column>
          <Column
            className="ub-kv-v"
            style={{
              padding: "10px 0",
              fontSize: 14,
              lineHeight: "20px",
              color: colors.navy,
              fontWeight: 600,
              verticalAlign: "top",
              wordBreak: "break-word",
            }}
          >
            {v}
          </Column>
        </Row>
      ))}
    </Section>
  );
}

/**
 * Numbered steps. With `current`, the steps before it show as done (green
 * tick), the current one in orange and later ones grey — a progress tracker.
 */
export function Steps({ items, current }: { items: string[]; current?: number }) {
  return (
    <Section style={{ margin: "0 0 22px" }}>
      {items.map((label, i) => {
        const state =
          current === undefined ? "todo" : i < current ? "done" : i === current ? "now" : "todo";
        const [bg, fg] =
          state === "done"
            ? [colors.green, "#FFFFFF"]
            : state === "now"
              ? [colors.orange, "#FFFFFF"]
              : current === undefined
                ? [colors.blueSoft, colors.blue]
                : ["#E9ECF2", "#7A8396"];
        return (
          <Row key={label} style={{ marginBottom: 10 }}>
            <Column style={{ width: 38, verticalAlign: "top" }}>
              <Text
                className={`ub-dot ub-dot-${state === "todo" && current === undefined ? "num" : state}`}
                style={{
                  margin: 0,
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: bg,
                  color: fg,
                  fontSize: 13,
                  lineHeight: "26px",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                {state === "done" ? "✓" : i + 1}
              </Text>
            </Column>
            <Column style={{ verticalAlign: "top" }}>
              <Text
                className={state === "todo" && current !== undefined ? "ub-muted" : undefined}
                style={{
                  margin: 0,
                  padding: "3px 0 0",
                  fontSize: 14,
                  lineHeight: "21px",
                  color: state === "todo" && current !== undefined ? colors.muted : colors.navy,
                  fontWeight: state === "now" ? 700 : 400,
                }}
              >
                {label}
              </Text>
            </Column>
          </Row>
        );
      })}
    </Section>
  );
}

/** Small print with a lock, for security notes ("didn't ask for this?"). */
export function SecurityNote({ children }: { children: ReactNode }) {
  return (
    <Section
      className="ub-rule"
      style={{ borderTop: `1px solid ${colors.line}`, margin: "22px 0 0", padding: "16px 0 0" }}
    >
      <Row>
        <Column style={{ width: 28, verticalAlign: "top" }}>
          <Text style={{ margin: 0, fontSize: 15, lineHeight: "20px" }}>🔒</Text>
        </Column>
        <Column style={{ verticalAlign: "top" }}>
          <Text
            className="ub-muted"
            style={{ ...emailMuted, margin: 0, fontSize: 12, lineHeight: "19px" }}
          >
            {children}
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

/** Sign-off with the reference number. */
export function SignOff({ text, reference }: { text: string; reference?: string }) {
  return (
    <>
      <Text style={{ ...emailText, margin: "24px 0 4px" }}>{text}</Text>
      {reference && (
        <Text className="ub-muted" style={{ ...emailMuted, margin: 0 }}>
          {reference}
        </Text>
      )}
    </>
  );
}
