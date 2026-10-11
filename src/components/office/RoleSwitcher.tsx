"use client";

import { Check, ChevronDown, Layers, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { switchRole } from "@/features/office/admin-actions";
import { cn } from "@/lib/utils";
import { Popover } from "./Popover";
import { ROLE_HEX } from "./RoleMatrix";
import { toast } from "./Toaster";

type R = { id: number; name: string; color?: string | null; description?: string | null };

/**
 * For people with several roles: work as one of them (the office, the CMS and the API
 * then follow only that role's permissions) or with all of them combined.
 */
export function RoleSwitcher({ roles, active }: { roles: R[]; active: number | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const trigger = useRef<HTMLButtonElement>(null);
  const current = roles.find((r) => r.id === active);

  const pick = (id: number | null) => {
    setOpen(false);
    if (id === active) return;
    start(async () => {
      const r = await switchRole(id);
      if (!r.ok) return toast(r.error, "error");
      toast(r.message ?? "Switched");
      // Start again from the overview: the current page may not be part of the new role.
      router.push("/office");
      router.refresh();
    });
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Working as ${current?.name ?? "all roles"}. Switch role`}
        className="inline-flex h-10 max-w-48 items-center gap-2 rounded-full border border-subtle bg-surface px-2.5 text-[0.8125rem] font-medium shadow-1 transition-colors hover:border-strong"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin text-fg-muted" aria-hidden />
        ) : current ? (
          <span
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: ROLE_HEX[current.color ?? "blue"] }}
          />
        ) : (
          <Layers className="size-4 shrink-0 text-accent" aria-hidden />
        )}
        <span className="hidden truncate sm:inline">{current?.name ?? "All roles"}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-fg-muted transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchor={trigger}
        align="end"
        width={280}
        label="Switch role"
      >
        <p className="px-2.5 pt-1.5 pb-2 text-[0.6875rem] font-semibold tracking-wide text-fg-muted uppercase">
          Work as
        </p>
        {[
          {
            id: null as number | null,
            name: "All my roles",
            description: "Everything your roles allow, combined.",
            color: null,
          },
          ...roles,
        ].map((r) => {
          const on = r.id === active;
          return (
            <button
              key={r.id ?? "all"}
              type="button"
              role="menuitemradio"
              aria-checked={on}
              onClick={() => pick(r.id)}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--bg-sunken)]",
                on && "bg-accent-soft",
              )}
            >
              <span
                className="mt-1 size-2.5 shrink-0 rounded-full"
                style={{
                  background: r.color
                    ? ROLE_HEX[r.color]
                    : "linear-gradient(135deg,#0145b8,#fe760d)",
                }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-body-sm font-medium">{r.name}</span>
                {r.description && (
                  <span className="block text-[0.75rem] text-fg-muted">{r.description}</span>
                )}
              </span>
              {on && <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />}
            </button>
          );
        })}
      </Popover>
    </>
  );
}
