import { siteUrl } from "@/lib/utils";

/** SEO-05: dynamic brand OG image URL for any page. */
export function ogImageUrl({ title, eyebrow }: { title: string; eyebrow?: string | null }) {
  const params = new URLSearchParams({ title: title.replace(/\*/g, "").slice(0, 110) });
  if (eyebrow) params.set("eyebrow", eyebrow.slice(0, 40));
  return siteUrl(`/api/og?${params}`);
}
