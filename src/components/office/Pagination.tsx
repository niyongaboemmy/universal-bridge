import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** "Showing 26–50 of 312" with numbered pages; keeps every other filter in the URL. */
export function Pagination({
  path,
  params,
  page,
  totalPages,
  totalDocs,
  limit,
}: {
  path: string;
  params: Record<string, string | undefined>;
  page: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
}) {
  if (!totalDocs) return null;
  const href = (n: number) => {
    const q = new URLSearchParams(
      Object.entries(params).filter(([k, v]) => v && k !== "page") as [string, string][],
    );
    if (n > 1) q.set("page", String(n));
    return q.size ? `${path}?${q}` : path;
  };
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, totalDocs);
  // 1 … 4 5 [6] 7 8 … 20
  const pages = [...new Set([1, page - 2, page - 1, page, page + 1, page + 2, totalPages])]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);
  const item =
    "grid h-8 min-w-8 place-items-center rounded-full px-2 text-[0.8125rem] tabular-nums transition-colors";
  return (
    <nav aria-label="Pages" className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-[0.8125rem] text-fg-muted">
        Showing{" "}
        <span className="font-medium text-fg">
          {from}–{to}
        </span>{" "}
        of <span className="font-medium text-fg">{totalDocs}</span>
      </p>
      {totalPages > 1 && (
        <ul className="flex items-center gap-1">
          <li>
            {page > 1 ? (
              <Link
                href={href(page - 1)}
                rel="prev"
                aria-label="Previous page"
                className={cn(item, "hover:bg-accent-soft")}
              >
                <ChevronLeft className="size-4" aria-hidden />
              </Link>
            ) : (
              <span className={cn(item, "opacity-30")} aria-hidden>
                <ChevronLeft className="size-4" />
              </span>
            )}
          </li>
          {pages.map((n, i) => (
            <li key={n} className="flex items-center gap-1">
              {i > 0 && n - pages[i - 1]! > 1 && <span className="px-1 text-fg-muted">…</span>}
              <Link
                href={href(n)}
                aria-current={n === page ? "page" : undefined}
                aria-label={`Page ${n}`}
                className={cn(
                  item,
                  n === page ? "bg-accent font-semibold text-on-accent" : "hover:bg-accent-soft",
                )}
              >
                {n}
              </Link>
            </li>
          ))}
          <li>
            {page < totalPages ? (
              <Link
                href={href(page + 1)}
                rel="next"
                aria-label="Next page"
                className={cn(item, "hover:bg-accent-soft")}
              >
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            ) : (
              <span className={cn(item, "opacity-30")} aria-hidden>
                <ChevronRight className="size-4" />
              </span>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}
