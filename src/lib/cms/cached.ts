import "server-only";
import { unstable_cache } from "next/cache";

/**
 * ADR-003: every public CMS read is cached forever and tagged; Payload hooks
 * revalidate the tags on publish. `keyParts` must identify the query.
 */
export function cached<Args extends unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  keyParts: string[],
  tags: (...args: Args) => string[],
) {
  return (...args: Args) =>
    unstable_cache(() => fn(...args), [...keyParts, JSON.stringify(args)], {
      tags: tags(...args),
      revalidate: false,
    })();
}
