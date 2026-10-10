import { existsSync } from "node:fs";
import path from "node:path";
import type { CollectionSlug, Payload } from "payload";
import { industries, pages, products, stats } from "./seed-data/content";
import { academyPages, programs, sampleIntakes } from "./seed-data/academy";
import { conceptImages } from "./seed-data/images";
import { pickWithFallback } from "./seed-data/localize";
import { lexical } from "./seed-data/lexical";
import { faqs, services, technologies } from "./seed-data/services";
import {
  categories,
  events,
  hubs,
  leadership,
  legalPages,
  posts,
  s5Pages,
  sampleEvent,
} from "./seed-data/s5";

const LOCALES = ["en", "fr", "rw"] as const;

/**
 * Upsert one document by a unique field, writing every locale. English is
 * saved first; fr/rw fall back to English where a translation is missing.
 */
async function upsert(
  payload: Payload,
  collection: CollectionSlug,
  key: { field: string; value: string },
  tree: Record<string, unknown>,
  {
    versioned = true,
    status = "published",
  }: { versioned?: boolean; status?: "published" | "draft" } = {},
): Promise<number> {
  const found = await payload.find({
    collection,
    where: { [key.field]: { equals: key.value } },
    limit: 1,
    depth: 0,
    draft: versioned,
    overrideAccess: true,
  });
  let id = found.docs[0]?.id as number | undefined;
  for (const locale of LOCALES) {
    const data = {
      ...(pickWithFallback(tree, locale) as object),
      ...(versioned ? { _status: status } : {}),
    };
    if (id === undefined) {
      id = (
        await payload.create({
          collection,
          locale,
          data: data as never,
          overrideAccess: true,
          context: { seed: true },
        })
      ).id as number;
    } else {
      await payload.update({
        collection,
        id,
        locale,
        data: data as never,
        overrideAccess: true,
        context: { seed: true },
      });
    }
  }
  return id!;
}

async function idsBySlug(
  payload: Payload,
  collection: CollectionSlug,
  slugs: string[],
): Promise<number[]> {
  if (!slugs.length) return [];
  const res = await payload.find({
    collection,
    where: { slug: { in: slugs } },
    limit: 100,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });
  return slugs
    .map((s) => (res.docs as { id: number; slug: string }[]).find((d) => d.slug === s)?.id)
    .filter((x): x is number => !!x);
}

/**
 * Import UB's concept renders into the media library (converted to WebP with
 * responsive sizes by Payload). Idempotent by file name. Returns key → media id.
 */
async function seedConceptImages(payload: Payload): Promise<Record<string, number>> {
  const ids: Record<string, number> = {};
  for (const img of conceptImages) {
    const filePath = path.resolve("brand/source/images", img.file);
    if (!existsSync(filePath)) continue;
    const filename = `concept-${img.key}`;
    const existing = await payload.find({
      collection: "media",
      where: { filename: { like: filename } },
      limit: 1,
      overrideAccess: true,
    });
    let id = existing.docs[0]?.id as number | undefined;
    if (!id) {
      const { readFile } = await import("node:fs/promises");
      const created = await payload.create({
        collection: "media",
        overrideAccess: true,
        locale: "en",
        data: { alt: img.alt.en, isConcept: true, credit: "Concept render supplied by UB" },
        file: {
          data: await readFile(filePath),
          mimetype: "image/png",
          name: `${filename}.png`,
          size: 0,
        },
      });
      id = created.id as number;
    }
    if (img.alt.fr)
      await payload.update({
        collection: "media",
        id,
        locale: "fr",
        data: { alt: img.alt.fr },
        overrideAccess: true,
      });
    ids[img.key] = id;
  }
  return ids;
}

/** Replace `{ media: "key" }` placeholders in page trees with media ids. */
function withMedia(value: unknown, ids: Record<string, number>): unknown {
  if (Array.isArray(value)) return value.map((v) => withMedia(v, ids));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        k === "media" && typeof v === "string" ? (ids[v] ?? null) : withMedia(v, ids),
      ]),
    );
  }
  return value;
}

export async function seedContent(payload: Payload) {
  for (const t of technologies)
    await upsert(payload, "technologies", { field: "slug", value: t.slug }, t, {
      versioned: false,
    });
  console.log(`✓ technologies (${technologies.length})`);

  const faqIds: Record<string, number> = {};
  for (const f of faqs) {
    faqIds[f.key] = await upsert(
      payload,
      "faqs",
      { field: "question", value: f.question.en },
      { question: f.question, answer: f.answer, topic: f.topic },
      { versioned: false },
    );
  }
  console.log(`✓ FAQs (${faqs.length})`);

  for (const s of services) {
    const { technologies: techSlugs, faqs: faqKeys, ...rest } = s;
    await upsert(
      payload,
      "services",
      { field: "slug", value: s.slug },
      {
        ...rest,
        technologies: await idsBySlug(payload, "technologies", techSlugs),
        faqs: faqKeys.map((k) => faqIds[k]).filter(Boolean),
      },
    );
  }
  console.log(`✓ services (${services.length})`);

  for (const i of industries) {
    const { services: serviceSlugs, challenges, ...rest } = i;
    await upsert(
      payload,
      "industries",
      { field: "slug", value: i.slug },
      {
        ...rest,
        challenges: challenges.map((text) => ({ text })),
        services: await idsBySlug(payload, "services", serviceSlugs),
      },
    );
  }
  console.log(`✓ industries (${industries.length})`);

  for (const p of products) await upsert(payload, "products", { field: "slug", value: p.slug }, p);
  console.log(`✓ products (${products.length})`);

  for (const s of stats)
    await upsert(payload, "stats", { field: "key", value: s.key }, s, { versioned: false });
  console.log(
    `✓ stats (${stats.filter((s) => s.public).length} public, ${stats.filter((s) => !s.public).length} awaiting OI-02)`,
  );

  const media = await seedConceptImages(payload);
  console.log(`✓ concept images (${Object.keys(media).length}, labelled “Concept”)`);

  for (const p of programs) await upsert(payload, "programs", { field: "slug", value: p.slug }, p);
  console.log(`✓ programs (${programs.length})`);

  // Sample intakes only outside production, so the apply flow can be tested.
  if (process.env.NODE_ENV !== "production" && process.env.SEED_SAMPLE_INTAKES !== "0") {
    for (const i of sampleIntakes()) {
      const [programId] = await idsBySlug(payload, "programs", [i.program]);
      if (!programId) continue;
      const existing = await payload.find({
        collection: "intakes",
        where: { label: { equals: i.label } },
        limit: 1,
        overrideAccess: true,
      });
      const data = { ...i, program: programId, status: "open" as const };
      if (existing.docs[0])
        await payload.update({
          collection: "intakes",
          id: existing.docs[0].id,
          data,
          overrideAccess: true,
        });
      else await payload.create({ collection: "intakes", data, overrideAccess: true });
    }
    console.log("✓ sample intakes (development only; one is full to test the waitlist)");
  }

  await seedS5(payload, media);

  for (const [slug, page] of Object.entries({
    ...pages,
    ...academyPages,
    ...s5Pages,
    ...legalPages,
  })) {
    const tree = withMedia({ slug, ...page }, media) as Record<string, unknown>;
    await upsert(payload, "pages", { field: "slug", value: slug }, tree);
  }
  console.log(
    `✓ pages (${Object.keys(pages).length + Object.keys(academyPages).length + Object.keys(s5Pages).length + Object.keys(legalPages).length})`,
  );
}

/** S5: leadership, labs, insights, events. Drafts awaiting UB review stay unpublished in production. */
async function seedS5(payload: Payload, media: Record<string, number>) {
  const isProd = process.env.NODE_ENV === "production";
  const review = isProd ? "draft" : "published";

  for (const m of leadership)
    await upsert(
      payload,
      "team-members",
      { field: "name", value: m.name },
      { ...m, isLeadership: true },
      { versioned: false },
    );
  console.log(`✓ leadership (${leadership.length}, from the current site — confirm OI-11)`);

  for (const c of categories)
    await upsert(payload, "categories", { field: "slug", value: c.slug }, c, { versioned: false });

  for (const h of hubs) {
    const { cover, ...rest } = h;
    await upsert(
      payload,
      "hubs",
      { field: "slug", value: h.slug },
      { ...rest, cover: media[cover] ?? null },
    );
  }
  console.log(`✓ hubs (${hubs.length})`);

  for (const p of posts) {
    const { category, body, ...rest } = p;
    await upsert(
      payload,
      "posts",
      { field: "slug", value: p.slug },
      {
        ...rest,
        body: { en: lexical(body.en) },
        categories: await idsBySlug(payload, "categories", [category]),
      },
      { status: review },
    );
  }
  console.log(`✓ posts (${posts.length}${isProd ? ", drafts for review" : ""})`);

  for (const { cover, ...e } of events)
    await upsert(
      payload,
      "events",
      { field: "slug", value: e.slug },
      { ...e, cover: media[cover] ?? null },
      { status: review },
    );
  if (!isProd) {
    const e = sampleEvent();
    await upsert(payload, "events", { field: "slug", value: e.slug }, e);
  }
  console.log(
    `✓ events (${events.length}${isProd ? ", dates to confirm" : " + development sample"})`,
  );
}

export const CONTENT_TAGS = [
  "programs",
  "intakes",
  "jobs",
  "pages",
  "services",
  "industries",
  "case-studies",
  "products",
  "technologies",
  "faqs",
  "stats",
  "testimonials",
  "clients",
  "sitemap",
  "search-index",
  "hubs",
  "posts",
  "categories",
  "events",
  "press-items",
  "team-members",
];
