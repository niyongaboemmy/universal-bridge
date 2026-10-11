"use client";

import {
  Bell,
  Briefcase,
  CalendarClock,
  CheckCheck,
  DoorOpen,
  FolderKanban,
  GraduationCap,
  Inbox,
  MonitorPlay,
  UserCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { timeAgo } from "./format";
import { Popover } from "./Popover";
import { toast } from "./Toaster";

type Item = {
  id: number;
  kind: string;
  title: string;
  body?: string | null;
  href?: string | null;
  read: boolean;
  at: string;
};
type Up = {
  key: string;
  kind: string;
  title: string;
  body: string;
  href: string;
  due?: string;
  tone: "warn" | "info" | "late";
};

export const KIND_ICON: Record<string, { icon: React.ReactNode; color: string }> = {
  request: { icon: <Briefcase />, color: "#0145b8" },
  demo: { icon: <MonitorPlay />, color: "#7a4de0" },
  message: { icon: <Inbox />, color: "#0e7490" },
  application: { icon: <GraduationCap />, color: "#0f8a6a" },
  assignment: { icon: <UserCheck />, color: "#fe760d" },
  opening: { icon: <DoorOpen />, color: "#b7791f" },
  project: { icon: <FolderKanban />, color: "#be185d" },
  account: { icon: <UserPlus />, color: "#64748b" },
  system: { icon: <Bell />, color: "#64748b" },
  followup: { icon: <CalendarClock />, color: "#fe760d" },
  overdue: { icon: <CalendarClock />, color: "#dc2626" },
  intake: { icon: <GraduationCap />, color: "#0145b8" },
  review: { icon: <GraduationCap />, color: "#b7791f" },
};

export function KindIcon({ kind, size = 32 }: { kind: string; size?: number }) {
  const k = KIND_ICON[kind] ?? KIND_ICON.system!;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full text-white [&_svg]:size-[45%]"
      style={{ width: size, height: size, background: k.color }}
    >
      {k.icon}
    </span>
  );
}

/** Office notifications: new things for you, and what's coming up. Polls every 45 s. */
export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"new" | "upcoming">("new");
  const [data, setData] = useState<{ unread: number; items: Item[]; upcoming: Up[] } | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const seen = useRef<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/office/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const next = (await res.json()) as { unread: number; items: Item[]; upcoming: Up[] };
      const newest = next.items[0]?.id ?? 0;
      // Something arrived since the last check: say so.
      if (seen.current !== null && newest > seen.current) {
        const fresh = next.items.filter((i) => i.id > seen.current! && !i.read);
        if (fresh[0])
          toast(fresh.length > 1 ? `${fresh.length} new notifications` : fresh[0].title);
      }
      seen.current = Math.max(seen.current ?? 0, newest);
      setData(next);
    } catch {
      /* offline */
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- first load after mount
    load();
    const t = setInterval(load, 45_000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const markRead = async (body: { ids?: number[]; all?: boolean }) => {
    setData((d) =>
      d
        ? {
            ...d,
            unread: body.all ? 0 : Math.max(0, d.unread - (body.ids?.length ?? 0)),
            items: d.items.map((i) =>
              body.all || body.ids?.includes(i.id) ? { ...i, read: true } : i,
            ),
          }
        : d,
    );
    await fetch("/api/office/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
  };

  const urgent = data?.upcoming.filter((u) => u.tone === "late").length ?? 0;
  const badge = (data?.unread ?? 0) + urgent;
  const go = async (href?: string | null, id?: number) => {
    if (id) await markRead({ ids: [id] });
    setOpen(false);
    if (href) {
      window.dispatchEvent(new Event("office:nav"));
      router.push(href);
    }
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) {
            load();
            // Nothing new but things are due: show those first.
            setTab(!data?.unread && data?.upcoming.length ? "upcoming" : "new");
          }
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={badge ? `Notifications, ${badge} new` : "Notifications"}
        className="relative grid size-10 shrink-0 place-items-center rounded-full border border-subtle bg-surface shadow-1 transition-colors hover:border-strong"
      >
        <Bell className={cn("size-[18px]", badge > 0 && "office-ring")} aria-hidden />
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--ub-orange-500)] px-1 text-[0.6875rem] font-bold text-[var(--ub-navy-900)] ring-2 ring-[var(--bg-canvas)] tabular-nums">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </button>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchor={trigger}
        align="end"
        width={380}
        label="Notifications"
        className="p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b border-subtle px-3.5 py-2.5">
          <div role="tablist" className="flex gap-1">
            {(
              [
                ["new", "New", data?.unread ?? 0],
                ["upcoming", "Upcoming", data?.upcoming.length ?? 0],
              ] as const
            ).map(([k, l, n]) => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className="rounded-lg px-2.5 py-1 text-[0.8125rem] font-medium text-fg-secondary transition-colors aria-selected:bg-accent-soft aria-selected:text-accent"
              >
                {l}
                {n > 0 && <span className="ml-1.5 tabular-nums opacity-70">{n}</span>}
              </button>
            ))}
          </div>
          {tab === "new" && (data?.unread ?? 0) > 0 && (
            <button
              type="button"
              onClick={() => markRead({ all: true })}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[0.75rem] font-medium text-accent hover:bg-accent-soft"
            >
              <CheckCheck className="size-3.5" aria-hidden /> Mark all read
            </button>
          )}
        </div>
        <ul className="max-h-[min(26rem,60vh)] overflow-y-auto p-1.5">
          {!data && (
            <li className="grid gap-2 p-2">
              {[0, 1, 2].map((i) => (
                <span key={i} className="office-skeleton h-12" />
              ))}
            </li>
          )}
          {data && tab === "new" && !data.items.length && (
            <li className="px-4 py-10 text-center text-body-sm text-fg-muted">
              You&apos;re all caught up.
            </li>
          )}
          {data && tab === "upcoming" && !data.upcoming.length && (
            <li className="px-4 py-10 text-center text-body-sm text-fg-muted">Nothing due soon.</li>
          )}
          {data &&
            tab === "new" &&
            data.items.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => go(n.href, n.read ? undefined : n.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-sunken)]",
                    !n.read && "bg-[color-mix(in_oklab,var(--accent-primary)_6%,transparent)]",
                  )}
                >
                  <KindIcon kind={n.kind} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-body-sm", !n.read && "font-semibold")}>
                      {n.title}
                    </span>
                    {n.body && (
                      <span className="block truncate text-[0.75rem] text-fg-muted">{n.body}</span>
                    )}
                    <span className="text-[0.6875rem] text-fg-muted">{timeAgo(n.at)}</span>
                  </span>
                  {!n.read && (
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--accent-primary)]"
                      aria-label="Unread"
                    />
                  )}
                </button>
              </li>
            ))}
          {data &&
            tab === "upcoming" &&
            data.upcoming.map((u) => (
              <li key={u.key}>
                <button
                  type="button"
                  onClick={() => go(u.href)}
                  className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-sunken)]"
                >
                  <KindIcon kind={u.kind} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-body-sm font-medium">{u.title}</span>
                    <span className="block truncate text-[0.75rem] text-fg-muted">
                      {u.body}
                      {u.due
                        ? ` · ${new Date(u.due).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                        : ""}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "mt-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold",
                      u.tone === "late"
                        ? "bg-[color-mix(in_oklab,var(--danger)_14%,transparent)] text-danger"
                        : u.tone === "warn"
                          ? "bg-[color-mix(in_oklab,var(--accent-spark)_16%,transparent)] text-[var(--accent-spark-text)]"
                          : "bg-accent-soft text-accent",
                    )}
                  >
                    {u.tone === "late" ? "overdue" : u.tone === "warn" ? "soon" : "upcoming"}
                  </span>
                </button>
              </li>
            ))}
        </ul>
        <Link
          href="/office/notifications"
          onClick={() => setOpen(false)}
          className="block border-t border-subtle px-3.5 py-2.5 text-center text-[0.8125rem] font-medium text-accent hover:bg-[var(--bg-sunken)]"
        >
          See all notifications
        </Link>
      </Popover>
    </>
  );
}
