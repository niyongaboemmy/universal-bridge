import "server-only";
import type { Locale } from "@/i18n/routing";
import type { SiteSetting } from "@/payload-types";
import { cached } from "./cached";
import { payload } from "./payload";

export const getSiteSettings = cached(
  async (locale: Locale): Promise<SiteSetting> =>
    (await payload()).findGlobal({ slug: "site-settings", locale, depth: 1 }),
  ["site-settings"],
  () => ["global:site-settings"],
);
