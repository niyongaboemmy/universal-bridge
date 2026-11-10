import type { Locale } from "@/i18n/routing";
import { child, type EditRef } from "@/lib/live-edit/attrs";
import { AcademyTeaserBlock } from "./AcademyTeaser";
import { HeroBlock } from "./Hero";
import { LabsBlock } from "./Labs";
import { GlobalReachBlock, StatsBandBlock } from "./Islands";
import * as S from "./Sections";
import type { AnyBlock } from "./types";

/** CMS-04: renders a page's blocks in order. Unknown block types render nothing. */
export function RenderBlocks({
  blocks,
  locale,
  edit,
}: {
  blocks?: AnyBlock[] | null;
  locale: Locale;
  edit?: EditRef;
}) {
  return (
    <>
      {(blocks ?? []).map((block, i) => {
        const key = block.id ?? `${block.blockType}-${i}`;
        const first = i === 0;
        // Live editing: each block knows its place in the page (layout.<blockId>).
        const e = child(edit, "layout", block.id);
        switch (block.blockType) {
          case "hero":
            return <HeroBlock key={key} block={block} locale={locale} edit={e} first={first} />;
          case "logoCloud":
            return <S.LogoCloudBlock key={key} block={block} locale={locale} edit={e} />;
          case "servicesGrid":
            return <S.ServicesGridBlock key={key} block={block} locale={locale} edit={e} />;
          case "industriesGrid":
            return <S.IndustriesGridBlock key={key} block={block} locale={locale} edit={e} />;
          case "statsBand":
            return <StatsBandBlock key={key} block={block} locale={locale} edit={e} />;
          case "featuredWork":
            return <S.FeaturedWorkBlock key={key} block={block} locale={locale} edit={e} />;
          case "productsShowcase":
            return <S.ProductsShowcaseBlock key={key} block={block} locale={locale} edit={e} />;
          case "latestPosts":
            return <S.LatestPostsBlock key={key} block={block} locale={locale} edit={e} />;
          case "testimonials":
            return <S.TestimonialsBlock key={key} block={block} locale={locale} edit={e} />;
          case "process":
            return <S.ProcessBlock key={key} block={block} locale={locale} edit={e} />;
          case "labs":
            return <LabsBlock key={key} block={block} locale={locale} edit={e} />;
          case "story":
            return <S.StoryBlock key={key} block={block} locale={locale} edit={e} />;
          case "academyTeaser":
            return <AcademyTeaserBlock key={key} block={block} locale={locale} edit={e} />;
          case "globalReach":
            return <GlobalReachBlock key={key} block={block} locale={locale} edit={e} />;
          case "ctaBand":
            return <S.CtaBandBlock key={key} block={block} locale={locale} edit={e} />;
          case "cardsGrid":
            return <S.CardsGridBlock key={key} block={block} locale={locale} edit={e} />;
          case "mediaText":
            return <S.MediaTextBlock key={key} block={block} locale={locale} edit={e} />;
          case "timeline":
            return <S.TimelineBlock key={key} block={block} locale={locale} edit={e} />;
          case "faq":
            return <S.FaqBlock key={key} block={block} locale={locale} edit={e} />;
          case "richText":
            return <S.RichTextBlock key={key} block={block} locale={locale} edit={e} />;
          default:
            return null;
        }
      })}
    </>
  );
}
