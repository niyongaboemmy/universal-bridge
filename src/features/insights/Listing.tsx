import { getTranslations } from "next-intl/server";
import { PostCard } from "@/components/cards/PostCard";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { localizePath, type Locale } from "@/i18n/routing";
import { getCategories, getPosts } from "@/lib/cms/content";
import { cn } from "@/lib/utils";

export const PAGE_SIZE = 12;

/** Posts with a tag, matched case-insensitively (tags are free text). */
export const tagSlug = (tag: string) => tag.trim().toLowerCase().replace(/\s+/g, "-");

/**
 * FR-BLOG-01: featured post, category tabs (links, shareable), grid, topic
 * filter and pagination (`/insights/page/N`, 12 per page).
 */
export async function InsightsListing({
  locale,
  category,
  tag,
  page = 1,
  crumbs,
}: {
  locale: Locale;
  category?: string;
  tag?: string;
  page?: number;
  crumbs: Crumb[];
}) {
  const [posts, categories, t] = await Promise.all([
    getPosts(locale),
    getCategories(locale),
    getTranslations({ locale, namespace: "s5.insights" }),
  ]);
  let inCategory = category
    ? posts.filter((p) => p.categories?.some((c) => typeof c === "object" && c.slug === category))
    : posts;
  const tagLabel = tag
    ? posts.flatMap((p) => p.tags ?? []).find((x) => tagSlug(x) === tag)
    : undefined;
  if (tag) inCategory = inCategory.filter((p) => (p.tags ?? []).some((x) => tagSlug(x) === tag));
  const featured =
    !category && !tag && page === 1
      ? (inCategory.find((p) => p.featured) ?? inCategory[0])
      : undefined;
  const pool = inCategory.filter((p) => p !== featured);
  const pages = Math.max(1, Math.ceil(pool.length / PAGE_SIZE));
  const rest = pool.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const current = categories.find((c) => c.slug === category);
  const pageHref = (n: number) =>
    localizePath(n === 1 ? "/insights" : `/insights/page/${n}`, locale);
  return (
    <div className="section pt-8">
      <div className="container-page">
        <Breadcrumbs locale={locale} items={crumbs} />
        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-display-xl">
              {current?.title ?? (tagLabel ? t("tag", { tag: tagLabel }) : t("title"))}
              {page > 1 && <span className="sr-only"> — {t("page", { n: page })}</span>}
            </h1>
            <p className="mt-4 max-w-2xl text-body-lg text-fg-secondary">{t("lead")}</p>
          </div>
          <a
            href="/feed.xml"
            className="text-body-sm font-semibold text-accent underline-offset-4 hover:underline"
          >
            {t("rss")}
          </a>
        </div>
        {categories.length > 0 && (
          <nav aria-label={t("all")} className="mt-8 flex flex-wrap gap-2">
            {[{ slug: "", title: t("all") }, ...categories].map((c) => {
              const active = (c.slug || undefined) === category;
              return (
                <a
                  key={c.slug || "all"}
                  href={localizePath(c.slug ? `/insights/category/${c.slug}` : "/insights", locale)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full border px-4 text-body-sm font-medium transition-colors",
                    active
                      ? "border-accent bg-accent text-on-accent"
                      : "border-subtle hover:border-accent hover:text-accent",
                  )}
                >
                  {c.title}
                </a>
              );
            })}
          </nav>
        )}
        {!inCategory.length && <p className="mt-10 text-fg-secondary">{t("none")}</p>}
        {featured && (
          <div className="mt-10">
            <PostCard post={featured} locale={locale} large />
          </div>
        )}
        {rest.length > 0 && (
          <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <li key={p.id}>
                <PostCard post={p} locale={locale} />
              </li>
            ))}
          </ul>
        )}
        {pages > 1 && !category && !tag && (
          <nav
            aria-label={t("pagination")}
            className="mt-12 flex flex-wrap items-center justify-center gap-2"
          >
            {page > 1 && (
              <a
                href={pageHref(page - 1)}
                rel="prev"
                className="inline-flex min-h-11 items-center rounded-full border border-subtle px-4 text-body-sm font-medium hover:border-accent hover:text-accent"
              >
                {t("prev")}
              </a>
            )}
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <a
                key={n}
                href={pageHref(n)}
                aria-current={n === page ? "page" : undefined}
                aria-label={t("page", { n })}
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-full border text-body-sm font-medium",
                  n === page
                    ? "border-accent bg-accent text-on-accent"
                    : "border-subtle hover:border-accent hover:text-accent",
                )}
              >
                {n}
              </a>
            ))}
            {page < pages && (
              <a
                href={pageHref(page + 1)}
                rel="next"
                className="inline-flex min-h-11 items-center rounded-full border border-subtle px-4 text-body-sm font-medium hover:border-accent hover:text-accent"
              >
                {t("next")}
              </a>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
