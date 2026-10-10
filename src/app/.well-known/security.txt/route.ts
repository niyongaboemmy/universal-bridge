import { siteUrl } from "@/lib/utils";

// NFR-SEC-11 (RFC 9116).
export function GET() {
  const expires = new Date(Date.now() + 365 * 86_400_000).toISOString();
  const body = [
    `Contact: mailto:security@universalbridge.rw`,
    `Expires: ${expires}`,
    `Preferred-Languages: en, fr, rw`,
    `Canonical: ${siteUrl("/.well-known/security.txt")}`,
    `Policy: ${siteUrl("/legal/privacy")}`,
  ].join("\n");
  return new Response(`${body}\n`, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
