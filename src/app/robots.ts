import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/utils";

// SEO-03/09: staging (NOINDEX=1) blocks everything; production blocks admin/API only.
export default function robots(): MetadataRoute.Robots {
  if (process.env.NOINDEX === "1") return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
