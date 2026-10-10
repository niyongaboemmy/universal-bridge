/**
 * Desktop column count that avoids a lone orphan card (UI/UX audit v2 L-1):
 * 4 cards make a 2×2, not 3 + 1. Returns a static class for Tailwind.
 */
export function balancedCols(count: number): string {
  if (count === 4 || count === 2) return "lg:grid-cols-2";
  return "lg:grid-cols-3";
}

/** Phones: a swipeable, edge-to-edge rail instead of stacked cards (audit P2-3, v2 R-1). */
export const RAIL =
  "mx-[calc(var(--gutter)*-1)] flex snap-x snap-mandatory scroll-px-(--gutter) overflow-x-auto px-(--gutter) pb-4 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0";
export const RAIL_ITEM = "w-[82%] shrink-0 snap-start sm:w-auto";
