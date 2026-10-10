"use client";

import { Check, ChevronDown, Loader2, LockOpen, Trash2, UserPlus, X } from "lucide-react";
import { useActionState, useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import {
  inviteStaff,
  removeStaff,
  setMemberRole,
  setUserRoles,
  unlockStaff,
} from "@/features/office/admin-actions";
import { cn } from "@/lib/utils";
import { field, labelCls, SubmitButton, useToastResult } from "./ProfileForms";
import { ROLE_HEX } from "./RoleMatrix";
import { Popover } from "./Popover";
import { toast } from "./Toaster";

type RoleOpt = { id: number; name: string; color?: string | null; slug: string };

/** Role chips with a floating checklist; saves on every change. */
export function RolePicker({
  userId,
  roles,
  value,
  disabled,
}: {
  userId: number;
  roles: RoleOpt[];
  value: number[];
  disabled?: boolean;
}) {
  const [current, set] = useOptimistic(value, (_s, next: number[]) => next);
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function toggle(id: number) {
    const next = current.includes(id) ? current.filter((r) => r !== id) : [...current, id];
    if (!next.length) return toast("Keep at least one role.", "error");
    start(async () => {
      set(next);
      const r = await setUserRoles(userId, next);
      toast(r.ok ? (r.message ?? "Saved") : r.error, r.ok ? undefined : "error");
    });
  }
  const chips = roles.filter((r) => current.includes(r.id));
  return (
    <>
      <button
        ref={trigger}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex flex-wrap items-center gap-1 rounded-lg p-1 text-left enabled:hover:bg-[var(--bg-sunken)]"
      >
        {chips.map((r) => (
          <span
            key={r.id}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.75rem] font-medium"
            style={{
              background: `color-mix(in oklab, ${ROLE_HEX[r.color ?? "blue"]} 14%, transparent)`,
              color: ROLE_HEX[r.color ?? "blue"],
            }}
          >
            {r.name}
          </span>
        ))}
        {pending ? (
          <Loader2 className="size-3.5 animate-spin text-fg-muted" />
        ) : (
          !disabled && (
            <ChevronDown
              className={cn("size-3.5 text-fg-muted transition-transform", open && "rotate-180")}
            />
          )
        )}
      </button>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchor={trigger}
        width={240}
        label="Roles"
      >
        <p className="px-2 pt-1 pb-1.5 text-[0.6875rem] font-semibold tracking-wide text-fg-muted uppercase">
          Roles
        </p>
        {roles.map((r) => {
          const on = current.includes(r.id);
          return (
            <button
              key={r.id}
              type="button"
              role="menuitemcheckbox"
              aria-checked={on}
              onClick={() => toggle(r.id)}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-body-sm hover:bg-[var(--bg-sunken)]"
            >
              <span
                className={cn(
                  "grid size-4 place-items-center rounded border transition-colors",
                  on ? "border-transparent text-white" : "border-strong",
                )}
                style={on ? { background: ROLE_HEX[r.color ?? "blue"] } : undefined}
              >
                {on && <Check className="size-3" />}
              </span>
              {r.name}
            </button>
          );
        })}
      </Popover>
    </>
  );
}

export function StaffActions({ id, locked, self }: { id: number; locked: boolean; self: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex justify-end gap-1">
      {locked && (
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await unlockStaff(id);
              toast(r.ok ? (r.message ?? "Done") : r.error, r.ok ? undefined : "error");
            })
          }
          aria-label="Unlock"
          title="Unlock"
          className="grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-[var(--bg-sunken)] hover:text-fg"
        >
          <LockOpen className="size-4" />
        </button>
      )}
      {!self && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (
              !confirm(
                "Remove this account? They lose access at once; their history stays in the logs.",
              )
            )
              return;
            start(async () => {
              const r = await removeStaff(id);
              toast(r.ok ? (r.message ?? "Removed") : r.error, r.ok ? undefined : "error");
            });
          }}
          aria-label="Remove account"
          title="Remove account"
          className="grid size-8 place-items-center rounded-lg text-fg-muted hover:bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] hover:text-danger"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}

export function MemberRoleSelect({
  id,
  value,
  roles,
}: {
  id: number;
  value: number | null;
  roles: RoleOpt[];
}) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={value ?? ""}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          const r = await setMemberRole(id, Number(e.target.value));
          toast(r.ok ? (r.message ?? "Saved") : r.error, r.ok ? undefined : "error");
        })
      }
      className="ui-field w-auto min-w-36"
    >
      {roles.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
    </select>
  );
}

export function InviteButton({ roles, open: initial }: { roles: RoleOpt[]; open?: boolean }) {
  const [open, setOpen] = useState(Boolean(initial));
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0145b8] px-3.5 text-body-sm font-semibold text-white"
      >
        <UserPlus className="size-4" aria-hidden /> Invite staff
      </button>
      {open && <InviteDialog roles={roles} onClose={() => setOpen(false)} />}
    </>
  );
}

function InviteDialog({ roles, onClose }: { roles: RoleOpt[]; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState(inviteStaff, null);
  const [picked, setPicked] = useState<number[]>(
    roles.filter((r) => r.slug === "editor").map((r) => r.id),
  );
  useToastResult(state);
  useEffect(() => ref.current?.showModal(), []);
  useEffect(() => {
    if (state?.ok) onClose();
  }, [state, onClose]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="office-page m-auto w-[min(30rem,calc(100vw-2rem))] rounded-2xl border border-subtle bg-surface p-0 text-fg shadow-2 backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    >
      <form action={action} className="grid gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-heading-md">Invite a staff member</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-8 place-items-center rounded-lg hover:bg-[var(--bg-sunken)]"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelCls}>
            Full name
            <input name="name" required className={field} autoFocus />
          </label>
          <label className={labelCls}>
            Job title
            <input name="jobTitle" className={field} />
          </label>
        </div>
        <label className={labelCls}>
          Work email
          <input name="email" type="email" required className={field} />
        </label>
        <fieldset>
          <legend className="text-[0.8125rem] font-medium text-fg-secondary">Roles</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {roles.map((r) => {
              const on = picked.includes(r.id);
              return (
                <label
                  key={r.id}
                  className="cursor-pointer rounded-full border border-strong px-3 py-1 text-[0.8125rem] font-medium transition-colors has-focus-visible:ring-2"
                  style={
                    on
                      ? {
                          background: ROLE_HEX[r.color ?? "blue"],
                          borderColor: "transparent",
                          color: "#fff",
                        }
                      : undefined
                  }
                >
                  <input
                    type="checkbox"
                    name="roles"
                    value={r.id}
                    checked={on}
                    onChange={() =>
                      setPicked((p) => (on ? p.filter((x) => x !== r.id) : [...p, r.id]))
                    }
                    className="sr-only"
                  />
                  {r.name}
                </label>
              );
            })}
          </div>
        </fieldset>
        <p className="text-[0.8125rem] text-fg-muted">
          They get an email to set their own password (link valid one hour).
        </p>
        <div className="flex justify-end">
          <SubmitButton pending={pending}>Send invitation</SubmitButton>
        </div>
      </form>
    </dialog>
  );
}
