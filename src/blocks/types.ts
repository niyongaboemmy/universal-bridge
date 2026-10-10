import type { Locale } from "@/i18n/routing";
import type { EditRef } from "@/lib/live-edit/attrs";
import type { Page } from "@/payload-types";

export type AnyBlock = NonNullable<Page["layout"]>[number];
export type BlockOf<T extends AnyBlock["blockType"]> = Extract<AnyBlock, { blockType: T }>;
export type BlockProps<T extends AnyBlock["blockType"]> = {
  block: BlockOf<T>;
  locale: Locale;
  first?: boolean;
  /** Live editing: where this block lives (`layout.<blockId>`); undefined for visitors. */
  edit?: EditRef;
};
