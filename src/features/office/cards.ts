import { fmtMoney, hoursSince, timeAgo, titleCase } from "@/components/office/format";
import type { KanbanItem } from "@/components/office/Kanban";
import type { Application, Employee, Lead, Opening, Project } from "@/payload-types";

/** Reply-time urgency: new requests should get an answer within a day (IX-10). */
export function leadUrgency(l: Lead, responseHours = 24): KanbanItem["urgency"] {
  if (l.status !== "new")
    return l.nextFollowUpAt && new Date(l.nextFollowUpAt).getTime() < Date.now() ? "warn" : "ok";
  const h = hoursSince(l.createdAt);
  return h > responseHours ? "late" : h > responseHours / 3 ? "warn" : "ok";
}

const ownerName = (a: Lead["assignee"] | Application["assignee"]) =>
  a && typeof a === "object" ? (a.name || a.email).split(" ")[0] : undefined;

export function leadCard(l: Lead, responseHours = 24): KanbanItem {
  const services = Array.isArray(l.services)
    ? (l.services as string[]).map(titleCase).slice(0, 2)
    : [];
  return {
    id: l.id,
    column: l.status,
    title: l.name,
    subtitle: l.company || l.email,
    meta: [...services, ...(l.budgetRange ? [l.budgetRange] : [])],
    badge: [timeAgo(l.createdAt), ownerName(l.assignee)].filter(Boolean).join(" · "),
    urgency: leadUrgency(l, responseHours),
    href: `/office/requests/${l.id}`,
    value: l.value ? fmtMoney(l.value, l.currency ?? "RWF") : undefined,
  };
}

export function applicationCard(a: Application): KanbanItem {
  const waiting = a.status === "received" ? hoursSince(a.createdAt) : 0;
  return {
    id: a.id,
    column: a.status,
    title: a.name,
    subtitle: a.subject || a.email,
    meta: a.rating ? ["★".repeat(a.rating)] : [],
    badge: [timeAgo(a.createdAt), ownerName(a.assignee)].filter(Boolean).join(" · "),
    urgency: waiting > 72 ? "late" : waiting > 24 ? "warn" : "ok",
    href: `/office/applicants/${a.id}`,
  };
}

export type OpeningStats = { applications: number; accepted: number; pending: number };

export function openingCard(
  o: Opening,
  s: OpeningStats = { applications: 0, accepted: 0, pending: 0 },
  now = Date.now(),
): KanbanItem {
  const closes = o.closesAt ? new Date(o.closesAt).getTime() : null;
  const days = closes ? Math.ceil((closes - now) / 86_400_000) : null;
  return {
    id: o.id,
    column: o.status,
    title: o.title,
    subtitle: [titleCase(o.kind), o.mode ? titleCase(o.mode) : null].filter(Boolean).join(" · "),
    meta: [
      `${s.applications} applied`,
      ...(s.pending ? [`${s.pending} to review`] : []),
      ...(o.seats ? [`${s.accepted}/${o.seats} seats`] : []),
    ],
    badge:
      days === null
        ? "No deadline"
        : days < 0
          ? `Closed ${timeAgo(o.closesAt)}`
          : days === 0
            ? "Closes today"
            : `Closes in ${days} d`,
    urgency: o.status === "open" && days !== null && days >= 0 && days <= 3 ? "warn" : "ok",
    href: `/office/openings/${o.id}`,
    progress: o.seats ? s.accepted / o.seats : undefined,
  };
}

export function projectCard(p: Project): KanbanItem {
  return {
    id: p.id,
    column: p.status,
    title: p.name,
    subtitle: [titleCase(p.kind), p.client].filter(Boolean).join(" · "),
    meta: p.health && p.health !== "on-track" ? [titleCase(p.health)] : [],
    badge: p.dueDate
      ? `Due ${new Date(p.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
      : undefined,
    urgency: p.health === "off-track" ? "late" : p.health === "at-risk" ? "warn" : "ok",
    href: `/office/projects/${p.id}`,
    progress: typeof p.progress === "number" ? p.progress / 100 : undefined,
  };
}

export function employeeCard(e: Employee): KanbanItem {
  return {
    id: e.id,
    column: e.status,
    title: e.name,
    subtitle: e.jobTitle ?? undefined,
    meta: [titleCase(e.department), titleCase(e.employment)],
    badge: e.startDate ? `Since ${new Date(e.startDate).getFullYear()}` : undefined,
    href: `/office/people/${e.id}`,
  };
}
