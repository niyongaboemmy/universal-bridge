// Turns raw audit entries into sentences people can read: who did what, to which
// record, and how it changed. Pure (unit tested); used by System logs and profiles.

export type LogCategory =
  "security" | "records" | "content" | "accounts" | "privacy" | "settings" | "public" | "system";

export const LOG_CATEGORIES: Record<LogCategory, { label: string; color: string }> = {
  security: { label: "Sign-in & security", color: "#7a4de0" },
  records: { label: "Records", color: "#0145b8" },
  content: { label: "Website content", color: "#0f8a6a" },
  accounts: { label: "Accounts & roles", color: "#c2410c" },
  privacy: { label: "Privacy & exports", color: "#be185d" },
  settings: { label: "Settings", color: "#0e7490" },
  public: { label: "Website submissions", color: "#fe760d" },
  system: { label: "System", color: "#64748b" },
};

/** Actions per category, for filters (SQL `action like …` patterns). */
export const CATEGORY_ACTIONS: Record<LogCategory, string[]> = {
  security: ["auth.%"],
  records: ["update", "delete"],
  content: ["live-edit.%", "update-content", "bulk-import", "download-pdf"],
  accounts: ["user.%", "role.%", "member.%"],
  privacy: ["privacy.%", "export.csv"],
  settings: ["settings.%"],
  public: ["submit", "apply"],
  system: ["retention.%", "job.%"],
};

export type LogEntry = {
  id: number | string;
  at: string;
  action: string;
  entity: string;
  entityId?: string | null;
  label?: string | null;
  actorName?: string | null;
  actorType?: string | null;
  meta?: Record<string, unknown> | null;
  ip?: string | null;
  device?: string | null;
};

const SINGULAR: Record<string, string> = {
  leads: "request",
  applications: "application",
  projects: "project",
  employees: "employee",
  openings: "opening",
  users: "staff account",
  members: "member account",
  roles: "role",
  pages: "page",
  posts: "post",
  services: "service",
  certificates: "certificate",
  programs: "program",
  intakes: "intake",
  jobs: "job post",
  events: "event",
  subscribers: "subscriber",
  media: "image",
  "system-settings": "settings",
};

const RECORD_ENTITIES = new Set(["leads", "applications", "projects", "employees", "openings"]);

export function categoryOf(action: string, entity: string): LogCategory {
  if (action.startsWith("auth.")) return "security";
  if (action.startsWith("user.") || action.startsWith("role.") || action.startsWith("member."))
    return action === "member.register" ? "public" : "accounts";
  if (action.startsWith("privacy.") || action === "export.csv") return "privacy";
  if (action.startsWith("settings.")) return "settings";
  if (action === "submit" || action === "apply") return "public";
  if (action.startsWith("retention.") || action.startsWith("job.")) return "system";
  if (action.startsWith("live-edit.") || !RECORD_ENTITIES.has(entity)) return "content";
  return "records";
}

export function entityName(entity: string) {
  return SINGULAR[entity] ?? entity.replace(/-/g, " ").replace(/s$/, "");
}

/** Office page for a record, when there is one. */
export function recordHref(entity: string, id?: string | null): string | null {
  if (!id) return null;
  switch (entity) {
    case "leads":
      return `/office/requests/${id}`;
    case "applications":
      return `/office/applicants/${id}`;
    case "projects":
      return `/office/projects/${id}`;
    case "employees":
      return `/office/people/${id}`;
    case "openings":
      return `/office/openings/${id}`;
    case "roles":
      return `/office/roles`;
    case "users":
      return `/office/accounts`;
    default:
      return null;
  }
}

const human = (s: unknown) => String(s ?? "").replace(/[-_]/g, " ");
const list = (a: unknown) =>
  Array.isArray(a) ? a.filter((x) => !["notes", "_status", "status"].includes(String(x))) : [];

/** The sentence parts: [actor] [verb …] [target] [detail]. */
export function describe(e: LogEntry): {
  actor: string;
  verb: string;
  target: string | null;
  detail: string | null;
  change?: { from: string; to: string };
  category: LogCategory;
  href: string | null;
} {
  const m = e.meta ?? {};
  const category = categoryOf(e.action, e.entity);
  const thing = entityName(e.entity);
  const target =
    e.label ?? (m.ref as string | undefined) ?? (e.entityId ? `${thing} #${e.entityId}` : null);
  const actor =
    e.actorName ??
    (e.actorType === "public"
      ? "Website visitor"
      : e.actorType === "member"
        ? "A member"
        : e.actorType === "staff"
          ? "A former staff member"
          : "System");
  const href = recordHref(e.entity, e.entityId);
  const base = { actor, category, href, target, detail: null as string | null };
  const fields = list(m.fields);
  switch (e.action) {
    case "auth.login":
      return {
        ...base,
        verb: "signed in",
        target: null,
        detail: m.method === "sso" ? "single sign-on" : null,
      };
    case "auth.logout":
      return { ...base, verb: "signed out", target: null };
    case "auth.login-throttled":
      return {
        ...base,
        actor: "Someone",
        verb: "was blocked after too many sign-in attempts",
        target: null,
      };
    case "auth.mfa-enrolled":
      return { ...base, verb: "set up two-step verification", target: null };
    case "auth.mfa-verified":
      return { ...base, verb: "passed two-step verification", target: null };
    case "auth.mfa-failed":
      return { ...base, verb: "entered a wrong two-step code", target: null };
    case "submit":
      return {
        ...base,
        actor: "Website visitor",
        verb: `sent a new ${m.type ? `${human(m.type)} ` : ""}${thing}`,
        detail: m.department ? human(m.department) : null,
      };
    case "apply":
      return { ...base, verb: "applied to", detail: (m.ref as string) ?? null };
    case "member.promote":
      return { ...base, verb: "became an applicant after a first application", target: null };
    case "member.register":
      return { ...base, verb: "registered a website account", target: null };
    case "update":
      if (m.from && m.to && m.from !== m.to)
        return {
          ...base,
          verb: `moved ${thing}`,
          change: { from: human(m.from), to: human(m.to) },
        };
      if (Array.isArray(m.fields) && m.fields.includes("notes") && !fields.length)
        return { ...base, verb: `added a note to ${thing}` };
      return {
        ...base,
        verb: `edited ${thing}`,
        detail: fields.length ? fields.slice(0, 4).map(human).join(", ") : null,
      };
    case "delete":
      return { ...base, verb: `deleted ${thing}` };
    case "live-edit.save":
      return { ...base, verb: `saved a draft of ${thing}`, detail: (m.path as string) ?? null };
    case "live-edit.publish":
      return { ...base, verb: `published ${thing}` };
    case "user.create":
      return { ...base, verb: "invited", detail: null };
    case "user.update":
      return {
        ...base,
        verb: "changed the account of",
        detail: Array.isArray(m.fields) ? m.fields.map(human).join(", ") : null,
      };
    case "user.delete":
      return { ...base, verb: "removed the account of" };
    case "role.create":
      return { ...base, verb: "created the role" };
    case "role.update": {
      const added = (m.added as string[] | undefined) ?? [];
      const removed = (m.removed as string[] | undefined) ?? [];
      const parts = [
        added.length ? `+ ${added.join(", ")}` : "",
        removed.length ? `− ${removed.join(", ")}` : "",
      ].filter(Boolean);
      return { ...base, verb: "changed the permissions of", detail: parts.join("  ") || null };
    }
    case "role.delete":
      return { ...base, verb: "deleted the role" };
    case "settings.update":
      return {
        ...base,
        verb: "changed settings",
        target: null,
        detail: Array.isArray(m.sections) ? m.sections.map(human).join(", ") : null,
      };
    case "export.csv":
      return {
        ...base,
        verb: `exported ${m.rows ?? ""} ${e.entity}`.replace(/\s+/g, " "),
        target: null,
        detail: "CSV",
      };
    case "privacy.lookup":
      return { ...base, verb: "looked up a person's data", target: null };
    case "privacy.export":
      return { ...base, verb: "exported a person's data", target: null };
    case "privacy.erase":
      return { ...base, verb: "erased a person's data", target: null };
    case "retention.purge":
      return {
        ...base,
        actor: "System",
        verb: "removed records past their retention period",
        target: null,
      };
    case "download-pdf":
      return { ...base, verb: "downloaded the PDF of" };
    case "bulk-import":
      return {
        ...base,
        verb: `imported ${m.count ?? ""} ${e.entity}`.replace(/\s+/g, " "),
        target: null,
      };
    default:
      return { ...base, verb: human(e.action) + (thing ? ` ${thing}` : "") };
  }
}

/** Notable entries (shown with a warning tone). */
export function isAlert(e: Pick<LogEntry, "action">) {
  return (
    e.action === "auth.login-throttled" ||
    e.action === "auth.mfa-failed" ||
    e.action.startsWith("privacy.erase") ||
    e.action === "user.delete" ||
    e.action === "role.delete" ||
    e.action === "delete"
  );
}
