import "server-only";
import type { Locale } from "@/i18n/routing";
import { cached } from "@/lib/cms/cached";
import { payload } from "@/lib/cms/payload";
import type { Opening } from "@/payload-types";

/** Openings shown on the website: open ones, plus recently closed ones (their pages stay). */
export const getPublicOpenings = cached(
  async (locale: Locale): Promise<Opening[]> => {
    const p = await payload();
    const res = await p.find({
      collection: "openings",
      locale,
      depth: 1,
      limit: 100,
      sort: "closesAt",
      overrideAccess: false,
      where: { status: { equals: "open" } },
    });
    return res.docs as Opening[];
  },
  ["openings-public"],
  () => ["openings"],
);

export const getOpening = cached(
  async (slug: string, locale: Locale): Promise<Opening | null> => {
    const p = await payload();
    const res = await p.find({
      collection: "openings",
      locale,
      depth: 1,
      limit: 1,
      overrideAccess: false,
      where: { slug: { equals: slug } },
    });
    return (res.docs[0] as Opening | undefined) ?? null;
  },
  ["opening"],
  (slug) => ["openings", `openings:${slug}`],
);

/** Open for applications right now (status, opening and closing dates). */
export function isAccepting(o: Pick<Opening, "status" | "opensAt" | "closesAt">, now = Date.now()) {
  if (o.status !== "open") return false;
  if (o.opensAt && new Date(o.opensAt).getTime() > now) return false;
  if (o.closesAt && new Date(o.closesAt).getTime() + 86_400_000 <= now) return false;
  return true;
}
