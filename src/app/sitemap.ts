import type { MetadataRoute } from "next";
import type { CollectionSlug, Where } from "payload";
import { localizePath, routing } from "@/i18n/routing";
import { payload } from "@/lib/cms/payload";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

const LEGAL = ["privacy", "cookies", "terms", "accessibility", "academy-terms"];
const STATIC = [
  ...["/", "/services", "/solutions", "/work", "/products", "/contact", "/book"],
  ...["/academy", "/academy/programs", "/academy/internships", "/academy/apply"],
  ...["/company/about", "/company/leadership", "/company/careers", "/company/partners"],
  ...["/company/events", "/company/press", "/labs", "/insights"],
  ...LEGAL.map((s) => `/legal/${s}`),
];
const DYNAMIC: [CollectionSlug, string][] = [
  ["services", "/services"],
  ["industries", "/solutions"],
  ["case-studies", "/work"],
  ["products", "/products"],
  ["programs", "/academy/programs"],
  ["jobs", "/company/careers"],
  ["hubs", "/labs"],
  ["posts", "/insights"],
  ["events", "/company/events"],
];

/** SEO-03: every page in every locale, with hreflang alternates (SEO-02). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const p = await payload();
  const entries: { path: string; lastModified?: string }[] = STATIC.map((path) => ({ path }));
  for (const [collection, base] of DYNAMIC) {
    // Closed roles drop out of the sitemap (Google treats expired JobPostings as errors).
    const open: Where =
      collection === "jobs"
        ? { validThrough: { greater_than_equal: new Date().toISOString() } }
        : {};
    const res = await p.find({
      collection,
      where: {
        and: [{ _status: { equals: "published" } }, { "seo.noindex": { not_equals: true } }, open],
      },
      limit: 1000,
      depth: 0,
      pagination: false,
      select: { slug: true, updatedAt: true } as never,
    });
    for (const doc of res.docs as unknown as { slug: string; updatedAt: string }[]) {
      entries.push({ path: `${base}/${doc.slug}`, lastModified: doc.updatedAt });
    }
  }
  return entries.flatMap(({ path, lastModified }) =>
    routing.locales.map((locale) => ({
      url: siteUrl(localizePath(path, locale)),
      lastModified,
      alternates: {
        languages: Object.fromEntries([
          ...routing.locales.map((l) => [l, siteUrl(localizePath(path, l))]),
          ["x-default", siteUrl(path)],
        ]),
      },
    })),
  );
}
