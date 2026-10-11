import { TIMEZONE_COUNTRY } from "./timezones";

/**
 * Country of a visitor without storing or looking up their IP: a CDN country header
 * when the host provides one (Vercel, Cloudflare), else the browser's time zone
 * ("Africa/Kigali" → RW). Empty when neither is known.
 */
export function visitorCountry(headers: Headers, timeZone: unknown): string {
  const header = headers.get("x-vercel-ip-country") ?? headers.get("cf-ipcountry") ?? "";
  const fromHeader = header.trim().toUpperCase();
  // "XX" / "T1" are Cloudflare's unknown / Tor markers.
  if (/^[A-Z]{2}$/.test(fromHeader) && fromHeader !== "XX" && fromHeader !== "T1")
    return fromHeader;
  if (typeof timeZone !== "string" || timeZone.length > 64) return "";
  return TIMEZONE_COUNTRY[timeZone] ?? "";
}

/** The hosts that are this site (behind cPanel's proxy the request host is localhost). */
export function ownHosts(headers: Headers, requestHost: string): Set<string> {
  const hosts = new Set<string>();
  const add = (h: string | null | undefined) => {
    const host = h?.split(",")[0]?.trim().toLowerCase().replace(/:\d+$/, "");
    if (host) hosts.add(host.replace(/^www\./, ""));
  };
  add(requestHost);
  add(headers.get("x-forwarded-host"));
  add(headers.get("host"));
  try {
    add(new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").host);
  } catch {
    // not set
  }
  return hosts;
}

/** Referrer host, or "" for direct visits and moves within this site. */
export function externalReferrer(raw: unknown, own: Set<string>): string {
  if (typeof raw !== "string" || !raw) return "";
  try {
    const host = new URL(raw.slice(0, 500)).hostname.toLowerCase().replace(/^www\./, "");
    return own.has(host) ? "" : host;
  } catch {
    return "";
  }
}

export type Audience = "visitor" | "member" | "staff";

/**
 * Who is browsing, from the sign-in cookie's token: staff ("users"), a website
 * member ("members") or an anonymous visitor. Only a label for the statistics (the
 * token isn't verified here and grants nothing): a forged cookie can at most
 * mislabel the sender's own visits.
 */
export function audienceFromToken(token: string | undefined): Audience {
  if (!token) return "visitor";
  try {
    const part = token.split(".")[1] ?? "";
    const json = JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as {
      collection?: string;
    };
    if (json.collection === "users") return "staff";
    if (json.collection === "members") return "member";
  } catch {
    // not a JWT
  }
  return "visitor";
}
