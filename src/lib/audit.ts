import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  PayloadRequest,
} from "payload";

/** Write one audit entry (ADM-08). Uses the caller's transaction. */
export async function audit(
  req: PayloadRequest,
  entry: {
    action: string;
    entity: string;
    entityId?: string | number;
    /** What the target is called (a ref, title or slug — never a person's details). */
    label?: string | null;
    meta?: Record<string, unknown>;
  },
) {
  const user = req.user as {
    id: number;
    collection?: string;
    name?: string;
    email?: string;
  } | null;
  const h = req.headers;
  const ip =
    h?.get?.("x-forwarded-for")?.split(",")[0]?.trim() || h?.get?.("x-real-ip") || undefined;
  await req.payload.create({
    collection: "audit-log",
    overrideAccess: true,
    req,
    data: {
      at: new Date().toISOString(),
      actor: user?.collection === "users" ? user.id : undefined,
      member: user?.collection === "members" ? user.id : undefined,
      actorType:
        user?.collection === "users"
          ? "staff"
          : user?.collection === "members"
            ? "member"
            : entry.action === "submit"
              ? "public"
              : "system",
      actorName: user ? user.name || user.email : undefined,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId === undefined ? undefined : String(entry.entityId),
      label: entry.label ?? undefined,
      meta: entry.meta,
      ip: ip ? anonymiseIp(ip) : undefined,
      device: h?.get?.("user-agent") ? device(h.get("user-agent")!) : undefined,
    },
  });
}

/** Last block of the address dropped (IPv4 /24, IPv6 /48): enough to spot patterns, not a person. */
export function anonymiseIp(ip: string) {
  if (ip.includes(".")) return ip.split(".").slice(0, 3).join(".") + ".0";
  return ip.split(":").slice(0, 3).join(":") + "::";
}

/** "Chrome · macOS" from a user agent. */
export function device(ua: string) {
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Firefox\//.test(ua)
      ? "Firefox"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Safari\//.test(ua)
          ? "Safari"
          : /curl|node|undici|Playwright|Headless/i.test(ua)
            ? "Script"
            : "Browser";
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Mac OS X|Macintosh/.test(ua)
        ? "macOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser} · ${os}` : browser;
}

/** A non-personal name for a record in the log. */
export function recordLabel(entity: string, doc: Record<string, unknown> | undefined) {
  if (!doc) return undefined;
  const v = doc.ref ?? doc.title ?? doc.slug ?? doc.code;
  if (typeof v === "string" && v) return v.slice(0, 120);
  if (
    ["projects", "employees", "openings", "roles"].includes(entity) &&
    typeof doc.name === "string"
  )
    return doc.name.slice(0, 120);
  return undefined;
}

/** Changed top-level field names, without values (no personal data in the log). */
function changedFields(
  doc: Record<string, unknown>,
  previous: Record<string, unknown> | undefined,
) {
  if (!previous) return [];
  return Object.keys(doc).filter(
    (k) =>
      !["updatedAt", "createdAt"].includes(k) &&
      JSON.stringify(doc[k]) !== JSON.stringify(previous[k]),
  );
}

export function auditHooks(entity: string): {
  beforeChange: CollectionBeforeChangeHook[];
  afterChange: CollectionAfterChangeHook[];
  afterDelete: CollectionAfterDeleteHook[];
} {
  return {
    beforeChange: [
      // ADM-04: notes are signed by whoever adds them.
      ({ data, req }) => {
        if (Array.isArray(data?.notes) && req.user?.collection === "users") {
          data.notes = data.notes.map((n: { author?: unknown; at?: string }) =>
            n.author ? n : { ...n, author: req.user!.id, at: n.at ?? new Date().toISOString() },
          );
        }
        return data;
      },
      // IX-10: stamp the first response when a lead/application leaves its initial status.
      ({ data, originalDoc, operation }) => {
        if (operation === "update" && originalDoc && !originalDoc.firstResponseAt) {
          const initial = ["new", "received"];
          if (
            initial.includes(originalDoc.status) &&
            data.status &&
            !initial.includes(data.status)
          ) {
            data.firstResponseAt = new Date().toISOString();
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        // Public submissions are logged by the form action itself; log staff edits here.
        if (req.user && operation === "update") {
          const fields = changedFields(doc, previousDoc);
          await audit(req, {
            action: "update",
            entity,
            entityId: doc.id,
            label: recordLabel(entity, doc),
            meta: {
              fields,
              status: doc.status,
              ...(fields.includes("status") ? { from: previousDoc?.status, to: doc.status } : {}),
            },
          });
        }
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (req.user)
          await audit(req, {
            action: "delete",
            entity,
            entityId: doc.id,
            label: recordLabel(entity, doc),
          });
        return doc;
      },
    ],
  };
}
