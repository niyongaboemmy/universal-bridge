import { sql } from "@payloadcms/db-postgres";
import { Clock, Globe, MailQuestion, UserCheck } from "lucide-react";
import type { Where } from "payload";
import {
  InviteButton,
  MemberRoleSelect,
  RolePicker,
  StaffActions,
} from "@/components/office/AccountControls";
import { Avatar } from "@/components/office/Avatar";
import { FilterBar } from "@/components/office/FilterBar";
import { fmtDate, timeAgo } from "@/components/office/format";
import { Pagination } from "@/components/office/Pagination";
import { Card, Empty, PageHeader, Pill, Stat, Tabs } from "@/components/office/ui";
import { findPage, listHref, listParams, textSearch, type Params } from "@/features/office/query";
import { allowed, requireArea } from "@/features/office/session";
import { payload } from "@/lib/cms/payload";
import { nowMs } from "@/lib/time/office-hours";
import type { Member, Role, User } from "@/payload-types";

export const metadata = { title: "Accounts" };

const SORTS = { name: "name", newest: "-createdAt", recent: "-lastLoginAt", email: "email" };

export default async function Accounts({ searchParams }: { searchParams: Promise<Params> }) {
  const user = await requireArea("users");
  const sp = await searchParams;
  const tab = sp.tab === "members" && allowed(user, "members.manage") ? "members" : "staff";
  const canStaff = allowed(user, "users.manage");
  const { limit, page, sort } = listParams(sp, SORTS, "name");
  const p = await payload();
  const now = nowMs();
  const week = new Date(now - 7 * 86_400_000).toISOString();

  const where: Where[] = [...textSearch(sp.q, ["name", "email"])];
  if (sp.role) where.push({ [tab === "staff" ? "roles" : "role"]: { equals: Number(sp.role) } });
  if (sp.state === "active") where.push({ lastLoginAt: { greater_than: week } });
  if (sp.state === "never") where.push({ lastLoginAt: { exists: false } });
  if (sp.state === "locked")
    where.push({ lockUntil: { greater_than: new Date(now).toISOString() } });

  const [roles, stats, result] = await Promise.all([
    p.find({ collection: "roles", limit: 100, depth: 0, pagination: false, sort: "createdAt" }),
    p.db.drizzle.execute(sql`
      select (select count(*) from users)::int as staff,
             (select count(*) from users where last_login_at > now() - interval '7 days')::int as active,
             (select count(*) from users where last_login_at is null)::int as pending,
             (select count(*) from members)::int as members,
             (select count(*) from members where created_at > now() - interval '30 days')::int as new_members`),
    tab === "staff"
      ? findPage<User>(user, "users", { where, sort, page, limit, depth: 1 })
      : findPage<Member>(user, "members", { where, sort, page, limit, depth: 1 }),
  ]);
  const s = stats.rows[0] as {
    staff: number;
    active: number;
    pending: number;
    members: number;
    new_members: number;
  };
  const roleOpts = (roles.docs as Role[])
    .filter((r) => r.audience === (tab === "staff" ? "staff" : "member"))
    .map((r) => ({ id: r.id, name: r.name, color: r.color, slug: r.slug ?? "" }));
  const base = (t?: string) => listHref("/office/accounts", { tab: t });

  return (
    <div className="office-page grid gap-5">
      <PageHeader
        title="Accounts"
        subtitle="Staff who use the office and the CMS, and people registered on the website."
        actions={
          canStaff && tab === "staff" ? (
            <InviteButton roles={roleOpts} open={sp.invite === "1"} />
          ) : undefined
        }
      />
      <div className="office-stagger grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Staff" value={s.staff} icon={<UserCheck />} href={base()} />
        <Stat
          label="Active · 7 days"
          value={s.active}
          icon={<Clock />}
          tone="good"
          href={listHref("/office/accounts", { state: "active" })}
        />
        <Stat
          label="Invited, not signed in yet"
          value={s.pending}
          icon={<MailQuestion />}
          href={listHref("/office/accounts", { state: "never" })}
        />
        <Stat
          label="Website members"
          value={s.members}
          icon={<Globe />}
          hint={`${s.new_members} new · 30 days`}
          href={base("members")}
        />
      </div>
      <Tabs
        current={base(tab === "members" ? "members" : undefined)}
        items={[
          { href: base(), label: "Staff", count: s.staff },
          ...(allowed(user, "members.manage")
            ? [{ href: base("members"), label: "Website members", count: s.members }]
            : []),
        ]}
      />
      <FilterBar
        keep={["tab"]}
        fields={[
          { kind: "search", name: "q", placeholder: "Search name or email…" },
          {
            kind: "select",
            name: "role",
            label: "Role",
            options: roleOpts.map((r) => ({ value: String(r.id), label: r.name })),
          },
          {
            kind: "select",
            name: "state",
            label: "Status",
            options: [
              { value: "active", label: "Active this week" },
              { value: "never", label: "Never signed in" },
              { value: "locked", label: "Locked" },
            ],
          },
        ]}
        sorts={[
          { value: "name", label: "Name A–Z" },
          { value: "recent", label: "Recently active" },
          { value: "newest", label: "Newest" },
        ]}
        perPage
      />
      {!result.totalDocs ? (
        <Empty title="Nobody matches" body="Change or clear the filters." />
      ) : (
        <Card pad={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-body-sm">
              <thead className="text-[0.75rem] text-fg-muted uppercase">
                <tr className="border-b border-subtle">
                  {["Person", tab === "staff" ? "Roles" : "Role", "Last active", "Since", ""].map(
                    (h) => (
                      <th key={h} className="px-4 py-2.5 font-medium">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {result.docs.map((d) => {
                  const u = d as (User | Member) & { lockUntil?: string | null };
                  const locked = Boolean(u.lockUntil && new Date(u.lockUntil).getTime() > now);
                  return (
                    <tr key={u.id} className="hover:bg-[var(--bg-sunken)]">
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-3">
                          <Avatar name={u.name || u.email} image={u.avatar} size={34} />
                          <span className="min-w-0">
                            <span className="block truncate font-medium">
                              {u.name}
                              {u.id === user.id && tab === "staff" && (
                                <span className="ml-1.5 text-fg-muted">(you)</span>
                              )}
                            </span>
                            <span className="block truncate text-[0.8125rem] text-fg-muted">
                              {"jobTitle" in u && u.jobTitle ? `${u.jobTitle} · ` : ""}
                              {u.email}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {tab === "staff" ? (
                          <RolePicker
                            userId={u.id}
                            roles={roleOpts}
                            value={((u as User).roles ?? []).map((r) =>
                              typeof r === "object" ? r.id : r,
                            )}
                            disabled={!canStaff}
                          />
                        ) : (
                          <MemberRoleSelect
                            id={u.id}
                            roles={roleOpts}
                            value={
                              typeof (u as Member).role === "object"
                                ? ((u as Member).role as Role).id
                                : ((u as Member).role as number | null)
                            }
                          />
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-fg-secondary">
                        {locked ? (
                          <Pill tone="red">locked</Pill>
                        ) : u.lastLoginAt ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={
                                new Date(u.lastLoginAt).getTime() > now - 86_400_000
                                  ? "size-2 rounded-full bg-success"
                                  : "size-2 rounded-full bg-[var(--border-strong)]"
                              }
                            />
                            {timeAgo(u.lastLoginAt, now)}
                          </span>
                        ) : (
                          <Pill tone="orange">{tab === "staff" ? "invited" : "never"}</Pill>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-fg-muted">{fmtDate(u.createdAt)}</td>
                      <td className="px-4 py-2">
                        {tab === "staff" && canStaff && (
                          <StaffActions id={u.id} locked={locked} self={u.id === user.id} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      <Pagination
        path="/office/accounts"
        params={sp}
        page={result.page}
        totalPages={result.totalPages}
        totalDocs={result.totalDocs}
        limit={result.limit}
      />
    </div>
  );
}
