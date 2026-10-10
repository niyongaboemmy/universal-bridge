import { ImageResponse } from "next/og";
import { markSvg } from "@/lib/brand/mark-svg";

// SRS §4.4: PWA icons 192/512 + maskable (safe zone on a brand-blue fill).
export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }, { size: "maskable-512" }];
}

export async function GET(_req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const maskable = size.startsWith("maskable");
  const px = Number(size.replace("maskable-", "")) || 512;
  const svg = maskable ? markSvg({ ink: "#FFFFFF" }) : markSvg({ background: "#FFFFFF" });
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: maskable ? "#0B47C1" : "transparent",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs <img> */}
      <img src={src} width={maskable ? px * 0.6 : px} height={maskable ? px * 0.36 : px} alt="" />
    </div>,
    { width: px, height: px },
  );
}
