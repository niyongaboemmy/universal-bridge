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
    meta?: Record<string, unknown>;
  },
) {
  await req.payload.create({
    collection: "audit-log",
    overrideAccess: true,
    req,
    data: {
      at: new Date().toISOString(),
      actor: req.user && req.user.collection === "users" ? req.user.id : undefined,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId === undefined ? undefined : String(entry.entityId),
      meta: entry.meta,
    },
  });
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
          await audit(req, {
            action: "update",
            entity,
            entityId: doc.id,
            meta: { fields: changedFields(doc, previousDoc), status: doc.status },
          });
        }
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (req.user) await audit(req, { action: "delete", entity, entityId: doc.id });
        return doc;
      },
    ],
  };
}
