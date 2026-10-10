import { payload } from "@/lib/cms/payload";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

/**
 * SEO-07 / IX-09: a plain-language summary of the site for AI answer engines
 * (llmstxt.org format), built from the CMS so it never goes stale.
 */
export async function GET() {
  const p = await payload();
  const published = { _status: { equals: "published" } } as const;
  const [settings, services, programs, products, industries] = await Promise.all([
    p.findGlobal({ slug: "site-settings", locale: "en" }),
    p.find({
      collection: "services",
      where: published,
      sort: "order",
      limit: 50,
      depth: 0,
      locale: "en",
    }),
    p.find({
      collection: "programs",
      where: published,
      sort: "order",
      limit: 50,
      depth: 0,
      locale: "en",
    }),
    p.find({
      collection: "products",
      where: published,
      sort: "order",
      limit: 50,
      depth: 0,
      locale: "en",
    }),
    p.find({
      collection: "industries",
      where: published,
      sort: "order",
      limit: 50,
      depth: 0,
      locale: "en",
    }),
  ]);
  const line = (title: string, path: string, desc?: string | null) =>
    `- [${title}](${siteUrl(path)})${desc ? `: ${desc}` : ""}`;
  const body = `# Universal Bridge Ltd

> Software and technology company founded in ${settings.foundingYear ?? 2019} in Kigali, Rwanda. Builds custom software, web and mobile apps, AI/data and IoT solutions for companies, public institutions and NGOs, and trains engineers through UB Academy. Works in English, French and Kinyarwanda; Kigali is UTC+2 all year.

Contact: ${settings.email} · ${settings.address?.building ?? ""}, ${settings.address?.street ?? ""}, Kigali, Rwanda · ${siteUrl("/contact")}

## Services
${services.docs.map((s) => line(s.title, `/services/${s.slug}`, s.summary)).join("\n")}

## Industries
${industries.docs.map((s) => line(s.title, `/solutions/${s.slug}`, s.summary)).join("\n")}

## Products
${products.docs.map((s) => line(s.name, `/products/${s.slug}`, s.tagline)).join("\n")}

## UB Academy
${programs.docs.map((s) => line(s.title, `/academy/programs/${s.slug}`, s.summary)).join("\n")}
${line("Internships", "/academy/internships")}
${line("Verify a certificate", "/academy/verify", "Check a UB certificate by code or QR")}

## Optional
${line("Case studies", "/work")}
${line("Insights", "/insights")}
${line("Careers", "/company/careers")}
${line("Privacy policy", "/legal/privacy")}
`;
  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
