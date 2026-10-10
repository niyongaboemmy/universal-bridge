"use client";

import { Camera, Check, Eye, EyeOff, Loader2, LogOut, Trash2, Upload } from "lucide-react";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import type { ActionResult } from "@/features/office/actions";
import {
  changePassword,
  endOtherSessions,
  removeAvatar,
  saveProfile,
  uploadAvatar,
} from "@/features/office/admin-actions";
import { PASSWORD_MIN, passwordProblem } from "@/lib/auth/password";
import { cn } from "@/lib/utils";
import { toast } from "./Toaster";

export const field = "ui-field";
export const labelCls = "grid gap-1.5 text-[0.8125rem] font-medium text-fg-secondary";
export const primary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#0145b8] px-4 text-body-sm font-semibold text-white transition-[translate,opacity] hover:-translate-y-px disabled:opacity-60";

/** Toast the result of a form action once. */
export function useToastResult(state: ActionResult | null) {
  useEffect(() => {
    if (!state) return;
    if (state.ok) toast(state.message?.split("|")[0] ?? "Saved");
    else toast(state.error, "error");
  }, [state]);
}

export function SubmitButton({
  pending,
  children,
}: {
  pending: boolean;
  children: React.ReactNode;
}) {
  return (
    <button type="submit" disabled={pending} className={primary}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Check className="size-4" aria-hidden />
      )}
      {children}
    </button>
  );
}

export function ProfileDetails({
  user,
}: {
  user: {
    name?: string;
    email: string;
    jobTitle?: string | null;
    phone?: string | null;
    landing?: string | null;
  };
}) {
  const [state, action, pending] = useActionState(saveProfile, null);
  useToastResult(state);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className={labelCls}>
        Full name
        <input name="name" defaultValue={user.name ?? ""} required className={field} />
      </label>
      <label className={labelCls}>
        Email
        <input value={user.email} disabled className={cn(field, "opacity-70")} />
      </label>
      <label className={labelCls}>
        Job title
        <input name="jobTitle" defaultValue={user.jobTitle ?? ""} className={field} />
      </label>
      <label className={labelCls}>
        Phone
        <input name="phone" type="tel" defaultValue={user.phone ?? ""} className={field} />
      </label>
      <fieldset className="grid gap-2 sm:col-span-2">
        <legend className="text-[0.8125rem] font-medium text-fg-secondary">
          Open after sign-in
        </legend>
        <div className="mt-1.5 grid grid-cols-2 gap-2 sm:max-w-md">
          {[
            ["office", "Company office"],
            ["cms", "Content (CMS)"],
          ].map(([v, l]) => (
            <label
              key={v}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-strong px-3 py-2.5 text-body-sm has-checked:border-accent has-checked:bg-accent-soft has-checked:text-accent"
            >
              <input
                type="radio"
                name="landing"
                value={v}
                defaultChecked={(user.landing ?? "office") === v}
                className="accent-[var(--accent-primary)]"
              />
              {l}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="sm:col-span-2">
        <SubmitButton pending={pending}>Save profile</SubmitButton>
      </div>
    </form>
  );
}

/** 0–4 from length and variety; the policy itself is checked on the server. */
function strength(pw: string) {
  if (!pw) return 0;
  let s = pw.length >= PASSWORD_MIN ? 2 : pw.length >= 8 ? 1 : 0;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter((r) => r.test(pw)).length;
  if (kinds >= 3) s++;
  if (pw.length >= 16) s++;
  return Math.min(s, 4);
}

export function PasswordForm({ email, name }: { email: string; name?: string }) {
  const [pw, setPw] = useState("");
  const [state, action, pending] = useActionState(
    async (prev: ActionResult | null, fd: FormData) => {
      const r = await changePassword(prev, fd);
      if (r.ok) setPw("");
      return r;
    },
    null,
  );
  const [show, setShow] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  useToastResult(state);
  const score = strength(pw);
  const problem = pw ? passwordProblem(pw, { email, name }) : null;
  const tones = ["bg-danger", "bg-danger", "bg-[var(--accent-spark)]", "bg-success", "bg-success"];
  return (
    <form ref={form} action={action} className="grid gap-4">
      <label className={labelCls}>
        Current password
        <input
          name="current"
          type="password"
          autoComplete="current-password"
          required
          className={field}
        />
      </label>
      <label className={labelCls}>
        New password
        <span className="relative">
          <input
            name="next"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className={cn(field, "pr-10")}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-fg-muted hover:text-fg"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </span>
        <span className="mt-1 grid grid-cols-4 gap-1" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full bg-[var(--bg-sunken)] transition-colors duration-300",
                i < score && tones[score],
              )}
            />
          ))}
        </span>
        <span
          className={cn("text-[0.75rem] font-normal", problem ? "text-danger" : "text-fg-muted")}
        >
          {problem ??
            (pw
              ? "Looks good."
              : `At least ${PASSWORD_MIN} characters. A short sentence works well.`)}
        </span>
      </label>
      <label className={labelCls}>
        Repeat new password
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          className={field}
        />
      </label>
      <div>
        <SubmitButton pending={pending}>Change password</SubmitButton>
      </div>
    </form>
  );
}

export function AvatarUploader({ current, name }: { current: string | null; name: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [state, action, pending] = useActionState(
    async (prev: ActionResult | null, fd: FormData) => {
      const r = await uploadAvatar(prev, fd);
      if (r.ok) setPreview(null);
      return r;
    },
    null,
  );
  const [over, setOver] = useState(false);
  const [removing, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);
  useToastResult(state);

  function pick(file: File | undefined) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    const dt = new DataTransfer();
    dt.items.add(file);
    input.current!.files = dt.files;
    form.current?.requestSubmit();
  }
  // The stored avatar's URL (ours or the storage bucket's) is an <img>; a just-picked file
  // shows as a CSS background from its local blob: URL, never as markup.
  const current_ =
    current?.startsWith("/api/") ||
    current?.startsWith("/media/") ||
    current?.startsWith("https://")
      ? current
      : null;
  const previewStyle = preview?.startsWith("blob:")
    ? { backgroundImage: `url("${preview}")` }
    : undefined;
  return (
    <form ref={form} action={action} className="flex items-center gap-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={cn(
          "group relative grid size-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-strong bg-[var(--bg-sunken)] transition-[border-color,scale]",
          over && "scale-105 border-accent",
        )}
      >
        {previewStyle ? (
          <span aria-hidden className="size-full bg-cover bg-center" style={previewStyle} />
        ) : current_ ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current_} alt="" className="size-full object-cover" />
        ) : (
          <span className="font-display text-2xl font-bold text-fg-muted">
            {name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </span>
        )}
        <span className="absolute inset-0 grid place-items-center bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
          {pending ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
        </span>
        <input
          ref={input}
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => pick(e.target.files?.[0])}
        />
      </label>
      <div className="grid gap-2">
        <p className="text-body-sm text-fg-secondary">
          Drop a picture or click it. JPG, PNG or WebP, up to 4 MB.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-strong px-3 text-[0.8125rem] font-medium hover:bg-[var(--bg-sunken)]"
          >
            <Upload className="size-4" aria-hidden /> Upload
          </button>
          {current && (
            <button
              type="button"
              disabled={removing}
              onClick={() =>
                start(async () => {
                  const r = await removeAvatar();
                  toast(r.ok ? (r.message ?? "Removed") : r.error, r.ok ? undefined : "error");
                })
              }
              className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[0.8125rem] font-medium text-danger hover:bg-[color-mix(in_oklab,var(--danger)_10%,transparent)]"
            >
              <Trash2 className="size-4" aria-hidden /> Remove
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

export function EndSessions({ others }: { others: number }) {
  const [pending, start] = useTransition();
  if (!others) return <p className="text-body-sm text-fg-muted">Only this device is signed in.</p>;
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await endOtherSessions();
          toast(r.ok ? (r.message ?? "Done") : r.error, r.ok ? undefined : "error");
        })
      }
      className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-strong px-3 text-[0.8125rem] font-medium hover:bg-[var(--bg-sunken)]"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <LogOut className="size-4" aria-hidden />
      )}
      Sign out {others} other {others === 1 ? "device" : "devices"}
    </button>
  );
}
