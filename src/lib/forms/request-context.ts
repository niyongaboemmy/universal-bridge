import "server-only";
import { headers } from "next/headers";

/**
 * Client IP for rate limiting. On Vercel `x-real-ip` / `x-forwarded-for` are set
 * by the platform and can't be spoofed. If self-hosting, the reverse proxy MUST
 * overwrite these headers.
 */
export async function requestContext() {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return { ip, referrer: h.get("referer"), userAgent: h.get("user-agent") };
}
