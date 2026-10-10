import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { markSvg } from "@/lib/brand/mark-svg";

const mark = `data:image/svg+xml;base64,${Buffer.from(markSvg({ ink: "#FFFFFF" })).toString("base64")}`;

/**
 * SEO-05: brand Open Graph image for any page — Night background, the
 * monogram, the page title and a circuit trace. 1200×630, cached by URL.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = (searchParams.get("title") ?? "Universal Bridge Ltd").slice(0, 110);
  const eyebrow = (searchParams.get("eyebrow") ?? "Built in Kigali · Delivering worldwide").slice(
    0,
    40,
  );
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "linear-gradient(135deg, #0036A3 0%, #0A1633 60%, #060D20 100%)",
        color: "#F7F8FA",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs <img> */}
        <img src={mark} width={132} height={80} alt="" />
        <div style={{ width: 3, height: 56, background: "#FF7A00", borderRadius: 2 }} />
        <div style={{ fontSize: 38, fontWeight: 800, display: "flex" }}>
          Universal Bridge&nbsp;<span style={{ color: "#FF7A00" }}>Ltd</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{ fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: "#FFA257" }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: title.length > 60 ? 58 : 72,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.6 }}>
        <div style={{ width: 360, height: 2, background: "#7FA3FA" }} />
        <div style={{ width: 18, height: 18, borderRadius: 9, border: "3px solid #7FA3FA" }} />
        <div style={{ fontSize: 22, marginLeft: 12 }}>universalbridge.rw</div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { "cache-control": "public, max-age=31536000, immutable" },
    },
  );
}
