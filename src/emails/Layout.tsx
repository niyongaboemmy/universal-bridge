import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { siteUrl } from "@/lib/utils";
import type { ReactNode } from "react";

// Daylight brand email (INT-01). Inline styles only — email clients ignore CSS files.
const colors = {
  blue: "#0145B8",
  navy: "#0A1633",
  orange: "#FE760D",
  muted: "#4F5767",
  canvas: "#F7F8FA",
};

export function EmailLayout({
  lang,
  preview,
  footer,
  privacy,
  children,
}: {
  lang: string;
  preview: string;
  footer: string;
  privacy?: string;
  children: ReactNode;
}) {
  return (
    <Html lang={lang}>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: colors.canvas,
          fontFamily: "Inter, Segoe UI, Helvetica, Arial, sans-serif",
          margin: 0,
        }}
      >
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px" }}>
          <Section style={{ paddingBottom: 20 }}>
            {/* PNG, not SVG: most email clients don't render SVG. */}
            <Img
              src={siteUrl("/brand/ub-mark-email.png")}
              width="48"
              height="48"
              alt=""
              style={{ display: "inline-block", verticalAlign: "middle" }}
            />
            <Text
              style={{
                display: "inline-block",
                verticalAlign: "middle",
                margin: "0 0 0 12px",
                fontSize: 18,
                fontWeight: 700,
                color: colors.blue,
              }}
            >
              Universal Bridge <span style={{ color: colors.orange }}>Ltd</span>
            </Text>
          </Section>
          <Section
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: "28px 28px 20px",
              border: "1px solid #DDE1E8",
            }}
          >
            {children}
          </Section>
          <Hr style={{ borderColor: "#DDE1E8", margin: "24px 0 12px" }} />
          <Text style={{ fontSize: 12, color: colors.muted, margin: 0 }}>{footer}</Text>
          {privacy && (
            <Text style={{ fontSize: 12, color: colors.muted, margin: "8px 0 0" }}>{privacy}</Text>
          )}
        </Container>
      </Body>
    </Html>
  );
}

export const emailText = {
  fontSize: 15,
  lineHeight: "24px",
  color: colors.navy,
  margin: "0 0 14px",
};
export const emailMuted = {
  fontSize: 13,
  lineHeight: "20px",
  color: colors.muted,
  margin: "0 0 6px",
};
export const emailButton = {
  backgroundColor: colors.blue,
  color: "#ffffff",
  borderRadius: 12,
  padding: "12px 20px",
  fontWeight: 600,
  fontSize: 15,
  textDecoration: "none",
  display: "inline-block",
};
