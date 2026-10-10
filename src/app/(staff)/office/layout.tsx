/* eslint-disable @next/next/no-html-link-for-pages -- /admin and the public site are separate root layouts. */
import { sql } from "@payloadcms/db-postgres";
import {
  BarChart3,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LogOut,
  MonitorPlay,
  PanelsTopLeft,
  DoorOpen,
  ScrollText,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { CommandPalette, PaletteTrigger } from "@/components/office/CommandPalette";
import { MobileNav, OfficeNav, type NavItem } from "@/components/office/Nav";
import { NotificationBell } from "@/components/office/NotificationBell";
import { RoleSwitcher } from "@/components/office/RoleSwitcher";
import { UserMenu } from "@/components/office/UserMenu";
import { ThemeSwitch } from "@/components/office/ThemeSwitch";
import { Toaster } from "@/components/office/Toaster";
import { Avatar } from "@/components/office/Avatar";
import { allowed, can, officeUser, roleNames, type Area } from "@/features/office/session";
import { signOut } from "@/features/staff-auth/actions";
import { payload } from "@/lib/cms/payload";
import { settings } from "@/lib/settings";

export const metadata: Metadata = {
  title: { default: "Company dashboard", template: "%s · UB Office" },
  robots: { index: false },
};
export const dynamic = "force-dynamic";

async function badges() {
  const db = (await payload()).db.drizzle;
  const [r] = (
    await db.execute(sql`
      select
        (select count(*) from leads where status = 'new' and department = 'sales' and coalesce(product,'') = '')::int as requests,
        (select count(*) from leads where status = 'new' and coalesce(product,'') <> '')::int as demos,
        (select count(*) from leads where status = 'new' and department <> 'sales' and coalesce(product,'') = '')::int as messages,
        (select count(*) from applications where status = 'received')::int as applicants,
        (select count(*) from openings where status = 'open' and (closes_at is null or closes_at > now()))::int as openings`)
  ).rows as {
    requests: number;
    demos: number;
    messages: number;
    applicants: number;
    openings: number;
  }[];
  return r!;
}

/**
 * Company dashboard (/office): running the company, next to the content admin.
 * Staff only; each section shows only for the roles that use it.
 */
export default async function OfficeLayout({ children }: { children: ReactNode }) {
  const user = await officeUser();
  const [b, system] = await Promise.all([badges(), settings()]);
  const item = (area: Area, href: string, label: string, icon: ReactNode, count?: number) =>
    can(user, area) ? [{ href, label, icon, count }] : [];
  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: "Company",
      items: [{ href: "/office", label: "Overview", icon: <LayoutDashboard aria-hidden /> }],
    },
    {
      label: "Clients",
      items: [
        ...item(
          "requests",
          "/office/requests",
          "Service requests",
          <Briefcase aria-hidden />,
          b.requests,
        ),
        ...item("demos", "/office/demos", "Demo requests", <MonitorPlay aria-hidden />, b.demos),
        ...item("messages", "/office/messages", "Messages", <Inbox aria-hidden />, b.messages),
      ],
    },
    {
      label: "Talent",
      items: [
        ...item("openings", "/office/openings", "Openings", <DoorOpen aria-hidden />, b.openings),
        ...item(
          "applicants",
          "/office/applicants",
          "Applicants",
          <GraduationCap aria-hidden />,
          b.applicants,
        ),
        ...item("people", "/office/people", "Employees", <Users aria-hidden />),
      ],
    },
    {
      label: "Work",
      items: [
        ...item("projects", "/office/projects", "Projects & tools", <FolderKanban aria-hidden />),
        ...item("analytics", "/office/analytics", "Website analytics", <BarChart3 aria-hidden />),
      ],
    },
    {
      label: "Administration",
      items: [
        ...item("users", "/office/accounts", "Accounts", <UserCog aria-hidden />),
        ...item("roles", "/office/roles", "Roles & permissions", <ShieldCheck aria-hidden />),
        ...item("audit", "/office/logs", "System logs", <ScrollText aria-hidden />),
        ...item("settings", "/office/settings", "Settings", <Settings aria-hidden />),
      ],
    },
  ].filter((g) => g.items.length);

  // Command palette: the same pages (with "g x" shortcuts) and quick actions.
  const KEYS: Record<string, string> = {
    "/office": "g o",
    "/office/requests": "g r",
    "/office/demos": "g d",
    "/office/messages": "g m",
    "/office/applicants": "g a",
    "/office/people": "g e",
    "/office/projects": "g p",
    "/office/analytics": "g w",
    "/office/openings": "g n",
    "/office/accounts": "g u",
    "/office/roles": "g k",
    "/office/logs": "g l",
    "/office/settings": "g s",
  };
  const pages = groups.flatMap((g) =>
    g.items.map((i) => ({
      id: i.href,
      group: "Go to",
      label: i.label,
      href: i.href,
      keys: KEYS[i.href],
    })),
  );
  pages.push(
    { id: "/office/search", group: "Go to", label: "Search everything", href: "/office/search", keys: undefined },
    { id: "/office/notifications", group: "Go to", label: "Notifications", href: "/office/notifications", keys: undefined },
  );
  const actions = [
    ...(allowed(user, "projects.manage")
      ? [
          {
            id: "new-project",
            group: "Actions",
            label: "New project",
            href: "/office/projects/new",
          },
        ]
      : []),
    ...(can(user, "people")
      ? [
          {
            id: "new-employee",
            group: "Actions",
            label: "Add employee",
            href: "/office/people/new",
          },
        ]
      : []),
    ...(allowed(user, "openings.manage")
      ? [
          {
            id: "new-opening",
            group: "Actions",
            label: "New opening",
            href: "/office/openings/new",
          },
        ]
      : []),
    ...(allowed(user, "users.manage")
      ? [
          {
            id: "invite",
            group: "Actions",
            label: "Invite a staff member",
            href: "/office/accounts?invite=1",
          },
        ]
      : []),
    { id: "profile", group: "Actions", label: "My profile", href: "/office/profile" },
    ...(can(user, "cms")
      ? [{ id: "cms", group: "Actions", label: "Open the content admin (CMS)", href: "/admin" }]
      : []),
    {
      id: "live",
      group: "Actions",
      label: "Edit the website live",
      href: "/api/live-edit/enable?path=/",
    },
    { id: "site", group: "Actions", label: "View the website", href: "/" },
  ];

  const sideLinks = (
    <div className="grid gap-0.5 text-body-sm">
      {can(user, "cms") && (
        <a
          href="/admin"
          className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-white/70 hover:text-white"
        >
          <PanelsTopLeft className="size-4" aria-hidden /> Content (CMS)
        </a>
      )}
      <a
        href="/"
        className="flex items-center gap-2 rounded-lg px-1 py-1.5 text-white/70 hover:text-white"
      >
        <MonitorPlay className="size-4" aria-hidden /> View the website
      </a>
      <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-white/6 p-2">
        <Link
          href="/office/profile"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg hover:opacity-90"
        >
          <Avatar name={user.name || user.email} image={user.avatar} size={34} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{user.name || user.email}</span>
            <span className="block truncate text-[0.75rem] text-white/55">{roleNames(user)}</span>
          </span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            aria-label="Sign out"
            className="grid size-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
  const multi = (user.allRoles?.length ?? 0) > 1;

  return (
    <div className="min-h-dvh bg-[var(--bg-canvas)] lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="office-sidebar hidden bg-[var(--ub-navy-900)] text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <a href="/office" aria-label="Company dashboard home">
            <Logo variant="white" compact />
          </a>
          <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[0.6875rem] tracking-[0.16em] uppercase">
            Office
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 [scrollbar-width:thin]">
          <OfficeNav groups={groups} />
        </div>
        <div className="border-t border-white/10 px-4 py-4">{sideLinks}</div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-subtle bg-[color-mix(in_oklab,var(--bg-canvas)_82%,transparent)] px-3 py-2.5 backdrop-blur-md sm:gap-3 sm:px-8">
          <MobileNav groups={groups} footer={sideLinks} />
          <PaletteTrigger />
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {multi && (
              <RoleSwitcher
                roles={(user.allRoles ?? []).map((r) => ({
                  id: r.id,
                  name: r.name,
                  color: r.color,
                  description: r.description,
                }))}
                active={user.actingRole?.id ?? null}
              />
            )}
            <NotificationBell />
            <span className="hidden sm:block">
              <ThemeSwitch />
            </span>
            <UserMenu
              avatar={<Avatar name={user.name || user.email} image={user.avatar} size={36} />}
              name={user.name || user.email}
              email={user.email}
              roles={user.actingRole ? `Working as ${user.actingRole.name}` : roleNames(user)}
              cms={can(user, "cms")}
            />
          </div>
        </header>
        {system.maintenance.on && (
          <div className="flex flex-wrap items-center gap-2 border-b border-[color-mix(in_oklab,var(--danger)_30%,transparent)] bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] px-4 py-1.5 text-[0.8125rem] text-danger sm:px-8">
            <span className="size-2 animate-pulse rounded-full bg-current" />
            <strong>Maintenance mode is on.</strong> Visitors see the “back soon” page.
            {can(user, "settings") && (
              <Link href="/office/settings?s=site" className="font-semibold underline underline-offset-2">
                Turn it off
              </Link>
            )}
          </div>
        )}
        {user.actingRole && (
          <div className="flex flex-wrap items-center gap-2 border-b border-subtle bg-accent-soft px-4 py-1.5 text-[0.8125rem] text-accent sm:px-8">
            <span className="size-2 rounded-full bg-current" />
            Working as <strong>{user.actingRole.name}</strong> — pages and actions follow this role
            only.
          </div>
        )}
        {/* Page grids get a shrinkable column, so wide boards scroll inside instead of widening the page. */}
        <main className="min-w-0 px-4 py-6 sm:px-8 lg:py-7 [&>.office-page>.grid]:grid-cols-[minmax(0,1fr)]">
          {children}
        </main>
      </div>
      <CommandPalette pages={pages} actions={actions} />
      <Toaster />
    </div>
  );
}
