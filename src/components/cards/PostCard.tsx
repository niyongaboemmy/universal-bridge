import { getTranslations } from "next-intl/server";
import { CoverArt } from "@/components/brand/CoverArt";
import { Media } from "@/components/ui/Media";
import { dateFmt } from "@/features/academy/format";
import { localizePath, type Locale } from "@/i18n/routing";
import { readingMinutes } from "@/lib/richtext";
import { cn } from "@/lib/utils";
import type { Post } from "@/payload-types";

/** FR-BLOG-01 post card. */
export async function PostCard({
  post,
  locale,
  large,
}: {
  post: Post;
  locale: Locale;
  large?: boolean;
}) {
  const c = await getTranslations({ locale, namespace: "common" });
  const category = post.categories?.find((x) => typeof x === "object");
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-subtle bg-surface shadow-1 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-3",
        large && "md:grid md:grid-cols-2",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-sunken",
          large ? "aspect-[16/10] md:aspect-auto md:min-h-80" : "aspect-[16/9]",
        )}
      >
        {post.cover && typeof post.cover === "object" ? (
          <Media
            media={post.cover}
            sizes={large ? "50vw" : "(min-width:1024px) 33vw, 100vw"}
            className="absolute inset-0"
            imgClassName="transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <CoverArt seed={post.slug} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex flex-wrap gap-x-3 text-body-sm text-fg-secondary">
          {category && typeof category === "object" && (
            <span className="font-medium text-spark-text">{category.title}</span>
          )}
          <time dateTime={post.publishedAt}>{dateFmt(post.publishedAt, locale)}</time>
          <span>{c("minutesRead", { minutes: readingMinutes(post.body) })}</span>
        </p>
        <h3 className={cn("mt-3 font-display", large ? "text-heading-lg" : "text-heading-md")}>
          <a
            href={localizePath(`/insights/${post.slug}`, locale)}
            className="after:absolute after:inset-0"
          >
            {post.title}
          </a>
        </h3>
        <p className="mt-2 line-clamp-3 text-fg-secondary">{post.excerpt}</p>
      </div>
    </article>
  );
}
