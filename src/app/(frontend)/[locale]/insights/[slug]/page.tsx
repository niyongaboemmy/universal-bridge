import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PostCard } from "@/components/cards/PostCard";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Media } from "@/components/ui/Media";
import { RichText } from "@/components/ui/RichText";
import { dateFmt } from "@/features/academy/format";
import { tagSlug } from "@/features/insights/Listing";
import { ShareLinks } from "@/features/insights/ShareLinks";
import { localizePath, routing, type Locale } from "@/i18n/routing";
import { getPost, getPosts, publishedSlugs } from "@/lib/cms/content";
import { payload } from "@/lib/cms/payload";
import { readingMinutes, tableOfContents } from "@/lib/richtext";
import { JsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteUrl } from "@/lib/utils";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateStaticParams() {
  const slugs = await publishedSlugs("posts");
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await getPost(slug, locale);
  if (!p) return {};
  return pageMetadata({
    locale,
    path: `/insights/${slug}`,
    title: p.seo?.title || p.title,
    description: p.seo?.description || p.excerpt,
    type: "article",
  });
}

/** FR-BLOG-04: was this field actually translated, or is it the English fallback? */
async function isTranslated(id: number, locale: Locale) {
  if (locale === "en") return true;
  const doc = await (
    await payload()
  ).findByID({
    collection: "posts",
    id,
    locale,
    fallbackLocale: false as never,
    depth: 0,
    select: { title: true } as never,
  });
  return Boolean((doc as { title?: string }).title);
}

// FR-BLOG-02: reading layout, ToC, progress trace, share, related; Article JSON-LD.
export default async function PostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [p, all, t, c] = await Promise.all([
    getPost(slug, locale),
    getPosts(locale),
    getTranslations({ locale, namespace: "s5.insights" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  if (!p) notFound();
  const toc = tableOfContents(p.body);
  const author = typeof p.author === "object" ? p.author : null;
  const catIds = new Set((p.categories ?? []).map((x) => (typeof x === "object" ? x.id : x)));
  const related = all
    .filter(
      (x) =>
        x.id !== p.id && x.categories?.some((y) => catIds.has(typeof y === "object" ? y.id : y)),
    )
    .slice(0, 3);
  const translated = await isTranslated(p.id, locale);
  const url = siteUrl(localizePath(`/insights/${slug}`, locale));

  return (
    <article>
      {/* Reading progress trace (UI/UX §10.7): CSS scroll timeline, no JS. */}
      <div aria-hidden data-no-print className="reading-trace" />
      <header className="section pt-8 pb-10">
        <div className="container-reading">
          <Breadcrumbs
            locale={locale}
            items={[
              { label: t("title"), href: "/insights" },
              { label: p.title, href: `/insights/${slug}` },
            ]}
          />
          <h1 className="mt-10 text-display-lg">{p.title}</h1>
          <p className="mt-4 text-body-lg text-fg-secondary">{p.excerpt}</p>
          <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-fg-secondary">
            {author && <span>{t("by", { name: author.name })}</span>}
            <time dateTime={p.publishedAt}>{dateFmt(p.publishedAt, locale)}</time>
            <span>{c("minutesRead", { minutes: readingMinutes(p.body) })}</span>
          </p>
          {!translated && (
            <p lang={locale} className="mt-6 rounded-md bg-accent-soft px-4 py-3 text-body-sm">
              {t("notTranslated")}
            </p>
          )}
        </div>
      </header>
      {p.cover && typeof p.cover === "object" && (
        <div className="container-page max-w-5xl">
          <Media
            media={p.cover}
            priority
            sizes="(min-width:1024px) 960px, 100vw"
            className="aspect-[2/1] rounded-xl"
          />
        </div>
      )}
      <div className="container-page grid gap-12 py-12 lg:grid-cols-[1fr_minmax(0,720px)_1fr]">
        <aside className="hidden lg:block">
          {toc.length > 1 && (
            <nav aria-label={t("toc")} className="sticky top-28">
              <p className="eyebrow">{t("toc")}</p>
              <ol className="mt-3 space-y-2 border-l border-subtle text-body-sm">
                {toc.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "pl-7" : "pl-4"}>
                    <a href={`#${h.id}`} className="text-fg-secondary hover:text-accent">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </aside>
        <div lang={translated ? locale : "en"}>
          <RichText data={p.body} />
          {(p.tags?.length ?? 0) > 0 && (
            <nav aria-label={t("tags")} className="mt-10 flex flex-wrap gap-2">
              {p.tags!.map((tag) => (
                <a
                  key={tag}
                  href={localizePath(`/insights/tag/${tagSlug(tag)}`, locale)}
                  className="inline-flex min-h-9 items-center rounded-md border border-subtle px-3 text-body-sm text-fg-secondary hover:border-accent hover:text-accent"
                >
                  #{tag}
                </a>
              ))}
            </nav>
          )}
          {author && (author.bio || author.title) && (
            <aside
              aria-label={t("aboutAuthor")}
              className="mt-10 flex gap-4 rounded-2xl border border-subtle bg-surface p-5"
            >
              {author.photo && typeof author.photo === "object" ? (
                <Media
                  media={author.photo}
                  sizes="64px"
                  className="size-16 shrink-0 rounded-full"
                />
              ) : (
                <span
                  aria-hidden
                  className="grid size-16 shrink-0 place-items-center rounded-full bg-accent-soft font-display text-heading-md text-accent"
                >
                  {author.name.charAt(0)}
                </span>
              )}
              <div>
                <p className="eyebrow">{t("aboutAuthor")}</p>
                <p className="mt-1 font-display text-heading-md">{author.name}</p>
                {author.title && <p className="text-body-sm text-fg-secondary">{author.title}</p>}
                {author.bio && <p className="mt-2 text-body-sm text-fg-secondary">{author.bio}</p>}
              </div>
            </aside>
          )}
          <div className="mt-12 border-t border-subtle pt-8" data-no-print>
            <ShareLinks
              url={url}
              title={p.title}
              copy={{ share: t("share"), copyLink: t("copyLink") }}
            />
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="section bg-sunken" aria-labelledby="related">
          <div className="container-page">
            <h2 id="related" className="text-display-lg">
              {t("related")}
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <PostCard post={r} locale={locale} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: p.title,
          description: p.excerpt,
          datePublished: p.publishedAt,
          dateModified: p.updatedAt,
          inLanguage: translated ? locale : "en",
          mainEntityOfPage: url,
          author: author
            ? { "@type": "Person", name: author.name }
            : { "@type": "Organization", name: "Universal Bridge Ltd" },
          publisher: { "@id": siteUrl("/#organization") },
          ...(p.cover && typeof p.cover === "object" && p.cover.url
            ? { image: siteUrl(p.cover.url.replace(/^https?:\/\/[^/]+/, "")) }
            : {}),
        }}
      />
    </article>
  );
}
