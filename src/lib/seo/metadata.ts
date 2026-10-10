import type { Metadata } from "next";
import { localizePath, routing, type Locale } from "@/i18n/routing";
import { siteUrl } from "@/lib/utils";
import { ogImageUrl } from "./og";

/**
 * SEO-01/02: title (template adds "· Universal Bridge Ltd"), description ≤ 155,
 * canonical, hreflang alternates for every locale + x-default, OG/Twitter.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  noindex,
  type = "website",
}: {
  locale: Locale;
  path: string;
  title: string;
  description?: string | null;
  image?: string | null;
  noindex?: boolean;
  type?: "website" | "article";
}): Metadata {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((l) => [l, siteUrl(localizePath(path, l))]),
  );
  languages["x-default"] = siteUrl(localizePath(path, routing.defaultLocale));
  image ??= ogImageUrl({ title });
  const desc = description
    ? description.length > 155
      ? `${description.slice(0, 152).trimEnd()}…`
      : description
    : undefined;
  return {
    title,
    description: desc,
    alternates: { canonical: siteUrl(localizePath(path, locale)), languages },
    openGraph: {
      title,
      description: desc,
      url: siteUrl(localizePath(path, locale)),
      type,
      ...(image ? { images: [image] } : {}),
    },
    twitter: { title, description: desc, ...(image ? { images: [image] } : {}) },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
