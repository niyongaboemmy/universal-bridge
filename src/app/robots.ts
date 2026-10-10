import type { MetadataRoute } from "next";
import { getPublicSystem } from "@/lib/cms/system";
import { siteUrl } from "@/lib/utils";

// SEO-03/09: staging (NOINDEX=1) blocks everything; production blocks admin/API only.
export default async function robots(): Promise<MetadataRoute.Robots> {
  if ((await getPublicSystem()).noindex) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
