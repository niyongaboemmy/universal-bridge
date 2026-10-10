import "server-only";
import {
  Circle,
  Document,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import QRCode from "qrcode";
import {
  MARK_BLUE_PATH,
  MARK_NODES,
  MARK_VIEWBOX,
  MARK_WEDGE_PATH,
} from "@/components/brand/Monogram";
import type { Certificate } from "@/payload-types";
import { qrUrl } from "./lookup";

const BLUE = "#0145B8";
const ORANGE = "#FE760D";
const NAVY = "#0A1633";

const s = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", color: NAVY, position: "relative" },
  cornerA: {
    position: "absolute",
    top: -90,
    right: -90,
    width: 200,
    height: 200,
    backgroundColor: BLUE,
    transform: "rotate(45deg)",
  },
  cornerB: {
    position: "absolute",
    top: -40,
    right: 60,
    width: 60,
    height: 160,
    backgroundColor: ORANGE,
    transform: "rotate(45deg)",
  },
  cornerC: {
    position: "absolute",
    bottom: -90,
    left: -90,
    width: 180,
    height: 180,
    backgroundColor: BLUE,
    transform: "rotate(45deg)",
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: { fontSize: 18, fontFamily: "Helvetica-Bold", color: BLUE },
  title: {
    marginTop: 36,
    fontSize: 34,
    fontFamily: "Times-Bold",
    color: BLUE,
    textAlign: "center",
    letterSpacing: 2,
  },
  subtitle: { fontSize: 13, textAlign: "center", color: ORANGE, letterSpacing: 4, marginTop: 4 },
  certify: { marginTop: 24, fontSize: 12, textAlign: "center", letterSpacing: 2, color: "#4F5767" },
  name: {
    marginTop: 10,
    fontSize: 30,
    fontFamily: "Times-BoldItalic",
    textAlign: "center",
    color: NAVY,
  },
  rule: { marginTop: 6, marginHorizontal: 180, borderBottomWidth: 1, borderBottomColor: BLUE },
  body: { marginTop: 18, fontSize: 12, lineHeight: 1.6, textAlign: "center", marginHorizontal: 80 },
  footer: {
    position: "absolute",
    left: 48,
    right: 48,
    bottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  sign: { width: 200, borderTopWidth: 1, borderTopColor: NAVY, paddingTop: 6, fontSize: 10 },
  bold: { fontFamily: "Helvetica-Bold" },
  qrBox: { alignItems: "center", width: 140 },
  code: { marginTop: 4, fontSize: 8, fontFamily: "Courier" },
  verify: { fontSize: 7, color: "#4F5767", marginTop: 2, textAlign: "center" },
});

const fmt = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Africa/Kigali",
      }).format(new Date(iso))
    : "";

/** FR-CERT-04: print-ready certificate (A4 landscape) with a signed QR code. */
export async function certificatePdf(c: Certificate, baseUrl: string): Promise<Buffer> {
  const url = qrUrl(baseUrl, c.code!, c.signature!);
  const qr = await QRCode.toDataURL(url, {
    margin: 1,
    width: 360,
    color: { dark: BLUE, light: "#FFFFFF" },
    errorCorrectionLevel: "M",
  });
  const [vx, vy, vw, vh] = MARK_VIEWBOX.split(" ").map(Number) as [number, number, number, number];
  const kindTitle = c.kind === "internship" ? "OF INTERNSHIP" : "OF TRAINING";
  const doc = (
    <Document
      title={`Certificate ${c.code}`}
      author="Universal Bridge Ltd"
      subject={c.programTitle}
    >
      <Page size="A4" orientation="landscape" style={s.page}>
        <View style={s.cornerA} />
        <View style={s.cornerB} />
        <View style={s.cornerC} />
        <View style={s.header}>
          <Svg viewBox={`${vx} ${vy} ${vw} ${vh}`} style={{ width: 58, height: (58 * vh) / vw }}>
            <Path d={MARK_BLUE_PATH} fill={BLUE} />
            {MARK_NODES.map(([cx, cy, r]) => (
              <Circle key={cx} cx={cx} cy={cy} r={r} fill={BLUE} />
            ))}
            <Path d={MARK_WEDGE_PATH} fill={ORANGE} />
          </Svg>
          <Text style={s.brand}>
            Universal Bridge <Text style={{ color: ORANGE }}>Ltd</Text>
          </Text>
        </View>
        <Text style={s.title}>CERTIFICATE</Text>
        <Text style={s.subtitle}>{kindTitle}</Text>
        <Text style={s.certify}>THIS IS TO CERTIFY THAT</Text>
        <Text style={s.name}>{c.holderName}</Text>
        <View style={s.rule} />
        <Text style={s.body}>
          has successfully completed the {c.programTitle} at Universal Bridge Ltd
          {c.role ? ` as ${c.role}` : ""} from {fmt(c.startDate)} to {fmt(c.endDate)}.
        </Text>
        <View style={s.footer}>
          <View style={s.sign}>
            <Text style={s.bold}>{c.signatoryName}</Text>
            <Text>{c.signatoryTitle}</Text>
          </View>
          <View style={s.sign}>
            <Text style={s.bold}>{fmt(c.issuedAt)}</Text>
            <Text>Date of issue</Text>
          </View>
          <View style={s.qrBox}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt */}
            <Image src={qr} style={{ width: 92, height: 92 }} />
            <Text style={s.code}>{c.code}</Text>
            <Text style={s.verify}>
              Verify at {baseUrl.replace(/^https?:\/\//, "")}/academy/verify
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
  return renderToBuffer(doc);
}
