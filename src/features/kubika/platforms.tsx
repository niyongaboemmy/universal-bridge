import { cn } from "@/lib/utils";

export const KUBIKA_URL = "https://kubika.universalbridge.rw";

export const PLATFORMS = ["youtube", "tiktok", "instagram", "x", "facebook", "linkedin"] as const;
export type PlatformKey = (typeof PLATFORMS)[number];

export const PLATFORM_NAME: Record<PlatformKey, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  x: "X",
  facebook: "Facebook",
  linkedin: "LinkedIn",
};

/** Hosts per platform, as in Kubika's packages/platforms.json. */
const HOSTS: Record<PlatformKey, string[]> = {
  youtube: ["youtube.com", "youtu.be", "youtube-nocookie.com"],
  tiktok: ["tiktok.com"],
  instagram: ["instagram.com"],
  x: ["x.com", "twitter.com"],
  facebook: ["facebook.com", "fb.watch"],
  linkedin: ["linkedin.com"],
};

/** Which platform a pasted link belongs to, from its host; Kubika checks the rest. */
export function platformOf(link: string): PlatformKey | null {
  let host: string;
  try {
    host = new URL(/^https?:\/\//i.test(link.trim()) ? link.trim() : `https://${link.trim()}`)
      .hostname;
  } catch {
    return null;
  }
  host = host.toLowerCase();
  return PLATFORMS.find((p) => HOSTS[p].some((h) => host === h || host.endsWith(`.${h}`))) ?? null;
}

/** Kubika's platform colours (apps/web/src/ui/base.css), for always-light surfaces. */
export const PLATFORM_COLOR: Record<PlatformKey, string> = {
  youtube: "#e02424",
  tiktok: "#0b1220",
  instagram: "#c13584",
  x: "#0b1220",
  facebook: "#1877f2",
  linkedin: "#0a66c2",
};

/** The same as text classes; the ink ones follow the site theme. */
export const PLATFORM_TINT: Record<PlatformKey, string> = {
  youtube: "text-[#e02424]",
  tiktok: "text-[#0b1220] dark:text-white",
  instagram: "text-[#c13584] dark:text-[#e879b9]",
  x: "text-[#0b1220] dark:text-white",
  facebook: "text-[#1877f2]",
  linkedin: "text-[#0a66c2]",
};

/**
 * Kubika's platform glyphs (apps/web/src/ui/components.tsx): simple shapes in
 * currentColor, never the official logos (Kubika SRS §7.5).
 */
export function PlatformGlyph({
  platform,
  className,
}: {
  platform: PlatformKey;
  className?: string;
}) {
  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    className: cn("shrink-0", className),
  };
  switch (platform) {
    case "youtube":
      return (
        <svg {...common}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" fill="currentColor" />
          <path d="M10 9v6l5-3Z" fill="#fff" />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M13.5 3.5v11a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M13.5 3.5c.4 2.3 2 3.8 4.5 4" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="3.8" />
          <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "x":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M5 4.5 19 19.5M19 4.5 5 19.5" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path
            fill="currentColor"
            d="M13.6 21v-7.3h2.5l.4-2.9h-2.9V9c0-.8.3-1.4 1.5-1.4h1.5V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.6 1.3-3.6 3.7v2.1H8.3v2.9h2.5V21Z"
          />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...common}>
          <circle cx="6.5" cy="6.6" r="1.8" fill="currentColor" />
          <path
            fill="currentColor"
            d="M5 9.6h3v9.4H5Zm5 0h2.9v1.3c.5-.8 1.5-1.5 3-1.5 2.4 0 3.6 1.5 3.6 4.2V19h-3v-4.8c0-1.3-.5-2-1.6-2s-1.9.8-1.9 2.1V19h-3Z"
          />
        </svg>
      );
  }
}
