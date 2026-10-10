import "server-only";
import type { Locale } from "@/i18n/routing";
import type { Announcement, Navigation } from "@/payload-types";
import { cached } from "./cached";
import { payload } from "./payload";

export const getNavigation = cached(
  async (locale: Locale): Promise<Navigation> =>
    (await payload()).findGlobal({ slug: "navigation", locale, depth: 0 }),
  ["navigation"],
  () => ["global:navigation"],
);

export const getAnnouncement = cached(
  async (locale: Locale): Promise<Announcement> =>
    (await payload()).findGlobal({ slug: "announcement", locale, depth: 0 }),
  ["announcement"],
  () => ["global:announcement"],
);
