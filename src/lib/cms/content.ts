import "server-only";
import { draftMode } from "next/headers";
import type { CollectionSlug, Where } from "payload";
import type { Locale } from "@/i18n/routing";
import type {
  CaseStudy,
  Client,
  Faq,
  Industry,
  Page,
  Product,
  Service,
  Stat,
  Technology,
  Testimonial,
  Job,
  Program,
  Hub,
  Post,
  Category,
  Event,
  PressItem,
  TeamMember,
} from "@/payload-types";
import { cached } from "./cached";
import { payload } from "./payload";

/**
 * ADR-003 read layer. Published content is cached and tagged by collection and
 * slug; in draft mode (live preview, CMS-07) reads bypass the cache and include
 * drafts.
 */
async function isDraft() {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false; // outside a request (build-time generateStaticParams)
  }
}

const published: Where = { _status: { equals: "published" } };

async function findMany<T>(
  collection: CollectionSlug,
  locale: Locale,
  opts: {
    where?: Where;
    sort?: string;
    limit?: number;
    depth?: number;
    drafts?: boolean;
    versioned?: boolean;
  } = {},
): Promise<T[]> {
  const { versioned = true, drafts = false } = opts;
  const where =
    versioned && !drafts ? { and: [published, ...(opts.where ? [opts.where] : [])] } : opts.where;
  const res = await (
    await payload()
  ).find({
    collection,
    locale,
    where,
    sort: opts.sort,
    limit: opts.limit ?? 100,
    depth: opts.depth ?? 1,
    draft: drafts,
    pagination: false,
  });
  return res.docs as T[];
}

async function findBySlug<T>(
  collection: CollectionSlug,
  slug: string,
  locale: Locale,
  drafts: boolean,
  depth = 2,
): Promise<T | null> {
  const docs = await findMany<T>(collection, locale, {
    where: { slug: { equals: slug } },
    limit: 1,
    depth,
    drafts,
  });
  return docs[0] ?? null;
}

/** Cached-by-tag getter that switches to uncached draft reads in preview. */
function bySlug<T>(collection: CollectionSlug, depth = 2) {
  const fromCache = cached(
    (slug: string, locale: Locale) => findBySlug<T>(collection, slug, locale, false, depth),
    [collection, "by-slug"],
    (slug) => [collection, `${collection}:${slug}`],
  );
  return async (slug: string, locale: Locale) =>
    (await isDraft())
      ? findBySlug<T>(collection, slug, locale, true, depth)
      : fromCache(slug, locale);
}

function list<T>(
  collection: CollectionSlug,
  opts: { sort?: string; where?: Where; depth?: number; versioned?: boolean } = {},
) {
  return cached(
    (locale: Locale) => findMany<T>(collection, locale, opts),
    [collection, "list", JSON.stringify(opts)],
    () => [collection],
  );
}

export const getPage = bySlug<Page>("pages", 2);
export const getService = bySlug<Service>("services", 2);
export const getIndustry = bySlug<Industry>("industries", 2);
export const getCaseStudy = bySlug<CaseStudy>("case-studies", 2);
export const getProduct = bySlug<Product>("products", 1);
export const getProgram = bySlug<Program>("programs", 2);
export const getJob = bySlug<Job>("jobs", 0);
export const getPrograms = list<Program>("programs", { sort: "order", depth: 1 });
export const getJobs = list<Job>("jobs", { sort: "-createdAt", depth: 0 });
export const getHub = bySlug<Hub>("hubs", 2);
export const getHubs = list<Hub>("hubs", { sort: "order", depth: 1 });
export const getPost = bySlug<Post>("posts", 2);
export const getPosts = list<Post>("posts", { sort: "-publishedAt", depth: 1 });
export const getEvent = bySlug<Event>("events", 1);
export const getEvents = list<Event>("events", { sort: "startAt", depth: 1 });
export const getCategories = list<Category>("categories", {
  sort: "order",
  depth: 0,
  versioned: false,
});
export const getPressItems = list<PressItem>("press-items", {
  sort: "-date",
  depth: 0,
  versioned: false,
});
export const getLeadership = list<TeamMember>("team-members", {
  where: { isLeadership: { equals: true } },
  sort: "order",
  depth: 1,
  versioned: false,
});

export const getServices = list<Service>("services", { sort: "order", depth: 0 });
export const getIndustries = list<Industry>("industries", { sort: "order", depth: 0 });
export const getCaseStudies = list<CaseStudy>("case-studies", { sort: "-publishedAt", depth: 1 });
export const getProducts = list<Product>("products", { sort: "order", depth: 1 });
export const getTechnologies = list<Technology>("technologies", {
  sort: "order",
  depth: 1,
  versioned: false,
});
export const getFaqs = list<Faq>("faqs", { sort: "order", depth: 0, versioned: false });

/** FR-HOME-07 / CNT-05: approved testimonials only. */
export const getApprovedTestimonials = list<Testimonial>("testimonials", {
  where: { approved: { equals: true } },
  depth: 1,
  versioned: false,
});

/** OI-13: only clients who gave permission. */
export const getVisibleClients = list<Client>("clients", {
  where: { showOnSite: { equals: true } },
  sort: "order",
  depth: 1,
  versioned: false,
});

/** IX-01: public, verified stats not older than 18 months (CNT-04). */
export const STAT_MAX_AGE_MONTHS = 18;
export function isStatFresh(stat: Pick<Stat, "asOf">, now = new Date()): boolean {
  const asOf = new Date(stat.asOf);
  const limit = new Date(now);
  limit.setMonth(limit.getMonth() - STAT_MAX_AGE_MONTHS);
  return asOf >= limit;
}
const getPublicStatsRaw = list<Stat>("stats", {
  where: { public: { equals: true } },
  sort: "order",
  depth: 0,
  versioned: false,
});
export async function getPublicStats(locale: Locale) {
  return (await getPublicStatsRaw(locale)).filter((s) => isStatFresh(s));
}

/** Published slugs for generateStaticParams. */
export async function publishedSlugs(collection: CollectionSlug): Promise<string[]> {
  const res = await (
    await payload()
  ).find({
    collection,
    where: published,
    limit: 1000,
    depth: 0,
    select: { slug: true } as never,
    pagination: false,
  });
  return (res.docs as unknown as { slug: string }[]).map((d) => d.slug);
}
