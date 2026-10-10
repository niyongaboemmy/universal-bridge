"use client";

import { LogOut, MonitorPlay, PanelsTopLeft, UserRound } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { signOut } from "@/features/staff-auth/actions";
import { Popover } from "./Popover";

/** Avatar button in the top bar: profile, CMS, website, sign out. */
export function UserMenu({
  avatar,
  name,
  email,
  roles,
  cms,
}: {
  avatar: ReactNode;
  name: string;
  email: string;
  roles: string;
  cms: boolean;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const item =
    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-body-sm transition-colors hover:bg-[var(--bg-sunken)] [&_svg]:size-4 [&_svg]:text-fg-muted";
  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Account menu"
        className="shrink-0 rounded-full ring-offset-2 ring-offset-[var(--bg-canvas)] transition-shadow hover:ring-2 hover:ring-[var(--border-strong)]"
      >
        {avatar}
      </button>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchor={trigger}
        align="end"
        width={260}
        label="Account"
      >
        <div className="border-b border-subtle px-2.5 pt-1.5 pb-2.5">
          <p className="truncate text-body-sm font-semibold">{name}</p>
          <p className="truncate text-[0.75rem] text-fg-muted">{email}</p>
          <p className="mt-1 truncate text-[0.75rem] text-accent">{roles}</p>
        </div>
        <div className="grid gap-0.5 pt-1.5">
          <Link href="/office/profile" onClick={() => setOpen(false)} className={item}>
            <UserRound /> My profile
          </Link>
          {cms && (
            // eslint-disable-next-line @next/next/no-html-link-for-pages -- the CMS is a separate app
            <a href="/admin" className={item}>
              <PanelsTopLeft /> Content (CMS)
            </a>
          )}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- the website is a separate app */}
          <a href="/" className={item}>
            <MonitorPlay /> View the website
          </a>
          <form action={signOut}>
            <button type="submit" className={`${item} text-danger [&_svg]:!text-danger`}>
              <LogOut /> Sign out
            </button>
          </form>
        </div>
      </Popover>
    </>
  );
}
