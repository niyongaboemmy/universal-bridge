"use server";

import { revalidatePath } from "next/cache";
import { payload } from "@/lib/cms/payload";
import { APPLICATION_STATUSES } from "@/collections/Applications";
import {
  EMPLOYMENT,
  DEPARTMENTS_STAFF,
  PROJECT_KINDS,
  PROJECT_STATUSES,
} from "@/collections/Company";
import { LEAD_STATUSES } from "@/collections/Leads";
import { officeUser } from "./session";

/**
 * Company dashboard mutations. Every write goes through Payload as the signed-in
 * user: collection access (roles), field validation, audit hooks and the
 * applicant status emails all apply exactly as in the admin.
 */
export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

async function run(fn: () => Promise<unknown>, message?: string): Promise<ActionResult> {
  try {
    await fn();
    revalidatePath("/office", "layout");
    return { ok: true, message };
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 403) return { ok: false, error: "Your role can't change this." };
    return { ok: false, error: (e as Error).message || "Something went wrong." };
  }
}

const num = (v: FormDataEntryValue | null) => (v === null || v === "" ? null : Number(v));
const str = (v: FormDataEntryValue | null) => (typeof v === "string" && v.trim() ? v.trim() : null);
const date = (v: FormDataEntryValue | null) =>
  typeof v === "string" && v ? new Date(v).toISOString() : null;

// ---- Requests (leads) ------------------------------------------------------------

export async function updateLead(
  id: number,
  patch: {
    status?: string;
    assignee?: number | null;
    value?: number | null;
    currency?: string;
    nextFollowUpAt?: string | null;
  },
): Promise<ActionResult> {
  const user = await officeUser();
  if (patch.status && !(LEAD_STATUSES as readonly string[]).includes(patch.status))
    return { ok: false, error: "Unknown status" };
  return run(async () => {
    const p = await payload();
    await p.update({ collection: "leads", id, data: patch as never, user, overrideAccess: false });
  }, "Saved");
}

export async function addLeadNote(id: number, body: string): Promise<ActionResult> {
  const user = await officeUser();
  if (!body.trim()) return { ok: false, error: "Write a note first." };
  return run(async () => {
    const p = await payload();
    const lead = await p.findByID({
      collection: "leads",
      id,
      depth: 0,
      user,
      overrideAccess: false,
    });
    await p.update({
      collection: "leads",
      id,
      data: { notes: [...(lead.notes ?? []), { body: body.trim().slice(0, 4000) }] } as never,
      user,
      overrideAccess: false,
    });
  }, "Note added");
}

// ---- Applicants -------------------------------------------------------------------

export async function updateApplication(
  id: number,
  patch: {
    status?: string;
    rating?: number | null;
    assignee?: number | null;
    notifyApplicant?: boolean;
  },
): Promise<ActionResult> {
  const user = await officeUser();
  if (patch.status && !(APPLICATION_STATUSES as readonly string[]).includes(patch.status))
    return { ok: false, error: "Unknown status" };
  return run(
    async () => {
      const p = await payload();
      await p.update({
        collection: "applications",
        id,
        data: patch as never,
        user,
        overrideAccess: false,
      });
    },
    patch.status ? "Status updated" : "Saved",
  );
}

export async function addApplicationNote(id: number, body: string): Promise<ActionResult> {
  const user = await officeUser();
  if (!body.trim()) return { ok: false, error: "Write a note first." };
  return run(async () => {
    const p = await payload();
    const app = await p.findByID({
      collection: "applications",
      id,
      depth: 0,
      user,
      overrideAccess: false,
    });
    await p.update({
      collection: "applications",
      id,
      data: { notes: [...(app.notes ?? []), { body: body.trim().slice(0, 4000) }] } as never,
      user,
      overrideAccess: false,
    });
  }, "Note added");
}

// ---- Projects ---------------------------------------------------------------------

export async function saveProject(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await officeUser();
  const id = num(form.get("id"));
  const kind = String(form.get("kind") ?? "client");
  const status = String(form.get("status") ?? "planning");
  if (
    !(PROJECT_KINDS as readonly string[]).includes(kind) ||
    !(PROJECT_STATUSES as readonly string[]).includes(status)
  ) {
    return { ok: false, error: "Pick a type and status." };
  }
  const data = {
    name: str(form.get("name")),
    code: str(form.get("code")),
    kind,
    status,
    health: str(form.get("health")) ?? "on-track",
    summary: str(form.get("summary")),
    client: str(form.get("client")),
    startDate: date(form.get("startDate")),
    dueDate: date(form.get("dueDate")),
    progress: Math.min(100, Math.max(0, num(form.get("progress")) ?? 0)),
    budget: num(form.get("budget")),
    currency: str(form.get("currency")) ?? "RWF",
    owner: num(form.get("owner")),
    team: form.getAll("team").map(Number).filter(Boolean),
    ...(num(form.get("lead")) ? { lead: num(form.get("lead")) } : {}),
  };
  if (!data.name) return { ok: false, error: "Give the project a name." };
  return run(
    async () => {
      const p = await payload();
      if (id)
        await p.update({
          collection: "projects",
          id,
          data: data as never,
          user,
          overrideAccess: false,
        });
      else
        await p.create({
          collection: "projects",
          data: data as never,
          user,
          overrideAccess: false,
        });
    },
    id ? "Project saved" : "Project created",
  );
}

export async function updateProject(
  id: number,
  patch: { status?: string; health?: string; progress?: number },
): Promise<ActionResult> {
  const user = await officeUser();
  return run(async () => {
    const p = await payload();
    await p.update({
      collection: "projects",
      id,
      data: patch as never,
      user,
      overrideAccess: false,
    });
  }, "Saved");
}

export async function setEmployeeStatus(id: number, status: string): Promise<ActionResult> {
  const user = await officeUser();
  if (!["active", "on-leave", "left"].includes(status))
    return { ok: false, error: "Unknown status" };
  return run(async () => {
    const p = await payload();
    await p.update({
      collection: "employees",
      id,
      data: {
        status,
        ...(status === "left" ? { endDate: new Date().toISOString() } : {}),
      } as never,
      user,
      overrideAccess: false,
    });
  }, "Saved");
}

export async function setMilestones(
  id: number,
  milestones: { id?: string; title: string; due?: string | null; done?: boolean }[],
): Promise<ActionResult> {
  const user = await officeUser();
  const clean = milestones
    .filter((m) => m.title?.trim())
    .slice(0, 50)
    .map((m) => ({
      ...(m.id ? { id: m.id } : {}),
      title: m.title.trim().slice(0, 160),
      due: m.due || null,
      done: Boolean(m.done),
    }));
  return run(async () => {
    const p = await payload();
    const done = clean.length
      ? Math.round((clean.filter((m) => m.done).length / clean.length) * 100)
      : undefined;
    await p.update({
      collection: "projects",
      id,
      data: { milestones: clean, ...(done !== undefined ? { progress: done } : {}) } as never,
      user,
      overrideAccess: false,
    });
  }, "Milestones saved");
}

// ---- People -----------------------------------------------------------------------

export async function saveEmployee(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const user = await officeUser();
  const id = num(form.get("id"));
  const department = String(form.get("department") ?? "");
  const employment = String(form.get("employment") ?? "full-time");
  if (!(DEPARTMENTS_STAFF as readonly string[]).includes(department))
    return { ok: false, error: "Pick a department." };
  if (!(EMPLOYMENT as readonly string[]).includes(employment))
    return { ok: false, error: "Pick an employment type." };
  const data = {
    name: str(form.get("name")),
    jobTitle: str(form.get("jobTitle")),
    department,
    employment,
    status: str(form.get("status")) ?? "active",
    email: str(form.get("email")),
    phone: str(form.get("phone")),
    startDate: date(form.get("startDate")),
    endDate: date(form.get("endDate")),
    manager: num(form.get("manager")),
    skills: String(form.get("skills") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 20),
    notes: str(form.get("notes")),
  };
  if (!data.name || !data.jobTitle || !data.email || !data.startDate) {
    return { ok: false, error: "Name, job title, email and start date are required." };
  }
  return run(
    async () => {
      const p = await payload();
      if (id)
        await p.update({
          collection: "employees",
          id,
          data: data as never,
          user,
          overrideAccess: false,
        });
      else
        await p.create({
          collection: "employees",
          data: data as never,
          user,
          overrideAccess: false,
        });
    },
    id ? "Employee saved" : "Employee added",
  );
}
