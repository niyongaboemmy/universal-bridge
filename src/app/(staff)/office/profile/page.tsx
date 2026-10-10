import { CalendarClock, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { PERMISSIONS, PERMISSION_GROUPS } from "@/access/permissions";
import { isSuperUser, permissionsOf } from "@/access/roles";
import { Avatar, avatarUrl } from "@/components/office/Avatar";
import { fmtDate, timeAgo } from "@/components/office/format";
import { Heatmap } from "@/components/office/Heatmap";
import { LogTimeline } from "@/components/office/LogTimeline";
import {
  AvatarUploader,
  EndSessions,
  PasswordForm,
  ProfileDetails,
} from "@/components/office/ProfileForms";
import { Card, Pill } from "@/components/office/ui";
import { activityHeatmap, listLogs } from "@/features/office/logs-data";
import { officeUser } from "@/features/office/session";
import { staffSession } from "@/lib/auth/staff-session";
import { nowMs } from "@/lib/time/office-hours";

export const metadata = { title: "My profile" };

export default async function Profile() {
  const user = await officeUser();
  const [session, heat, recent] = await Promise.all([
    staffSession(),
    activityHeatmap(user.id),
    listLogs({ actor: user.id }, 1, 12),
  ]);
  const name = user.name || user.email;
  const roles = (user.roles ?? []).filter((r) => typeof r === "object");
  const held = isSuperUser(user as never) ? null : permissionsOf(user as never);
  const now = nowMs();
  const sessions = (session?.user.sessions ?? []).filter(
    (s) => new Date(s.expiresAt).getTime() > now,
  );

  return (
    <div className="office-page grid gap-5">
      <section className="relative overflow-hidden rounded-2xl border border-subtle bg-surface shadow-1">
        <div className="login-aurora h-24 sm:h-28" aria-hidden />
        <div className="flex flex-wrap items-end gap-4 px-5 pb-5 sm:px-6">
          <Avatar
            name={name}
            image={user.avatar}
            size={88}
            className="-mt-11 ring-4 ring-[var(--bg-surface)]"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-heading-lg tracking-tight">{name}</h1>
            <p className="text-body-sm text-fg-secondary">
              {[user.jobTitle, user.email].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {roles.map((r) => (
              <Pill key={r.id} tone={r.slug === "super" ? "orange" : "blue"}>
                {r.name}
              </Pill>
            ))}
          </div>
        </div>
        <dl className="grid grid-cols-2 border-t border-subtle text-body-sm sm:grid-cols-4">
          {[
            [
              <CalendarClock key="i" />,
              "Last sign-in",
              user.lastLoginAt ? timeAgo(user.lastLoginAt) : "—",
            ],
            [<UserRound key="i" />, "Opens", user.landing === "cms" ? "Content (CMS)" : "Office"],
            [<ShieldCheck key="i" />, "Signed-in devices", String(sessions.length || 1)],
            [<KeyRound key="i" />, "Permissions", held ? String(held.size) : "All"],
          ].map(([icon, k, v]) => (
            <div
              key={String(k)}
              className="flex items-center gap-3 px-5 py-3.5 [&_svg]:size-4 [&_svg]:text-accent"
            >
              {icon}
              <div>
                <dt className="text-[0.75rem] text-fg-muted">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-5">
          <Card title="Picture">
            <AvatarUploader current={avatarUrl(user.avatar)} name={name} />
          </Card>
          <Card title="Details">
            <ProfileDetails user={user} />
          </Card>
          <Card title="Password">
            <PasswordForm email={user.email} name={user.name} />
          </Card>
        </div>
        <div className="grid content-start gap-5">
          <Card title="My activity · 18 weeks">
            <Heatmap days={heat} />
          </Card>
          <Card title="Devices">
            <ul className="mb-4 grid gap-2 text-body-sm">
              {sessions
                .slice(-5)
                .reverse()
                .map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span
                        className={
                          s.id === session?.sid
                            ? "size-2 rounded-full bg-success"
                            : "size-2 rounded-full bg-[var(--border-strong)]"
                        }
                      />
                      {s.id === session?.sid ? "This device" : "Other device"}
                    </span>
                    <span className="text-[0.75rem] text-fg-muted">
                      since {s.createdAt ? timeAgo(s.createdAt) : "—"} · until{" "}
                      {fmtDate(s.expiresAt)}
                    </span>
                  </li>
                ))}
            </ul>
            <EndSessions others={Math.max(0, sessions.length - 1)} />
          </Card>
          <Card title="What I can do">
            {held === null ? (
              <p className="text-body-sm text-fg-secondary">
                Super admin: every part of the office, the CMS and the settings.
              </p>
            ) : (
              <div className="grid gap-3">
                {Object.entries(PERMISSION_GROUPS).map(([g, label]) => {
                  const perms = PERMISSIONS.filter((p) => p.group === g && held.has(p.key));
                  if (!perms.length) return null;
                  return (
                    <div key={g}>
                      <p className="text-[0.75rem] font-semibold text-fg-muted">{label}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {perms.map((p) => (
                          <Pill key={p.key}>{p.label}</Pill>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
          <Card title="Recent actions">
            {recent.entries.length ? (
              <LogTimeline
                entries={recent.entries}
                now={now}
                avatars={{ [user.id]: user.avatar }}
              />
            ) : (
              <p className="text-body-sm text-fg-muted">Nothing yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
