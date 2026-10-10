/**
 * pnpm db:seed — loads real UB content and a first admin user.
 * Idempotent: documents are upserted by slug, so it can run on every CI build.
 */
import { getPayload, type Payload } from "payload";
import config from "../src/payload.config";
import { pick, withIds } from "./seed-data/localize";
import { footerColumns, navItems } from "./seed-data/navigation";
import { siteSettings } from "./seed-data/settings";
import { CONTENT_TAGS, seedContent } from "./seed-content";

type GlobalSlug = "navigation" | "site-settings" | "announcement";

/** Save a localized global: English first, then fr/rw reusing English row ids. */
export async function seedGlobal(
  payload: Payload,
  slug: GlobalSlug,
  tree: Record<string, unknown>,
) {
  const en = await payload.updateGlobal({
    slug,
    locale: "en",
    data: pick(tree, "en") as never,
    context: { seed: true },
  });
  for (const locale of ["fr", "rw"] as const) {
    await payload.updateGlobal({
      slug,
      locale,
      data: withIds(pick(tree, locale), en) as never,
      context: { seed: true },
    });
  }
}

/** Tell a running dev/staging server to drop cached content (best effort). */
async function revalidateRunningSite(tags: string[]) {
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/revalidate`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.REVALIDATE_SECRET}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(5000),
    });
    console.log(
      res.ok ? `✓ revalidated ${tags.length} cache tags` : `· revalidate returned ${res.status}`,
    );
  } catch {
    console.log("· no running site to revalidate");
  }
}

async function seedAdmin(payload: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@universalbridge.rw";
  const existing = await payload.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
  });
  if (existing.docs.length) return console.log(`· admin ${email} exists`);
  const password =
    process.env.SEED_ADMIN_PASSWORD ??
    (process.env.NODE_ENV === "production" ? undefined : "ub-dev-password");
  if (!password) throw new Error("Set SEED_ADMIN_PASSWORD to seed an admin in production.");
  await payload.create({
    collection: "users",
    data: { email, password, name: "UB Admin", roles: ["super"] },
  });
  console.log(`✓ admin ${email} created`);
}

process.on("exit", (code) => code && console.error(`seed exited with ${code}`));

async function main() {
  const payload = await getPayload({ config });
  await seedAdmin(payload);
  await payload.updateGlobal({
    slug: "site-settings",
    data: siteSettings,
    context: { seed: true },
  });
  console.log("✓ site settings");
  await seedGlobal(payload, "navigation", { items: navItems, footerColumns });
  console.log("✓ navigation (en, fr, rw)");
  await seedContent(payload);
  await revalidateRunningSite([
    "global:site-settings",
    "global:navigation",
    "global:announcement",
    ...CONTENT_TAGS,
  ]);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
