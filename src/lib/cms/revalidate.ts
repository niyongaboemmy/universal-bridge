import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";

/**
 * ADR-003: on publish, revalidate the document tag and its collection tag.
 * Runs inside Payload hooks; outside a Next.js request (seed script, CLI)
 * there is no cache to revalidate, so failures are ignored.
 */
export async function revalidateTags(tags: string[]) {
  try {
    const { revalidateTag } = await import("next/cache");
    for (const tag of tags) revalidateTag(tag, "max");
  } catch {
    // Not running inside Next.js — nothing to revalidate.
  }
}

export const tagsFor = (collection: string, slug?: string | null) =>
  slug ? [collection, `${collection}:${slug}`] : [collection];

export function revalidateCollection(collection: string): {
  afterChange: CollectionAfterChangeHook;
  afterDelete: CollectionAfterDeleteHook;
} {
  return {
    afterChange: async ({ doc, previousDoc }) => {
      // Autosaved drafts don't change the public site; publish/unpublish does.
      if (doc?._status === "draft" && previousDoc?._status !== "published") return doc;
      const tags = new Set([...tagsFor(collection, doc?.slug), "search-index", "sitemap"]);
      if (previousDoc?.slug && previousDoc.slug !== doc?.slug)
        tags.add(`${collection}:${previousDoc.slug}`);
      await revalidateTags([...tags]);
      return doc;
    },
    afterDelete: async ({ doc }) => {
      await revalidateTags([...tagsFor(collection, doc?.slug), "search-index", "sitemap"]);
      return doc;
    },
  };
}

export function revalidateGlobal(slug: string): GlobalAfterChangeHook {
  return async ({ doc }) => {
    await revalidateTags([`global:${slug}`]);
    return doc;
  };
}
