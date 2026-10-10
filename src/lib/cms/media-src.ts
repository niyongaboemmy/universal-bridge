/**
 * Payload returns absolute media URLs (serverURL is set). next/image allows
 * our own files as relative paths only, so strip our origin. External (CDN/S3)
 * URLs are left as they are and must be listed in images.remotePatterns.
 */
export function mediaSrc(url: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (base && url.startsWith(base)) return url.slice(base.replace(/\/$/, "").length) || "/";
  try {
    const u = new URL(url);
    if (u.pathname.startsWith("/api/media/file/")) return u.pathname + u.search;
  } catch {
    // already relative
  }
  return url;
}
