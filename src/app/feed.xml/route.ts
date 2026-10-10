import { payload } from "@/lib/cms/payload";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// FR-BLOG-03: RSS 2.0 feed of the latest English posts.
export async function GET() {
  const res = await (
    await payload()
  ).find({
    collection: "posts",
    where: { _status: { equals: "published" } },
    sort: "-publishedAt",
    limit: 30,
    depth: 0,
    locale: "en",
  });
  const items = res.docs
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${siteUrl(`/insights/${p.slug}`)}</link>
      <guid isPermaLink="true">${siteUrl(`/insights/${p.slug}`)}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${esc(p.excerpt)}</description>
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Universal Bridge — Insights</title>
    <link>${siteUrl("/insights")}</link>
    <description>Notes from Universal Bridge engineers, designers and teachers.</description>
    <language>en</language>
    <atom:link href="${siteUrl("/feed.xml")}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
