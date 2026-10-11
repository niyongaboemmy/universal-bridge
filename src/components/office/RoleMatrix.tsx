"use client";

import { ChevronDown, Lock, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { useActionState, useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import {
  PERMISSIONS,
  PERMISSION_GROUPS,
  ROLE_COLORS,
  type PermissionGroup,
} from "@/access/permissions";
import { deleteRole, saveRole, toggleRolePermission } from "@/features/office/admin-actions";
import { cn } from "@/lib/utils";
import { field, labelCls, SubmitButton, useToastResult } from "./ProfileForms";
import { toast } from "./Toaster";

export type RoleRow = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  audience: "staff" | "member";
  system?: boolean | null;
  permissions: string[];
  people: number;
};

export const ROLE_HEX: Record<string, string> = {
  blue: "#0145b8",
  orange: "#fe760d",
  violet: "#7a4de0",
  green: "#0f8a6a",
  amber: "#b7791f",
  teal: "#0e7490",
  rose: "#be185d",
  slate: "#64748b",
};

function Switch({
  on,
  locked,
  color,
  onToggle,
  label,
}: {
  on: boolean;
  locked?: boolean;
  color: string;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={locked}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed",
        !on && "bg-[color-mix(in_oklab,var(--text-primary)_14%,transparent)]",
      )}
      style={on ? { background: color, opacity: locked ? 0.55 : 1 } : undefined}
    >
      <span
        className={cn(
          "absolute left-0.5 grid size-4 place-items-center rounded-full bg-white shadow transition-transform duration-200 [transition-timing-function:cubic-bezier(.3,1.5,.5,1)]",
          on && "translate-x-4",
        )}
      >
        {locked && <Lock className="size-2.5 text-fg-muted" aria-hidden />}
      </span>
    </button>
  );
}

/** Permission matrix: every role × every permission, switched on and off in place. */
export function RoleMatrix({ roles, canEdit }: { roles: RoleRow[]; canEdit: boolean }) {
  const [audience, setAudience] = useState<"staff" | "member">("staff");
  const [state, apply] = useOptimistic(
    roles,
    (s, { id, perm, on }: { id: number; perm: string; on: boolean }) =>
      s.map((r) =>
        r.id === id
          ? {
              ...r,
              permissions: on ? [...r.permissions, perm] : r.permissions.filter((p) => p !== perm),
            }
          : r,
      ),
  );
  const [, start] = useTransition();
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<RoleRow | "new" | null>(null);
  const [find, setFind] = useState("");
  const [only, setOnly] = useState<string>("");
  const shown = state.filter((r) => r.audience === audience);
  const groups = (Object.keys(PERMISSION_GROUPS) as PermissionGroup[]).filter(
    (g) => (audience === "member" ? g === "member" : g !== "member") && (!only || g === only),
  );
  const needle = find.trim().toLowerCase();
  const visible = (p: { key: string; label: string }) =>
    !needle || p.label.toLowerCase().includes(needle) || p.key.includes(needle);

  function toggle(role: RoleRow, perm: string) {
    if (!canEdit || role.slug === "super") return;
    const on = !role.permissions.includes(perm);
    start(async () => {
      apply({ id: role.id, perm, on });
      const res = await toggleRolePermission(role.id, perm, on);
      if (!res.ok) toast(res.error, "error");
      else
        toast(
          `${role.name}: ${PERMISSIONS.find((p) => p.key === perm)?.label} ${on ? "on" : "off"}`,
        );
    });
  }

  const total = (g?: PermissionGroup) => PERMISSIONS.filter((p) => !g || p.group === g).length;
  const holds = (r: RoleRow, key: string) => r.slug === "super" || r.permissions.includes(key);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="inline-flex rounded-xl border border-subtle bg-surface p-1">
          {(["staff", "member"] as const).map((a) => (
            <button
              key={a}
              role="tab"
              aria-selected={audience === a}
              onClick={() => setAudience(a)}
              className="rounded-lg px-3.5 py-1.5 text-body-sm font-medium text-fg-secondary transition-colors aria-selected:bg-accent-soft aria-selected:text-accent"
            >
              {a === "staff" ? "Staff roles" : "Website members"}
              <span className="ml-1.5 text-fg-muted">
                {state.filter((r) => r.audience === a).length}
              </span>
            </button>
          ))}
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0145b8] px-3.5 text-body-sm font-semibold text-white"
          >
            <Plus className="size-4" aria-hidden /> New role
          </button>
        )}
      </div>

      <ul className="office-stagger grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {shown.map((r) => {
          const color = ROLE_HEX[r.color ?? "blue"] ?? ROLE_HEX.blue!;
          const count = r.slug === "super" ? total() : r.permissions.length;
          const pct = count / total(audience === "member" ? "member" : undefined);
          return (
            <li
              key={r.id}
              className="group relative rounded-2xl border border-subtle bg-surface p-4 shadow-1 transition-[translate,border-color] hover:-translate-y-0.5 hover:border-strong"
            >
              <div className="flex items-start gap-3">
                <svg viewBox="0 0 36 36" className="size-12 shrink-0 -rotate-90" aria-hidden>
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    strokeWidth="4"
                    className="stroke-[color-mix(in_oklab,var(--text-primary)_10%,transparent)]"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    stroke={color}
                    pathLength={1}
                    strokeDasharray={`${Math.min(pct, 1)} 1`}
                    className="transition-[stroke-dasharray] duration-500"
                  />
                </svg>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 font-semibold">
                    {r.name}
                    {r.system && <Lock className="size-3 text-fg-muted" aria-label="Built-in" />}
                  </p>
                  <p className="text-[0.75rem] text-fg-muted">
                    {r.slug === "super" ? "All" : count} permissions · {r.people}{" "}
                    {r.people === 1 ? "person" : "people"}
                  </p>
                </div>
                {canEdit && r.slug !== "super" && (
                  <button
                    type="button"
                    onClick={() => setEditing(r)}
                    aria-label={`Edit ${r.name}`}
                    className="grid size-8 place-items-center rounded-full text-fg-muted opacity-0 transition-opacity group-hover:opacity-100 hover:bg-[var(--bg-sunken)] hover:text-fg focus-visible:opacity-100"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                )}
              </div>
              {r.description && (
                <p className="mt-2.5 line-clamp-2 text-[0.8125rem] text-fg-secondary">
                  {r.description}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div
        role="search"
        aria-label="Filter permissions"
        className="flex flex-wrap items-center gap-2"
      >
        <label className="relative min-w-0 flex-1 basis-56">
          <span className="sr-only">Search permissions</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted"
            aria-hidden
          />
          <input
            type="search"
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder="Search permissions…"
            className="ui-field pl-9"
          />
        </label>
        {audience === "staff" && (
          <select
            aria-label="Section"
            value={only}
            onChange={(e) => setOnly(e.target.value)}
            className={cn("ui-field w-auto", only && "is-active")}
          >
            <option value="">Section: all</option>
            {(Object.keys(PERMISSION_GROUPS) as PermissionGroup[])
              .filter((g) => g !== "member")
              .map((g) => (
                <option key={g} value={g}>
                  {PERMISSION_GROUPS[g]}
                </option>
              ))}
          </select>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-subtle bg-surface shadow-1">
        <table className="w-full min-w-[40rem] border-separate border-spacing-0 text-body-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-[2] min-w-56 border-b border-subtle bg-surface px-4 py-3 text-left text-[0.75rem] font-medium text-fg-muted">
                Permission
              </th>
              {shown.map((r) => (
                <th
                  key={r.id}
                  className="border-b border-subtle px-3 py-3 text-center text-[0.8125rem] font-semibold whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: ROLE_HEX[r.color ?? "blue"] }}
                    />
                    {r.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((g) => {
            const perms = PERMISSIONS.filter((p) => p.group === g);
            if (needle && !perms.some(visible)) return null;
            const open = !closed.has(g);
            return (
              <tbody key={g}>
                <tr>
                  <th
                    colSpan={1}
                    className="sticky left-0 z-[1] border-b border-subtle bg-[var(--bg-sunken)] px-4 py-2 text-left"
                  >
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() =>
                        setClosed((c) => {
                          const n = new Set(c);
                          if (n.has(g)) n.delete(g);
                          else n.add(g);
                          return n;
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold tracking-wide text-fg-secondary uppercase"
                    >
                      <ChevronDown
                        className={cn("size-3.5 transition-transform", !open && "-rotate-90")}
                      />
                      {PERMISSION_GROUPS[g]}
                    </button>
                  </th>
                  {shown.map((r) => {
                    const n = perms.filter((p) => holds(r, p.key)).length;
                    return (
                      <td
                        key={r.id}
                        className="border-b border-subtle bg-[var(--bg-sunken)] px-3 py-2 text-center"
                      >
                        <span className="mx-auto block h-1.5 w-14 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-primary)_10%,transparent)]">
                          <span
                            className="block h-full rounded-full transition-[width] duration-500"
                            style={{
                              width: `${(n / perms.length) * 100}%`,
                              background: ROLE_HEX[r.color ?? "blue"],
                            }}
                          />
                        </span>
                        <span className="mt-0.5 block text-[0.6875rem] text-fg-muted tabular-nums">
                          {n}/{perms.length}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                {(open || needle) &&
                  perms.filter(visible).map((p) => (
                    <tr
                      key={p.key}
                      className="hover:bg-[color-mix(in_oklab,var(--accent-primary)_4%,transparent)]"
                    >
                      <th className="sticky left-0 z-[1] border-b border-subtle bg-surface px-4 py-2.5 text-left font-normal">
                        {p.label}
                        <code className="block font-mono text-[0.6875rem] text-fg-muted">
                          {p.key}
                        </code>
                      </th>
                      {shown.map((r) => (
                        <td key={r.id} className="border-b border-subtle px-3 py-2.5 text-center">
                          <Switch
                            on={holds(r, p.key)}
                            locked={!canEdit || r.slug === "super"}
                            color={ROLE_HEX[r.color ?? "blue"]!}
                            label={`${p.label} for ${r.name}`}
                            onToggle={() => toggle(r, p.key)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            );
          })}
        </table>
      </div>

      {editing && (
        <RoleDialog
          role={editing === "new" ? null : editing}
          audience={audience}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function RoleDialog({
  role,
  audience,
  onClose,
}: {
  role: RoleRow | null;
  audience: "staff" | "member";
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(saveRole, null);
  const [deleting, start] = useTransition();
  useToastResult(state);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="office-page m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-subtle bg-surface p-0 text-fg shadow-2 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <form action={action} className="grid gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-heading-md">{role ? `Edit ${role.name}` : "New role"}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-full hover:bg-[var(--bg-sunken)]"
          >
            <X className="size-4" />
          </button>
        </div>
        {role && <input type="hidden" name="id" value={role.id} />}
        <input type="hidden" name="audience" value={role?.audience ?? audience} />
        <label className={labelCls}>
          Name
          <input name="name" required defaultValue={role?.name} className={field} autoFocus />
        </label>
        <label className={labelCls}>
          What it&apos;s for
          <textarea
            name="description"
            rows={2}
            defaultValue={role?.description ?? ""}
            className={cn(field, "h-auto py-2")}
          />
        </label>
        <fieldset>
          <legend className="text-[0.8125rem] font-medium text-fg-secondary">Colour</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ROLE_COLORS.map((c) => (
              <label key={c} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c}
                  defaultChecked={(role?.color ?? "blue") === c}
                  className="peer sr-only"
                />
                <span
                  className="block size-7 rounded-full ring-offset-2 ring-offset-[var(--bg-surface)] transition-[scale] peer-checked:scale-110 peer-checked:ring-2 peer-checked:ring-[var(--text-primary)] peer-focus-visible:ring-2"
                  style={{ background: ROLE_HEX[c] }}
                  title={c}
                />
              </label>
            ))}
          </div>
        </fieldset>
        {!role && (
          <p className="text-[0.8125rem] text-fg-muted">
            Starts with no permissions; switch them on in the table.
          </p>
        )}
        <div className="flex items-center justify-between gap-2 pt-1">
          {role && !role.system ? (
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                if (!confirm(`Delete the role “${role.name}”? People keep their other roles.`))
                  return;
                start(async () => {
                  const r = await deleteRole(role.id);
                  toast(r.ok ? (r.message ?? "Deleted") : r.error, r.ok ? undefined : "error");
                  if (r.ok) onClose();
                });
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-body-sm font-medium text-danger hover:bg-[color-mix(in_oklab,var(--danger)_10%,transparent)]"
            >
              <Trash2 className="size-4" aria-hidden /> Delete
            </button>
          ) : (
            <span />
          )}
          <SubmitButton pending={pending}>{role ? "Save" : "Create role"}</SubmitButton>
        </div>
      </form>
    </dialog>
  );
}
