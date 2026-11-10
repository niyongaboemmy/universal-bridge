import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RenderBlocks } from "@/blocks/RenderBlocks";
import { stripAccents } from "@/components/ui/AccentText";
import type { Locale } from "@/i18n/routing";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Media } from "@/payload-types";
import { docRef } from "@/lib/live-edit/session";
import { getPage } from "./content";

/** Metadata for a block-built CMS page (CMS-10 overrides first). */
export async function cmsPageMetadata(
  slug: string,
  locale: Locale,
  path: string,
): Promise<Metadata> {
  const page = await getPage(slug, locale);
  if (!page) return {};
  const hero = page.layout?.find((b) => b.blockType === "hero");
  const lead = hero && "lead" in hero ? hero.lead : undefined;
  return pageMetadata({
    locale,
    path,
    title: page.seo?.title || stripAccents(page.title),
    description: page.seo?.description || lead,
    image:
      page.seo?.image && typeof page.seo.image === "object"
        ? (page.seo.image as Media).url
        : undefined,
    noindex: page.seo?.noindex ?? false,
  });
}

/** Render a CMS page's blocks, 404 if it doesn't exist or isn't published. */
export async function CmsPage({
  slug,
  locale,
  children,
}: {
  slug: string;
  locale: Locale;
  children?: React.ReactNode;
}) {
  const page = await getPage(slug, locale);
  if (!page) notFound();
  const edit = await docRef("pages", page, locale);
  return (
    <>
      <RenderBlocks blocks={page.layout} locale={locale} edit={edit} />
      {children}
    </>
  );
}
