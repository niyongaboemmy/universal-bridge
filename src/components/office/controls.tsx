"use client";

import { Check, Plus, Star, Trash2 } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import {
  addApplicationNote,
  addLeadNote,
  saveEmployee,
  saveProject,
  setMilestones,
  updateApplication,
  updateLead,
  type ActionResult,
} from "@/features/office/actions";
import { CURRENCIES } from "@/lib/currencies";
import { cn } from "@/lib/utils";

/**
 * One save at a time per page. Payload writes whole records, so two overlapping
 * saves on the same record (e.g. a follow-up date and a note) could let the
 * slower one overwrite the other; queuing them keeps every change.
 */
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.catch(() => undefined);
  return next;
}

const field = "ui-field";
const label = "grid gap-1.5 text-[0.8125rem] font-medium text-fg-secondary";

function Feedback({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return (
    <p role="status" className={cn("text-[0.8125rem]", result.ok ? "text-success" : "text-danger")}>
      {result.ok ? (result.message ?? "Saved") : result.error}
    </p>
  );
}

/** Saves on change (no Save button): status, owner, value, follow-up. */
export function LeadControls({
  id,
  status,
  statuses,
  assignee,
  users,
  value,
  currency,
  nextFollowUpAt,
}: {
  id: number;
  status: string;
  statuses: readonly string[];
  assignee?: number | null;
  users: { id: number; name: string }[];
  value?: number | null;
  currency?: string | null;
  nextFollowUpAt?: string | null;
}) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const save = (patch: Parameters<typeof updateLead>[1]) =>
    start(async () => setResult(await serial(() => updateLead(id, patch))));
  return (
    <div className="grid gap-4">
      <label className={label}>
        Stage
        <select
          className={field}
          defaultValue={status}
          onChange={(e) => save({ status: e.target.value })}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s[0]!.toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <label className={label}>
        Owner
        <select
          className={field}
          defaultValue={assignee ?? ""}
          onChange={(e) => save({ assignee: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-[1fr_6rem] gap-2">
        <label className={label}>
          Estimated value
          <input
            className={field}
            type="number"
            min={0}
            step={1000}
            defaultValue={value ?? ""}
            onBlur={(e) => save({ value: e.target.value ? Number(e.target.value) : null })}
          />
        </label>
        <label className={label}>
          Currency
          <select
            className={field}
            defaultValue={currency ?? "RWF"}
            onChange={(e) => save({ currency: e.target.value })}
          >
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <label className={label}>
        Next follow-up
        <input
          className={field}
          type="date"
          defaultValue={nextFollowUpAt ? nextFollowUpAt.slice(0, 10) : ""}
          onChange={(e) =>
            save({
              nextFollowUpAt: e.target.value
                ? new Date(e.target.value + "T09:00:00+02:00").toISOString()
                : null,
            })
          }
        />
      </label>
      <div className="min-h-5">
        {pending ? (
          <p className="text-[0.8125rem] text-fg-muted">Saving…</p>
        ) : (
          <Feedback result={result} />
        )}
      </div>
    </div>
  );
}

export function ApplicationControls({
  id,
  status,
  statuses,
  rating,
  assignee,
  users,
  notify,
}: {
  id: number;
  status: string;
  statuses: readonly string[];
  rating?: number | null;
  assignee?: number | null;
  users: { id: number; name: string }[];
  notify: boolean;
}) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [stars, setStars] = useState(rating ?? 0);
  const [pending, start] = useTransition();
  const save = (patch: Parameters<typeof updateApplication>[1]) =>
    start(async () => setResult(await serial(() => updateApplication(id, patch))));
  return (
    <div className="grid gap-4">
      <label className={label}>
        Stage
        <select
          className={field}
          defaultValue={status}
          onChange={(e) => save({ status: e.target.value })}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "review" ? "Under review" : s[0]!.toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <div className={label}>
        Screening score
        <div className="flex gap-1" role="radiogroup" aria-label="Screening score">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={stars === n}
              aria-label={`${n} of 5`}
              onClick={() => {
                const next = stars === n ? 0 : n;
                setStars(next);
                save({ rating: next || null });
              }}
              className="rounded-md p-1 text-[var(--accent-spark)] transition-transform hover:scale-110"
            >
              <Star
                className={cn("size-5", n <= stars ? "fill-current" : "opacity-40")}
                aria-hidden
              />
            </button>
          ))}
        </div>
      </div>
      <label className={label}>
        Reviewer
        <select
          className={field}
          defaultValue={assignee ?? ""}
          onChange={(e) => save({ assignee: e.target.value ? Number(e.target.value) : null })}
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-start gap-2 text-[0.8125rem] text-fg-secondary">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-[var(--accent-primary)]"
          defaultChecked={notify}
          onChange={(e) => save({ notifyApplicant: e.target.checked })}
        />
        Email the applicant when the stage changes to shortlisted, accepted, rejected or waitlisted
      </label>
      <div className="min-h-5">
        {pending ? (
          <p className="text-[0.8125rem] text-fg-muted">Saving…</p>
        ) : (
          <Feedback result={result} />
        )}
      </div>
    </div>
  );
}

export function NoteForm({ id, kind }: { id: number; kind: "lead" | "application" }) {
  const [body, setBody] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="grid gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await serial(() =>
            kind === "lead" ? addLeadNote(id, body) : addApplicationNote(id, body),
          );
          setResult(r);
          if (r.ok) setBody("");
        });
      }}
    >
      <label htmlFor={`note-${id}`} className="sr-only">
        Add a note
      </label>
      <textarea
        id={`note-${id}`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) e.currentTarget.form?.requestSubmit();
        }}
        rows={3}
        placeholder="Add a note for the team… (Ctrl/Cmd + Enter)"
        className="ui-field min-h-24"
      />
      <div className="flex items-center justify-between gap-3">
        <Feedback result={result} />
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="ml-auto inline-flex h-9 items-center rounded-full bg-spark px-4 text-body-sm font-medium text-on-spark disabled:opacity-50"
        >
          Add note
        </button>
      </div>
    </form>
  );
}

type Option = { id: number; name: string };

export function ProjectForm({
  project,
  employees,
  leadId,
}: {
  project?: {
    id: number;
    name: string;
    code?: string | null;
    kind: string;
    status: string;
    health: string;
    summary?: string | null;
    client?: string | null;
    startDate?: string | null;
    dueDate?: string | null;
    progress?: number | null;
    budget?: number | null;
    currency?: string | null;
    owner?: number | null;
    team?: number[];
  };
  employees: Option[];
  /** Creating from a won request: links the project back to it. */
  leadId?: number;
}) {
  const [result, action, pending] = useActionState(saveProject, null);
  const creating = !project?.id;
  useEffect(() => {
    if (result?.ok && creating) window.location.href = "/office/projects";
  }, [result, creating]);
  const d = (v?: string | null) => (v ? v.slice(0, 10) : "");
  return (
    <form action={action} className="grid gap-4">
      {project?.id ? <input type="hidden" name="id" value={project.id} /> : null}
      {leadId ? <input type="hidden" name="lead" value={leadId} /> : null}
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <label className={label}>
          Name
          <input className={field} name="name" required defaultValue={project?.name} />
        </label>
        <label className={label}>
          Code
          <input
            className={field}
            name="code"
            defaultValue={project?.code ?? ""}
            placeholder="NYB"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label}>
          Type
          <select className={field} name="kind" defaultValue={project?.kind ?? "client"}>
            <option value="client">Client project</option>
            <option value="internal-tool">Internal tool</option>
            <option value="product">Product</option>
          </select>
        </label>
        <label className={label}>
          Status
          <select className={field} name="status" defaultValue={project?.status ?? "planning"}>
            {["planning", "active", "on-hold", "done", "cancelled"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Health
          <select className={field} name="health" defaultValue={project?.health ?? "on-track"}>
            <option value="on-track">On track</option>
            <option value="at-risk">At risk</option>
            <option value="off-track">Off track</option>
          </select>
        </label>
      </div>
      <label className={label}>
        Summary
        <textarea
          className={cn(field, "h-auto py-2")}
          rows={3}
          name="summary"
          defaultValue={project?.summary ?? ""}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label}>
          Client / owner
          <input className={field} name="client" defaultValue={project?.client ?? ""} />
        </label>
        <label className={label}>
          Start
          <input
            className={field}
            type="date"
            name="startDate"
            defaultValue={d(project?.startDate)}
          />
        </label>
        <label className={label}>
          Due
          <input className={field} type="date" name="dueDate" defaultValue={d(project?.dueDate)} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label}>
          Progress (%)
          <input
            className={field}
            type="number"
            min={0}
            max={100}
            name="progress"
            defaultValue={project?.progress ?? 0}
          />
        </label>
        <label className={label}>
          Budget
          <input
            className={field}
            type="number"
            min={0}
            name="budget"
            defaultValue={project?.budget ?? ""}
          />
        </label>
        <label className={label}>
          Currency
          <select className={field} name="currency" defaultValue={project?.currency ?? "RWF"}>
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Lead
          <select className={field} name="owner" defaultValue={project?.owner ?? ""}>
            <option value="">—</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Team <span className="font-normal text-fg-muted">(Ctrl/Cmd-click for several)</span>
          <select
            className={cn(field, "h-28 py-1")}
            name="team"
            multiple
            defaultValue={(project?.team ?? []).map(String)}
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center justify-between gap-3">
        <Feedback result={result} />
        <button
          type="submit"
          disabled={pending}
          className="ml-auto inline-flex h-10 items-center rounded-full bg-spark px-5 font-medium text-on-spark disabled:opacity-60"
        >
          {creating ? "Create project" : "Save project"}
        </button>
      </div>
    </form>
  );
}

export function Milestones({
  id,
  initial,
}: {
  id: number;
  initial: { id?: string | null; title: string; due?: string | null; done?: boolean | null }[];
}) {
  const [list, setList] = useState(
    initial.map((m) => ({
      id: m.id ?? undefined,
      title: m.title,
      due: m.due?.slice(0, 10) ?? "",
      done: Boolean(m.done),
    })),
  );
  const [title, setTitle] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();
  const persist = (next: typeof list) => {
    setList(next);
    start(async () =>
      setResult(
        await serial(() =>
          setMilestones(
            id,
            next.map((m) => ({ ...m, due: m.due ? new Date(m.due).toISOString() : null })),
          ),
        ),
      ),
    );
  };
  const done = list.filter((m) => m.done).length;
  return (
    <div className="grid gap-3">
      <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-sunken)]">
        <div
          className="office-bar h-full rounded-full bg-[linear-gradient(90deg,var(--accent-primary),var(--accent-spark))] transition-[width] duration-500"
          style={{ width: `${list.length ? (done / list.length) * 100 : 0}%` }}
        />
      </div>
      <p className="text-[0.8125rem] text-fg-secondary">
        {done} of {list.length} done{pending ? " · saving…" : ""}
      </p>
      <ul className="grid gap-1">
        {list.map((m, i) => (
          <li
            key={m.id ?? `new-${i}`}
            className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--bg-sunken)]"
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={m.done}
              aria-label={m.title}
              onClick={() => persist(list.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))}
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                m.done ? "border-transparent bg-success text-white" : "border-strong",
              )}
            >
              {m.done && <Check className="size-3.5" aria-hidden />}
            </button>
            <span className={cn("flex-1 text-body-sm", m.done && "text-fg-muted line-through")}>
              {m.title}
            </span>
            {m.due && (
              <span className="text-[0.75rem] text-fg-muted">
                {new Date(m.due).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </span>
            )}
            <button
              type="button"
              aria-label={`Remove ${m.title}`}
              onClick={() => persist(list.filter((_, j) => j !== i))}
              className="text-fg-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-danger"
            >
              <Trash2 className="size-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          persist([...list, { id: undefined, title: title.trim(), due: "", done: false }]);
          setTitle("");
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a milestone…"
          aria-label="New milestone"
          className={field}
        />
        <button
          type="submit"
          className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full border border-subtle px-3 text-body-sm font-medium hover:border-strong"
        >
          <Plus className="size-4" aria-hidden /> Add
        </button>
      </form>
      <Feedback result={result && !result.ok ? result : null} />
    </div>
  );
}

export function EmployeeForm({
  employee,
  managers,
}: {
  employee?: {
    id: number;
    name: string;
    jobTitle: string;
    department: string;
    employment: string;
    status: string;
    email: string;
    phone?: string | null;
    startDate: string;
    endDate?: string | null;
    manager?: number | null;
    skills?: string[] | null;
    notes?: string | null;
  };
  managers: Option[];
}) {
  const [result, action, pending] = useActionState(saveEmployee, null);
  useEffect(() => {
    if (result?.ok && !employee) window.location.href = "/office/people";
  }, [result, employee]);
  const d = (v?: string | null) => (v ? v.slice(0, 10) : "");
  return (
    <form action={action} className="grid gap-4">
      {employee && <input type="hidden" name="id" value={employee.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Full name
          <input className={field} name="name" required defaultValue={employee?.name} />
        </label>
        <label className={label}>
          Job title
          <input className={field} name="jobTitle" required defaultValue={employee?.jobTitle} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label}>
          Department
          <select
            className={field}
            name="department"
            defaultValue={employee?.department ?? "engineering"}
          >
            {["leadership", "engineering", "design", "academy", "sales", "operations", "labs"].map(
              (v) => (
                <option key={v} value={v}>
                  {v[0]!.toUpperCase() + v.slice(1)}
                </option>
              ),
            )}
          </select>
        </label>
        <label className={label}>
          Employment
          <select
            className={field}
            name="employment"
            defaultValue={employee?.employment ?? "full-time"}
          >
            {["full-time", "part-time", "contract", "intern"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Status
          <select className={field} name="status" defaultValue={employee?.status ?? "active"}>
            {["active", "on-leave", "left"].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Work email
          <input
            className={field}
            type="email"
            name="email"
            required
            defaultValue={employee?.email}
          />
        </label>
        <label className={label}>
          Phone
          <input className={field} type="tel" name="phone" defaultValue={employee?.phone ?? ""} />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className={label}>
          Start date
          <input
            className={field}
            type="date"
            name="startDate"
            required
            defaultValue={d(employee?.startDate)}
          />
        </label>
        <label className={label}>
          End date
          <input className={field} type="date" name="endDate" defaultValue={d(employee?.endDate)} />
        </label>
        <label className={label}>
          Reports to
          <select className={field} name="manager" defaultValue={employee?.manager ?? ""}>
            <option value="">—</option>
            {managers
              .filter((m) => m.id !== employee?.id)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>
        </label>
      </div>
      <label className={label}>
        Skills <span className="font-normal text-fg-muted">(comma-separated)</span>
        <input
          className={field}
          name="skills"
          defaultValue={(employee?.skills ?? []).join(", ")}
          placeholder="React, IoT, Teaching"
        />
      </label>
      <label className={label}>
        HR notes
        <textarea
          className={cn(field, "h-auto py-2")}
          rows={3}
          name="notes"
          defaultValue={employee?.notes ?? ""}
        />
      </label>
      <div className="flex items-center justify-between gap-3">
        <Feedback result={result} />
        <button
          type="submit"
          disabled={pending}
          className="ml-auto inline-flex h-10 items-center rounded-full bg-spark px-5 font-medium text-on-spark disabled:opacity-60"
        >
          {employee ? "Save" : "Add employee"}
        </button>
      </div>
    </form>
  );
}

/** "On the site now": polls every 15 s while the tab is visible. */
export function Realtime({
  initial,
}: {
  initial: { now: number; pages: { path: string; n: number }[] };
}) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    let timer = 0;
    const tick = async () => {
      if (document.visibilityState === "visible") {
        const res = await fetch("/api/office/realtime", { cache: "no-store" }).catch(() => null);
        if (res?.ok) setData(await res.json());
      }
      timer = window.setTimeout(tick, 10000);
    };
    timer = window.setTimeout(tick, 10000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div>
      <p className="flex items-center gap-2 text-body-sm text-fg-secondary">
        <span className="relative flex size-2.5">
          {data.now > 0 && (
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
          )}
          <span
            className={cn(
              "relative inline-flex size-2.5 rounded-full",
              data.now > 0 ? "bg-success" : "bg-fg-muted",
            )}
          />
        </span>
        On the site now
      </p>
      <p className="mt-1 font-display text-display-lg tabular-nums" aria-live="polite">
        {data.now}
      </p>
      {data.pages.length > 0 ? (
        <ul className="mt-2 space-y-1 text-[0.8125rem] text-fg-secondary">
          {data.pages.map((p) => (
            <li key={p.path} className="flex items-center justify-between gap-2">
              <span className="truncate">{p.path}</span>
              <span className="shrink-0 tabular-nums text-fg-muted">{p.n}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-[0.8125rem] text-fg-muted">
          Counts visitors with a page open in the last 2 minutes.
        </p>
      )}
    </div>
  );
}
