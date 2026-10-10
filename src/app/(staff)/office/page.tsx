import { DoorOpen, FolderPlus, Search, ShieldCheck, UserPlus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { SectionSkeleton } from "@/components/office/charts";
import { titleCase } from "@/components/office/format";
import { btn } from "@/components/office/ui";
import {
  ActivitySection,
  ClientsSection,
  IncomingChart,
  KpiRow,
  TalentSection,
  WebsiteSection,
  WorkSection,
  YourDay,
} from "@/features/office/OverviewSections";
import { allowed, officeUser, roleNames } from "@/features/office/session";
import { nowMs } from "@/lib/time/office-hours";

export const metadata = { title: "Overview" };

/**
 * The office home: what matters for this person's role, in pictures. Each section
 * streams in on its own, so the page appears at once and fills as data arrives.
 */
export default async function Overview({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const user = await officeUser();
  const denied = (await searchParams).denied;
  const now = new Date(nowMs());
  const hour = Number(
    now.toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Africa/Kigali" }),
  );
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Kigali",
  });
  const quick = [
    allowed(user, "openings.manage") && {
      href: "/office/openings/new",
      label: "New opening",
      icon: <DoorOpen />,
    },
    allowed(user, "projects.manage") && {
      href: "/office/projects/new",
      label: "New project",
      icon: <FolderPlus />,
    },
    allowed(user, "users.manage") && {
      href: "/office/accounts?invite=1",
      label: "Invite staff",
      icon: <UserPlus />,
    },
    allowed(user, "roles.manage") && {
      href: "/office/roles",
      label: "Roles",
      icon: <ShieldCheck />,
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <div className="office-page grid gap-6">
      <header className="relative overflow-hidden rounded-2xl border border-subtle bg-surface p-5 shadow-1 sm:p-6">
        <div
          aria-hidden
          className="login-aurora absolute inset-y-0 right-0 w-1/2 opacity-[0.08] [mask-image:linear-gradient(90deg,transparent,#000)] [[data-theme=dark]_&]:opacity-40"
        />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.8125rem] text-fg-muted">{today}</p>
            <h1 className="mt-1 font-display text-heading-lg tracking-tight sm:text-[1.75rem]">
              {greeting}, {(user.name || user.email).split(" ")[0]}
            </h1>
            <p className="mt-1.5 inline-flex flex-wrap items-center gap-2 text-[0.8125rem] text-fg-secondary">
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-medium text-accent">
                {user.actingRole ? `Working as ${user.actingRole.name}` : roleNames(user)}
              </span>
              Your overview follows what your role covers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" data-open-palette className={btn}>
              <Search className="size-4" aria-hidden /> Search
            </button>
            {quick.map((q) => (
              <Link key={q.href} href={q.href} className={`${btn} [&_svg]:size-4`}>
                {q.icon} {q.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {denied && (
        <p
          role="alert"
          className="rounded-xl border border-[color-mix(in_oklab,var(--danger)_30%,transparent)] bg-[color-mix(in_oklab,var(--danger)_8%,transparent)] px-4 py-3 text-body-sm"
        >
          Your role doesn&apos;t include <strong>{titleCase(denied)}</strong>. Ask an administrator
          if you need it.
        </p>
      )}

      <Suspense fallback={<div className="office-skeleton h-36" />}>
        <KpiRow user={user} />
      </Suspense>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Suspense fallback={<div className="office-skeleton h-72" />}>
          <IncomingChart user={user} />
        </Suspense>
        <Suspense fallback={<div className="office-skeleton h-72" />}>
          <YourDay user={user} />
        </Suspense>
      </div>

      <Suspense fallback={<SectionSkeleton rows={1} />}>
        <ClientsSection user={user} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton rows={1} />}>
        <TalentSection user={user} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton rows={1} />}>
        <WorkSection user={user} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton rows={1} />}>
        <WebsiteSection user={user} />
      </Suspense>
      <Suspense fallback={<SectionSkeleton rows={1} />}>
        <ActivitySection user={user} />
      </Suspense>
    </div>
  );
}
