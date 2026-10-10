import { ArrowRight, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { Highlight } from "@/components/office/CommandPalette";
import { FilterBar } from "@/components/office/FilterBar";
import { timeAgo } from "@/components/office/format";
import { Card, Empty, PageHeader } from "@/components/office/ui";
import { listHref, type Params } from "@/features/office/query";
import { deepSearch } from "@/features/office/search";
import { officeUser } from "@/features/office/session";

export const metadata = { title: "Search" };

/** Search everything the person may open: records, answers, notes and website content. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await officeUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const all = q.length >= 2 ? await deepSearch(user as never, q) : [];
  const types = [...new Set(all.map((r) => r.type))];
  const shown = sp.type ? all.filter((r) => r.type === sp.type) : all;
  const groups = types
    .filter((t) => !sp.type || t === sp.type)
    .map((t) => ({ type: t, items: shown.filter((r) => r.type === t) }));

  return (
    <div className="office-page grid gap-5">
      <PageHeader
        title="Search"
        subtitle="Requests, applicants and their answers, notes, openings, projects, people, accounts and website content."
      />
      <FilterBar perPage={false} keep={[]} fields={[{ kind: "search", name: "q", placeholder: "Search everything…" }]} />
      {q.length >= 2 && (
        <nav aria-label="Result types" className="flex flex-wrap gap-2">
          <Link
            href={listHref("/office/search", { q })}
            aria-current={!sp.type}
            className="rounded-full border border-subtle px-3 py-1 text-[0.8125rem] font-medium aria-[current=true]:border-transparent aria-[current=true]:bg-[var(--accent-primary)] aria-[current=true]:text-white"
          >
            All <span className="opacity-70">{all.length}</span>
          </Link>
          {types.map((t) => (
            <Link
              key={t}
              href={listHref("/office/search", { q, type: t })}
              aria-current={sp.type === t}
              className="rounded-full border border-subtle px-3 py-1 text-[0.8125rem] font-medium aria-[current=true]:border-transparent aria-[current=true]:bg-[var(--accent-primary)] aria-[current=true]:text-white"
            >
              {t}s <span className="opacity-70">{all.filter((r) => r.type === t).length}</span>
            </Link>
          ))}
        </nav>
      )}
      {q.length < 2 ? (
        <Empty title="Type at least two letters" body="Tip: press / or ⌘K anywhere to search from any page." />
      ) : !all.length ? (
        <Empty title={`Nothing found for “${q}”`} body="Try fewer or different words. Every word must appear." />
      ) : (
        <div className="office-stagger grid gap-4 xl:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.type} title={`${g.type}s · ${g.items.length}`} pad={false}>
              <ul className="divide-y divide-[var(--border-subtle)]">
                {g.items.map((r) => {
                  const inner = (
                    <>
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                        <SearchIcon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          <Highlight text={r.title} q={q} />
                        </span>
                        <span className="block truncate text-[0.75rem] text-fg-muted">
                          <Highlight text={r.subtitle} q={q} />
                        </span>
                        {r.snippet && (
                          <span className="mt-0.5 line-clamp-2 block text-[0.75rem] text-fg-secondary italic">
                            <Highlight text={r.snippet} q={q} />
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-[0.75rem] text-fg-muted">
                        {r.at ? timeAgo(r.at) : null}
                        <ArrowRight className="size-3.5" aria-hidden />
                      </span>
                    </>
                  );
                  const cls =
                    "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--bg-sunken)]";
                  return (
                    <li key={`${r.type}-${r.id}`}>
                      {r.href.startsWith("/office") ? (
                        <Link href={r.href} className={cls}>
                          {inner}
                        </Link>
                      ) : (
                        <a href={r.href} className={cls}>
                          {inner}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
