import { ArrowLeft, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import type { Where } from "payload";
import { FilterBar } from "@/components/office/FilterBar";
import { timeAgo, titleCase } from "@/components/office/format";
import { Kanban } from "@/components/office/Kanban";
import { Pagination } from "@/components/office/Pagination";
import { Card, Empty, PageHeader, Pill, STATUS_TONE, Tabs, btn } from "@/components/office/ui";
import { LEAD_STATUSES } from "@/collections/Leads";
import { leadCard } from "@/features/office/cards";
import { staffUsers } from "@/features/office/data";
import {
  dateRange,
  findPage,
  listHref,
  listParams,
  textSearch,
  type Params,
} from "@/features/office/query";
import { requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import { settings } from "@/lib/settings";
import type { Lead } from "@/payload-types";

export const metadata = { title: "Demo pipeline" };

const SORTS = {
  newest: "-createdAt",
  oldest: "createdAt",
  updated: "-updatedAt",
  followup: "nextFollowUpAt",
};

/** Demo requests, step 2: one product's pipeline, drag requests through the stages. */
export default async function ProductDemos({
  params,
  searchParams,
}: {
  params: Promise<{ product: string }>;
  searchParams: Promise<Params>;
}) {
  const user = await requireArea("demos");
  const workflow = await settings();
  const slug = (await params).product;
  const sp = await searchParams;
  const list = sp.view === "list";
  const { limit, page, sort } = listParams(sp, SORTS, "newest");
  const p = await payload();
  const where: Where[] = [
    { product: { equals: slug } },
    ...textSearch(sp.q, ["name", "email", "company", "ref", "message"]),
    ...dateRange(sp),
  ];
  if (sp.stage) where.push({ status: { equals: sp.stage } });
  if (sp.owner === "me") where.push({ assignee: { equals: user.id } });
  else if (sp.owner === "none") where.push({ assignee: { exists: false } });
  else if (sp.owner) where.push({ assignee: { equals: Number(sp.owner) } });
  if (sp.country) where.push({ country: { equals: sp.country } });

  const [result, users, products] = await Promise.all([
    findPage<Lead>(user, "leads", {
      where,
      sort,
      page: list ? page : 1,
      limit: list ? limit : 300,
    }),
    staffUsers(),
    p.find({
      collection: "products",
      limit: 50,
      depth: 0,
      select: { slug: true, name: true } as never,
    }),
  ]);
  const all = products.docs as { slug: string; name: string }[];
  const name = all.find((d) => d.slug === slug)?.name ?? titleCase(slug);
  const base = `/office/demos/${slug}`;
  const viewHref = (view?: string) => {
    return listHref(base, { ...sp, view, page: undefined });
  };

  return (
    <div className="grid gap-5">
      <Link
        href="/office/demos"
        className="inline-flex w-fit items-center gap-1.5 text-body-sm text-fg-secondary hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden /> All products
      </Link>
      <PageHeader
        title={`${name} · demo requests`}
        subtitle="Drag a request to its next stage, or use the ⋯ menu on a card."
        actions={
          <Link href={viewHref(list ? undefined : "list")} className={btn}>
            {list ? (
              <LayoutGrid className="size-4" aria-hidden />
            ) : (
              <List className="size-4" aria-hidden />
            )}
            {list ? "Board" : "List"}
          </Link>
        }
      />
      {all.length > 1 && (
        <Tabs
          current={base}
          items={all.map((d) => ({ href: `/office/demos/${d.slug}`, label: d.name }))}
        />
      )}
      <FilterBar
        fields={[
          { kind: "search", name: "q", placeholder: "Search name, company, ref…" },
          {
            kind: "select",
            name: "stage",
            label: "Stage",
            options: LEAD_STATUSES.map((s) => ({ value: s, label: titleCase(s) })),
          },
          {
            kind: "select",
            name: "owner",
            label: "Owner",
            options: [
              { value: "me", label: "Me" },
              { value: "none", label: "Unassigned" },
              ...users.map((u) => ({ value: String(u.id), label: u.name })),
            ],
          },
          { kind: "date", name: "from", label: "From" },
          { kind: "date", name: "to", label: "To" },
        ]}
        sorts={[
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
          { value: "updated", label: "Recently updated" },
          { value: "followup", label: "Follow-up soonest" },
        ]}
        perPage={list}
      />
      {!result.totalDocs ? (
        <Empty title="No demo requests match" body="Change or clear the filters." />
      ) : list ? (
        <>
          <Card pad={false}>
            <ul className="divide-y divide-[var(--border-subtle)]">
              {result.docs.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/office/requests/${l.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[var(--bg-sunken)]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{l.name}</span>
                      <span className="block truncate text-[0.8125rem] text-fg-muted">
                        {l.ref} · {l.company || l.email} · {timeAgo(l.createdAt)}
                      </span>
                    </span>
                    <Pill tone={STATUS_TONE[l.status]}>{l.status}</Pill>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
          <Pagination
            path={base}
            params={sp}
            page={result.page}
            totalPages={result.totalPages}
            totalDocs={result.totalDocs}
            limit={result.limit}
          />
        </>
      ) : (
        <Kanban
          kind="lead"
          moreHref={viewHref("list")}
          limit={workflow.boardLimit}
          columns={LEAD_STATUSES.map((s) => ({ id: s, label: s }))}
          items={result.docs.map((l) => leadCard(l, workflow.responseHours))}
        />
      )}
    </div>
  );
}
