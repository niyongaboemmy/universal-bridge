"use client";

import { useActionState, useState } from "react";
import { saveSettings } from "@/features/office/admin-actions";
import { cn } from "@/lib/utils";
import { field, SubmitButton, useToastResult } from "./ProfileForms";

export type SettingField = {
  name: string; // "fromName" or "inboxes.sales"
  label: string;
  type:
    "text" | "email" | "url" | "number" | "checkbox" | "select" | "range" | "textarea" | "datetime";
  help?: string;
  placeholder?: string;
  value: unknown;
  /** Value currently used when the field is empty (environment or default). */
  fallback?: string | null;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  half?: boolean;
};

function Toggle({
  name,
  defaultChecked,
  label,
}: {
  name: string;
  defaultChecked: boolean;
  label: string;
}) {
  const [on, set] = useState(defaultChecked);
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-subtle px-4 py-3 transition-colors hover:border-strong">
      <span className="text-body-sm font-medium">{label}</span>
      <input
        type="checkbox"
        name={name}
        checked={on}
        onChange={(e) => set(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200",
          on ? "bg-[#0145b8]" : "bg-[color-mix(in_oklab,var(--text-primary)_16%,transparent)]",
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 [transition-timing-function:cubic-bezier(.3,1.5,.5,1)]",
            on && "translate-x-5",
          )}
        />
      </span>
    </label>
  );
}

function Range({ f }: { f: SettingField }) {
  const [v, set] = useState(Number(f.value ?? f.min ?? 0));
  const pct = ((v - (f.min ?? 0)) / ((f.max ?? 100) - (f.min ?? 0))) * 100;
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[0.8125rem] font-medium text-fg-secondary">{f.label}</span>
        <span className="font-display text-heading-md tabular-nums">
          {v}
          <span className="ml-1 text-[0.75rem] font-normal text-fg-muted">{f.unit}</span>
        </span>
      </div>
      <input
        type="range"
        name={f.name}
        min={f.min}
        max={f.max}
        step={f.step ?? 1}
        value={v}
        onChange={(e) => set(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full accent-[#0145b8]"
        style={{
          background: `linear-gradient(90deg, #0145b8 ${pct}%, color-mix(in oklab, var(--text-primary) 12%, transparent) ${pct}%)`,
        }}
      />
      {f.help && <span className="text-[0.75rem] text-fg-muted">{f.help}</span>}
    </div>
  );
}

/** One settings section, saved on its own. */
export function SettingsForm({ section, fields }: { section: string; fields: SettingField[] }) {
  const [state, action, pending] = useActionState(saveSettings, null);
  useToastResult(state);
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="_section" value={section} />
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => {
          const typeInput = (
            <input
              type="hidden"
              name={`_type.${f.name}`}
              value={
                f.type === "range"
                  ? "number"
                  : f.type === "select" && f.name.endsWith("Role")
                    ? "relationship"
                    : f.type
              }
            />
          );
          if (f.type === "checkbox")
            return (
              <div key={f.name} className="sm:col-span-2">
                {typeInput}
                <input type="hidden" name="_checkbox" value={f.name} />
                <Toggle name={f.name} defaultChecked={Boolean(f.value)} label={f.label} />
                {f.help && <p className="mt-1.5 px-1 text-[0.75rem] text-fg-muted">{f.help}</p>}
              </div>
            );
          if (f.type === "range")
            return (
              <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
                {typeInput}
                <Range f={f} />
              </div>
            );
          return (
            <label
              key={f.name}
              className={cn(
                "grid gap-1.5 text-[0.8125rem] font-medium text-fg-secondary",
                !f.half && "sm:col-span-2",
              )}
            >
              {f.label}
              {typeInput}
              {f.type === "textarea" ? (
                <textarea
                  name={f.name}
                  rows={3}
                  defaultValue={f.value == null ? "" : String(f.value)}
                  placeholder={f.placeholder}
                  className={field}
                />
              ) : f.type === "datetime" ? (
                <input
                  name={f.name}
                  type="datetime-local"
                  defaultValue={f.value ? new Date(String(f.value)).toISOString().slice(0, 16) : ""}
                  className={field}
                />
              ) : f.type === "select" ? (
                <select name={f.name} defaultValue={String(f.value ?? "")} className={field}>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={f.name}
                  type={f.type}
                  defaultValue={f.value == null ? "" : String(f.value)}
                  placeholder={f.fallback ?? f.placeholder}
                  min={f.min}
                  max={f.max}
                  className={field}
                />
              )}
              {(f.help || f.fallback) && (
                <span className="text-[0.75rem] font-normal text-fg-muted">
                  {f.help}
                  {f.fallback && !f.value && (
                    <span className="ml-1 rounded bg-[var(--bg-sunken)] px-1 py-0.5 font-mono text-[0.6875rem]">
                      using {f.fallback}
                    </span>
                  )}
                </span>
              )}
            </label>
          );
        })}
      </div>
      <div>
        <SubmitButton pending={pending}>Save</SubmitButton>
      </div>
    </form>
  );
}
