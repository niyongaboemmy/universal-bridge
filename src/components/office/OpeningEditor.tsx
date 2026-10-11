"use client";

import {
  AlignLeft,
  AtSign,
  Calendar,
  CheckSquare,
  ChevronDown,
  CircleDot,
  Copy,
  ExternalLink,
  GripVertical,
  Hash,
  Link2,
  ListChecks,
  Paperclip,
  Phone,
  Plus,
  Trash2,
  Type,
  Wand2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import type { FieldType, OpeningField } from "@/collections/Openings";
import { saveOpening } from "@/features/office/admin-actions";
import { cn } from "@/lib/utils";
import { field, labelCls, SubmitButton, useToastResult } from "./ProfileForms";

const TYPES: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: "text", label: "Short answer", icon: <Type /> },
  { type: "textarea", label: "Paragraph", icon: <AlignLeft /> },
  { type: "select", label: "Dropdown", icon: <ListChecks /> },
  { type: "radio", label: "One choice", icon: <CircleDot /> },
  { type: "checkbox", label: "Yes / no", icon: <CheckSquare /> },
  { type: "date", label: "Date", icon: <Calendar /> },
  { type: "number", label: "Number", icon: <Hash /> },
  { type: "email", label: "Email", icon: <AtSign /> },
  { type: "tel", label: "Phone", icon: <Phone /> },
  { type: "url", label: "Link", icon: <Link2 /> },
  { type: "file", label: "File (PDF, DOC)", icon: <Paperclip /> },
];
const ICON = Object.fromEntries(TYPES.map((t) => [t.type, t.icon]));

type F = OpeningField & { uid: string };
/** Local key for a question while editing (never stored). */
const uid = () => crypto.randomUUID().slice(0, 8);

/** Suggested questions per kind (a starting point; everything stays editable). */
const TEMPLATES: Record<string, Omit<OpeningField, "key">[]> = {
  academy: [
    {
      label: "Education level",
      type: "select",
      required: true,
      options: "Secondary\nDiploma\nBachelor's\nMaster's or above",
    },
    { label: "Why this program?", type: "textarea", required: true },
    { label: "Laptop available", type: "checkbox" },
  ],
  internship: [
    { label: "School or university", type: "text", required: true, width: "half" },
    { label: "Field of study", type: "text", required: true, width: "half" },
    { label: "Available from", type: "date", required: true, width: "half" },
    { label: "CV", type: "file", required: true, width: "half" },
    { label: "Portfolio or GitHub", type: "url" },
  ],
  job: [
    { label: "Years of experience", type: "number", required: true, width: "half" },
    {
      label: "Notice period",
      type: "select",
      width: "half",
      options: "Immediately\n2 weeks\n1 month\n2+ months",
    },
    { label: "CV", type: "file", required: true },
    { label: "Cover letter", type: "textarea" },
    { label: "LinkedIn", type: "url" },
  ],
  partner: [
    { label: "Organisation", type: "text", required: true, width: "half" },
    { label: "Country", type: "text", required: true, width: "half" },
    {
      label: "Partnership type",
      type: "radio",
      required: true,
      options: "Reseller\nReferral agent\nTechnology partner",
    },
    { label: "Tell us about your organisation", type: "textarea" },
  ],
  event: [
    { label: "Organisation", type: "text", width: "half" },
    { label: "Role", type: "text", width: "half" },
    { label: "Dietary needs", type: "text" },
  ],
};

export type OpeningInput = {
  id?: number;
  title?: string;
  slug?: string;
  kind?: string;
  status?: string;
  mode?: string | null;
  opensAt?: string | null;
  closesAt?: string | null;
  startsAt?: string | null;
  seats?: number | null;
  location?: string | null;
  summary?: string | null;
  description?: string | null;
  requireAccount?: boolean | null;
  featured?: boolean | null;
  fields?: OpeningField[] | null;
};

const KIND_LABELS: Record<string, string> = {
  academy: "Academy intake",
  internship: "Internship",
  job: "Job",
  partner: "Partner programme",
  event: "Event",
};
const STATUS_HELP: Record<string, string> = {
  draft: "Only staff can see it.",
  open: "Live on the website, taking applications.",
  paused: "Page hidden; applications stopped for now.",
  closed: "Page stays visible; no new applications.",
};

const d = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

export function OpeningEditor({ opening, siteUrl }: { opening: OpeningInput; siteUrl: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveOpening, null);
  useToastResult(state);
  const [title, setTitle] = useState(opening.title ?? "");
  const [slug, setSlug] = useState(opening.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(opening.slug));
  const [kind, setKind] = useState(opening.kind ?? "academy");
  const [status, setStatus] = useState(opening.status ?? "draft");
  const [dates, setDates] = useState({
    opens: d(opening.opensAt),
    closes: d(opening.closesAt),
    starts: d(opening.startsAt),
  });
  const [fields, setFields] = useState<F[]>(() =>
    (opening.fields ?? []).map((f) => ({ ...f, uid: uid() })),
  );
  const [open, setOpen] = useState<string | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  useEffect(() => {
    if (!state?.ok || opening.id) return;
    const id = state.message?.split("|")[1];
    if (id) router.replace(`/office/openings/${id}`);
  }, [state, opening.id, router]);

  const autoSlug = (t: string) =>
    t
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);

  function add(type: FieldType) {
    const f: F = {
      uid: uid(),
      key: "",
      label: TYPES.find((t) => t.type === type)!.label,
      type,
      required: false,
      width: "full",
    };
    setFields((x) => [...x, f]);
    setOpen(f.uid);
  }
  const patch = (u: string, p: Partial<F>) =>
    setFields((x) => x.map((f) => (f.uid === u ? { ...f, ...p } : f)));
  function moveTo(from: number, to: number) {
    setFields((x) => {
      const n = [...x];
      const [item] = n.splice(from, 1);
      n.splice(to, 0, item!);
      return n;
    });
  }
  const payloadFields = useMemo(
    () => JSON.stringify(fields.map(({ uid: _u, ...f }) => f)),
    [fields],
  );

  // Timeline: opens → closes → starts, with today.
  const points = [
    ["Opens", dates.opens],
    ["Closes", dates.closes],
    ["Starts", dates.starts],
  ].filter(([, v]) => v) as [string, string][];
  const times = points.map(([, v]) => new Date(v).getTime());
  const today = new Date().setHours(0, 0, 0, 0);
  const lo = Math.min(...times, today);
  const hi = Math.max(...times, today);
  const pos = (t: number) => (hi === lo ? 50 : 4 + ((t - lo) / (hi - lo)) * 92);

  return (
    <form action={action} className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
      {opening.id && <input type="hidden" name="id" value={opening.id} />}
      <input type="hidden" name="fields" value={payloadFields} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="status" value={status} />

      <div className="grid gap-5">
        <section className="rounded-2xl border border-subtle bg-surface p-5 shadow-1">
          <h2 className="mb-4 text-body-sm font-semibold">What is it?</h2>
          <div className="grid gap-4">
            <label className={labelCls}>
              Title
              <input
                name="title"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slugTouched) setSlug(autoSlug(e.target.value));
                }}
                placeholder="Software Engineering · January intake"
                className={cn(field, "font-medium")}
              />
            </label>
            <label className={labelCls}>
              Web address
              <span className="ui-field flex items-center overflow-hidden p-0">
                <span className="pl-3 text-body-sm text-fg-muted">/apply/</span>
                <input
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(autoSlug(e.target.value));
                  }}
                  className="h-full flex-1 bg-transparent px-1 text-body-sm outline-none"
                />
              </span>
            </label>
            <div>
              <p className="text-[0.8125rem] font-medium text-fg-secondary">People apply for</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(KIND_LABELS).map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={kind === k}
                    onClick={() => setKind(k)}
                    className="rounded-xl border border-strong px-3 py-1.5 text-body-sm transition-colors aria-pressed:border-accent aria-pressed:bg-accent-soft aria-pressed:font-medium aria-pressed:text-accent"
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelCls}>
                Where
                <select name="mode" defaultValue={opening.mode ?? "onsite"} className={field}>
                  <option value="onsite">On site</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                </select>
              </label>
              <label className={labelCls}>
                Location
                <input
                  name="location"
                  defaultValue={opening.location ?? ""}
                  placeholder="Kigali"
                  className={field}
                />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-subtle bg-surface p-5 shadow-1">
          <h2 className="mb-4 text-body-sm font-semibold">Dates & seats</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            {(
              [
                ["opensAt", "Opens", "opens"],
                ["closesAt", "Closes", "closes"],
                ["startsAt", "Starts", "starts"],
              ] as const
            ).map(([name, l, k]) => (
              <label key={name} className={labelCls}>
                {l}
                <input
                  type="date"
                  name={name}
                  value={dates[k]}
                  onChange={(e) => setDates((x) => ({ ...x, [k]: e.target.value }))}
                  className={field}
                />
              </label>
            ))}
            <label className={labelCls}>
              Seats
              <input
                type="number"
                min={0}
                name="seats"
                defaultValue={opening.seats ?? ""}
                placeholder="No limit"
                className={field}
              />
            </label>
          </div>
          {points.length > 0 && (
            <div className="relative mt-6 mb-2 h-10" aria-hidden>
              <div className="absolute top-4 right-0 left-0 h-1 rounded-full bg-[var(--bg-sunken)]" />
              {points.length > 1 && (
                <div
                  className="office-bar absolute top-4 h-1 rounded-full bg-gradient-to-r from-[#0145b8] to-[#fe760d]"
                  style={{
                    left: `${pos(Math.min(...times))}%`,
                    width: `${pos(Math.max(...times)) - pos(Math.min(...times))}%`,
                  }}
                />
              )}
              {points.map(([l, v]) => (
                <span
                  key={l}
                  className="absolute top-2.5 -translate-x-1/2 text-center"
                  style={{ left: `${pos(new Date(v).getTime())}%` }}
                >
                  <span className="mx-auto block size-4 rounded-full border-[3px] border-[#0145b8] bg-surface" />
                  <span className="mt-1 block text-[0.6875rem] whitespace-nowrap text-fg-muted">
                    {l}
                  </span>
                </span>
              ))}
              <span className="absolute top-1 -translate-x-1/2" style={{ left: `${pos(today)}%` }}>
                <span className="block h-7 w-0.5 rounded bg-[#fe760d]" />
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[0.625rem] font-semibold text-[var(--accent-spark-text)]">
                  TODAY
                </span>
              </span>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-subtle bg-surface p-5 shadow-1">
          <h2 className="mb-4 text-body-sm font-semibold">About</h2>
          <div className="grid gap-4">
            <label className={labelCls}>
              Summary (cards and search results)
              <textarea
                name="summary"
                rows={2}
                maxLength={280}
                defaultValue={opening.summary ?? ""}
                className={cn(field, "h-auto py-2")}
              />
            </label>
            <label className={labelCls}>
              Description
              <textarea
                name="description"
                rows={6}
                defaultValue={opening.description ?? ""}
                className={cn(field, "h-auto py-2")}
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-subtle bg-surface p-5 shadow-1">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-body-sm font-semibold">Application form</h2>
            {TEMPLATES[kind] && (
              <button
                type="button"
                onClick={() =>
                  setFields((x) => [
                    ...x,
                    ...TEMPLATES[kind]!.map((f) => ({ ...f, key: "", uid: uid() })),
                  ])
                }
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.8125rem] font-medium text-accent hover:bg-accent-soft"
              >
                <Wand2 className="size-3.5" aria-hidden /> Suggested questions for{" "}
                {KIND_LABELS[kind]?.toLowerCase()}
              </button>
            )}
          </div>
          <p className="mb-4 text-[0.8125rem] text-fg-muted">
            Name, email, phone and consent are always asked. Add your own questions below; drag to
            reorder.
          </p>
          <ol className="grid gap-2">
            {fields.map((f, i) => (
              <li
                key={f.uid}
                draggable
                onDragStart={(e) => {
                  setDrag(i);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(i);
                }}
                onDragEnd={() => {
                  setDrag(null);
                  setOver(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (drag !== null && drag !== i) moveTo(drag, i);
                  setDrag(null);
                  setOver(null);
                }}
                className={cn(
                  "rounded-xl border border-subtle bg-surface transition-[opacity,border-color,translate]",
                  drag === i && "opacity-40",
                  over === i && drag !== i && "border-accent",
                  open === f.uid && "border-strong shadow-1",
                )}
              >
                <div className="flex items-center gap-2 px-2 py-2">
                  <GripVertical className="size-4 shrink-0 cursor-grab text-fg-muted" aria-hidden />
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent [&_svg]:size-3.5">
                    {ICON[f.type]}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(open === f.uid ? null : f.uid)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-body-sm font-medium">
                      {f.label || "Untitled question"}
                      {f.required && <span className="ml-0.5 text-danger">*</span>}
                    </span>
                    <span className="text-[0.75rem] text-fg-muted">
                      {TYPES.find((t) => t.type === f.type)?.label}
                      {f.width === "half" ? " · half width" : ""}
                    </span>
                  </button>
                  <button
                    type="button"
                    aria-label="Duplicate"
                    onClick={() =>
                      setFields((x) => [
                        ...x.slice(0, i + 1),
                        { ...f, uid: uid(), key: "" },
                        ...x.slice(i + 1),
                      ])
                    }
                    className="grid size-8 place-items-center rounded-full text-fg-muted hover:bg-[var(--bg-sunken)] hover:text-fg"
                  >
                    <Copy className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => setFields((x) => x.filter((y) => y.uid !== f.uid))}
                    className="grid size-8 place-items-center rounded-full text-fg-muted hover:bg-[color-mix(in_oklab,var(--danger)_10%,transparent)] hover:text-danger"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <ChevronDown
                    className={cn(
                      "size-4 text-fg-muted transition-transform",
                      open === f.uid && "rotate-180",
                    )}
                    aria-hidden
                  />
                </div>
                {open === f.uid && (
                  <div className="office-page grid gap-3 border-t border-subtle p-3 sm:grid-cols-2">
                    <label className={cn(labelCls, "sm:col-span-2")}>
                      Question
                      <input
                        value={f.label}
                        onChange={(e) => patch(f.uid, { label: e.target.value })}
                        className={field}
                        autoFocus
                      />
                    </label>
                    <label className={labelCls}>
                      Type
                      <select
                        value={f.type}
                        onChange={(e) => patch(f.uid, { type: e.target.value as FieldType })}
                        className={field}
                      >
                        {TYPES.map((t) => (
                          <option key={t.type} value={t.type}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className={labelCls}>
                      Width
                      <select
                        value={f.width ?? "full"}
                        onChange={(e) => patch(f.uid, { width: e.target.value as "full" | "half" })}
                        className={field}
                      >
                        <option value="full">Full row</option>
                        <option value="half">Half row</option>
                      </select>
                    </label>
                    {(f.type === "select" || f.type === "radio") && (
                      <label className={cn(labelCls, "sm:col-span-2")}>
                        Choices (one per line)
                        <textarea
                          rows={4}
                          value={f.options ?? ""}
                          onChange={(e) => patch(f.uid, { options: e.target.value })}
                          className={cn(field, "h-auto py-2")}
                        />
                      </label>
                    )}
                    <label className={cn(labelCls, "sm:col-span-2")}>
                      Help text
                      <input
                        value={f.help ?? ""}
                        onChange={(e) => patch(f.uid, { help: e.target.value })}
                        className={field}
                      />
                    </label>
                    <label className="flex items-center gap-2 text-body-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(f.required)}
                        onChange={(e) => patch(f.uid, { required: e.target.checked })}
                        className="size-4 accent-[#0145b8]"
                      />
                      Required
                    </label>
                  </div>
                )}
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {TYPES.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => add(t.type)}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-strong px-2.5 py-1.5 text-[0.8125rem] text-fg-secondary transition-colors hover:border-accent hover:text-accent [&_svg]:size-3.5"
              >
                <Plus className="size-3" aria-hidden />
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <aside className="grid gap-5 xl:sticky xl:top-20">
        <section className="rounded-2xl border border-subtle bg-surface p-5 shadow-1">
          <h2 className="mb-3 text-body-sm font-semibold">Status</h2>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.keys(STATUS_HELP).map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={status === s}
                onClick={() => setStatus(s)}
                className="rounded-lg border border-subtle px-2 py-1.5 text-body-sm capitalize transition-colors aria-pressed:border-transparent aria-pressed:bg-[#0145b8] aria-pressed:font-semibold aria-pressed:text-white"
              >
                {s}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[0.75rem] text-fg-muted">{STATUS_HELP[status]}</p>
          <div className="mt-4 grid gap-2 text-body-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="requireAccount"
                defaultChecked={Boolean(opening.requireAccount)}
                className="size-4 accent-[#0145b8]"
              />
              Applicants sign in first
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={Boolean(opening.featured)}
                className="size-4 accent-[#0145b8]"
              />
              Feature on the openings page
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <SubmitButton pending={pending}>{opening.id ? "Save" : "Create opening"}</SubmitButton>
            {opening.id && slug && (
              <a
                href={`${siteUrl}/apply/${slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-body-sm font-medium text-accent hover:bg-accent-soft"
              >
                <ExternalLink className="size-4" aria-hidden /> View page
              </a>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-subtle bg-surface p-5 shadow-1">
          <h2 className="mb-1 text-body-sm font-semibold">Preview</h2>
          <p className="mb-4 text-[0.75rem] text-fg-muted">How the form looks to applicants.</p>
          <div className="rounded-xl bg-[var(--bg-sunken)] p-4">
            <p className="text-[0.6875rem] font-semibold tracking-wide text-accent uppercase">
              {KIND_LABELS[kind]}
            </p>
            <p className="font-display text-heading-md">{title || "Untitled opening"}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {["Full name", "Email", "Phone"].map((l) => (
                <PreviewField key={l} label={l} required half={l !== "Full name"} />
              ))}
              {fields.map((f) => (
                <PreviewField
                  key={f.uid}
                  label={f.label}
                  required={Boolean(f.required)}
                  half={f.width === "half"}
                  type={f.type}
                  options={f.options}
                />
              ))}
            </div>
            <span className="mt-3 block h-8 rounded-lg bg-[#fe760d]" />
          </div>
        </section>
      </aside>
    </form>
  );
}

function PreviewField({
  label,
  required,
  half,
  type = "text",
  options,
}: {
  label: string;
  required?: boolean;
  half?: boolean;
  type?: FieldType;
  options?: string | null;
}) {
  return (
    <div className={cn("office-page", half ? "col-span-1" : "col-span-2")}>
      <p className="truncate text-[0.6875rem] font-medium text-fg-secondary">
        {label || "Untitled"}
        {required && <span className="text-danger">*</span>}
      </p>
      {type === "radio" ? (
        <div className="mt-1 flex flex-wrap gap-1">
          {(options ?? "")
            .split("\n")
            .filter(Boolean)
            .slice(0, 4)
            .map((o) => (
              <span
                key={o}
                className="rounded-full border border-subtle bg-surface px-2 py-0.5 text-[0.625rem]"
              >
                {o}
              </span>
            ))}
        </div>
      ) : type === "checkbox" ? (
        <span className="mt-1 block size-3.5 rounded border border-strong bg-surface" />
      ) : (
        <span
          className={cn(
            "mt-1 block rounded-md border border-subtle bg-surface",
            type === "textarea" ? "h-10" : "h-6",
          )}
        />
      )}
    </div>
  );
}
