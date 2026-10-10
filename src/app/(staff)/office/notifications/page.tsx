import Link from "next/link";
import type { Where } from "payload";
import { FilterBar } from "@/components/office/FilterBar";
import { timeAgo, titleCase } from "@/components/office/format";
import { KindIcon } from "@/components/office/NotificationBell";
import { MarkAllRead } from "@/components/office/MarkAllRead";
import { Pagination } from "@/components/office/Pagination";
import { Card, Empty, PageHeader, Pill } from "@/components/office/ui";
import { NOTIFICATION_KINDS } from "@/collections/Notifications";
import { upcomingFor } from "@/features/office/notifications";
import { dateRange, findPage, listParams, textSearch, type Params } from "@/features/office/query";
import { officeUser } from "@/features/office/session";
import { cn } from "@/lib/utils";
import type { Notification } from "@/payload-types";

export const metadata = { title: "Notifications" };

const SORTS = { newest: "-createdAt", oldest: "createdAt" };

export default async function Notifications({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await officeUser();
  const sp = await searchParams;
  const { limit, page, sort } = listParams(sp, SORTS, "newest");
  const where: Where[] = [
    { user: { equals: user.id } },
    ...textSearch(sp.q, ["title", "body"]),
    ...dateRange(sp),
  ];
  if (sp.kind) where.push({ kind: { equals: sp.kind } });
  if (sp.state === "unread") where.push({ readAt: { exists: false } });
  if (sp.state === "read") where.push({ readAt: { exists: true } });
  const [result, upcoming] = await Promise.all([
    findPage<Notification>(user, "notifications", { where, sort, page, limit, depth: 0 }),
    upcomingFor(user as never),
  ]);

  return (
    <div className="office-page grid gap-5">
      <PageHeader
        title="Notifications"
        subtitle="New requests and applicants, assignments, and what's coming up."
        actions={<MarkAllRead />}
      />
      {upcoming.length > 0 && (
        <Card title={`Coming up · ${upcoming.length}`}>
          <ul className="office-stagger grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((u) => (
              <li key={u.key}>
                <Link
                  href={u.href}
                  className="flex h-full items-start gap-3 rounded-xl border border-subtle p-3 transition-colors hover:border-strong"
                >
                  <KindIcon kind={u.kind} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-sm font-medium">{u.title}</span>
                    <span className="block text-[0.75rem] text-fg-muted">{u.body}</span>
                  </span>
                  <Pill tone={u.tone === "late" ? "red" : u.tone === "warn" ? "orange" : "blue"}>
                    {u.tone === "late" ? "overdue" : u.tone === "warn" ? "soon" : "upcoming"}
                  </Pill>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <FilterBar
        fields={[
          { kind: "search", name: "q", placeholder: "Search notifications…" },
          {
            kind: "select",
            name: "kind",
            label: "Type",
            options: NOTIFICATION_KINDS.map((k) => ({ value: k, label: titleCase(k) })),
          },
          {
            kind: "select",
            name: "state",
            label: "State",
            options: [
              { value: "unread", label: "Unread" },
              { value: "read", label: "Read" },
            ],
          },
          { kind: "date", name: "from", label: "From" },
          { kind: "date", name: "to", label: "To" },
        ]}
        sorts={[
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
        ]}
      />
      {!result.totalDocs ? (
        <Empty
          title="No notifications"
          body="New requests, applicants and assignments show up here."
        />
      ) : (
        <Card pad={false}>
          <ul className="divide-y divide-[var(--border-subtle)]">
            {result.docs.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href ?? "/office"}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--bg-sunken)] sm:px-5",
                    !n.readAt && "bg-[color-mix(in_oklab,var(--accent-primary)_5%,transparent)]",
                  )}
                >
                  <KindIcon kind={n.kind} size={34} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-body-sm", !n.readAt && "font-semibold")}>
                      {n.title}
                    </span>
                    {n.body && (
                      <span className="block truncate text-[0.8125rem] text-fg-muted">
                        {n.body}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-[0.75rem] text-fg-muted">
                    {timeAgo(n.createdAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Pagination
        path="/office/notifications"
        params={sp}
        page={result.page}
        totalPages={result.totalPages}
        totalDocs={result.totalDocs}
        limit={result.limit}
      />
    </div>
  );
}
