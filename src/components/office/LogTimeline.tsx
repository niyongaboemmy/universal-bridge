import { ArrowRight, ChevronDown, Globe, Laptop, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { describe, isAlert, LOG_CATEGORIES, type LogEntry } from "@/features/office/logs";
import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";

const dayKey = (iso: string) => iso.slice(0, 10);

function dayLabel(key: string, today: string, yesterday: string) {
  if (key === today) return "Today";
  if (key === yesterday) return "Yesterday";
  return new Date(`${key}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Kigali",
  });

/**
 * Activity as a readable timeline grouped by day: avatar, "who did what to which",
 * status changes as from → to, and the technical details one click away.
 */
export function LogTimeline({
  entries,
  avatars = {},
  now,
}: {
  entries: (LogEntry & { actorId?: number | null })[];
  avatars?: Record<number, unknown>;
  now: number;
}) {
  const today = dayKey(new Date(now).toISOString());
  const yesterday = dayKey(new Date(now - 86_400_000).toISOString());
  const days = new Map<string, typeof entries>();
  for (const e of entries) {
    const k = dayKey(e.at);
    if (!days.has(k)) days.set(k, []);
    days.get(k)!.push(e);
  }
  return (
    <div className="grid gap-6">
      {[...days.entries()].map(([key, list]) => (
        <section key={key}>
          <h3 className="sticky top-14 z-10 mb-2 inline-flex rounded-full bg-[var(--bg-canvas)] py-1 pr-3 text-[0.75rem] font-semibold tracking-wide text-fg-muted uppercase">
            {dayLabel(key, today, yesterday)} · {list.length}
          </h3>
          <ol className="office-stagger relative grid gap-1 before:absolute before:top-2 before:bottom-2 before:left-[1.2rem] before:w-px before:bg-[var(--border-subtle)]">
            {list.map((e) => {
              const d = describe(e);
              const cat = LOG_CATEGORIES[d.category];
              const alert = isAlert(e);
              return (
                <li key={e.id}>
                  <details className="group rounded-xl transition-colors open:bg-surface open:shadow-1 hover:bg-[var(--bg-sunken)] open:hover:bg-surface">
                    <summary className="flex cursor-pointer list-none items-start gap-3 px-2 py-2 [&::-webkit-details-marker]:hidden">
                      <span className="relative z-[1] mt-0.5">
                        <Avatar
                          name={d.actor}
                          image={e.actorId ? avatars[e.actorId] : undefined}
                          size={28}
                          className="ring-2 ring-[var(--bg-canvas)]"
                        />
                        <span
                          aria-hidden
                          className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-[var(--bg-canvas)]"
                          style={{ background: cat.color }}
                        />
                      </span>
                      <span className="min-w-0 flex-1 text-body-sm leading-relaxed">
                        <strong className="font-semibold">{d.actor}</strong>{" "}
                        <span className="text-fg-secondary">{d.verb}</span>{" "}
                        {d.target &&
                          (d.href ? (
                            <Link
                              href={d.href}
                              className="rounded-md bg-accent-soft px-1.5 py-0.5 font-medium text-accent hover:underline"
                            >
                              {d.target}
                            </Link>
                          ) : (
                            <span className="rounded-md bg-[var(--bg-sunken)] px-1.5 py-0.5 font-medium">
                              {d.target}
                            </span>
                          ))}
                        {d.change && (
                          <span className="ml-1.5 inline-flex items-center gap-1 align-middle text-[0.75rem]">
                            <span className="rounded-full bg-[var(--bg-sunken)] px-2 py-0.5 capitalize">
                              {d.change.from}
                            </span>
                            <ArrowRight className="size-3 text-fg-muted" aria-label="to" />
                            <span
                              className="rounded-full px-2 py-0.5 font-medium text-white capitalize"
                              style={{ background: cat.color }}
                            >
                              {d.change.to}
                            </span>
                          </span>
                        )}
                        {d.detail && (
                          <span className="block truncate text-[0.75rem] text-fg-muted">
                            {d.detail}
                          </span>
                        )}
                      </span>
                      {alert && (
                        <TriangleAlert
                          className="mt-1 size-4 shrink-0 text-[var(--accent-spark-text)]"
                          aria-label="Worth a look"
                        />
                      )}
                      <time
                        dateTime={e.at}
                        className="mt-0.5 shrink-0 text-[0.75rem] text-fg-muted tabular-nums"
                      >
                        {time(e.at)}
                      </time>
                      <ChevronDown
                        className="mt-1 size-4 shrink-0 text-fg-muted transition-transform group-open:rotate-180"
                        aria-hidden
                      />
                    </summary>
                    <dl className="grid gap-x-6 gap-y-1.5 px-12 pb-3 text-[0.75rem] sm:grid-cols-2">
                      <Row k="Category">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-2 rounded-full" style={{ background: cat.color }} />
                          {cat.label}
                        </span>
                      </Row>
                      <Row k="When">
                        {new Date(e.at).toLocaleString("en-GB", { timeZone: "Africa/Kigali" })}{" "}
                        (Kigali)
                      </Row>
                      <Row k="Action">
                        <code className="font-mono">{e.action}</code>
                      </Row>
                      <Row k="Record">
                        <code className="font-mono">
                          {e.entity}
                          {e.entityId ? ` #${e.entityId}` : ""}
                        </code>
                      </Row>
                      {e.ip && (
                        <Row k="Network">
                          <span className="inline-flex items-center gap-1">
                            <Globe className="size-3" aria-hidden /> {e.ip}
                          </span>
                        </Row>
                      )}
                      {e.device && (
                        <Row k="Device">
                          <span className="inline-flex items-center gap-1">
                            <Laptop className="size-3" aria-hidden /> {e.device}
                          </span>
                        </Row>
                      )}
                    </dl>
                  </details>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex gap-2")}>
      <dt className="w-16 shrink-0 text-fg-muted">{k}</dt>
      <dd className="min-w-0 text-fg-secondary">{children}</dd>
    </div>
  );
}
