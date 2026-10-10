import { ImageResponse } from "next/og";
import { markSvg } from "@/lib/brand/mark-svg";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// SRS §4.4: apple-touch-icon 180 px.
export default function AppleIcon() {
  const src = `data:image/svg+xml;base64,${Buffer.from(markSvg({ background: "#FFFFFF" })).toString("base64")}`;
  // eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs <img>
  return new ImageResponse(<img src={src} width={180} height={180} alt="" />, size);
}
