import type { CollectionAfterChangeHook, PayloadRequest } from "payload";
import type { Permission } from "@/access/permissions";
import { notifyPermission, notifyUser } from "./notify";

const idOf = (v: unknown) => (typeof v === "object" && v ? (v as { id: number }).id : (v as number | null));
const who = (req: PayloadRequest) =>
  (req.user as { name?: string; email?: string } | null)?.name ||
  (req.user as { email?: string } | null)?.email ||
  "Someone";

/** Never let a notification problem break a submission or a save. */
async function safely(req: PayloadRequest, fn: () => Promise<void>) {
  try {
    await fn();
  } catch (err) {
    req.payload.logger.warn({ err }, "Notification failed");
  }
}

/** New requests, demo requests and messages → the people who handle them; assignments → the assignee. */
export const notifyLead: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  const kind = doc.product ? "demo" : doc.department === "sales" ? "request" : "message";
  const perms: Record<string, Permission[]> = {
    request: ["requests.view", "requests.manage"],
    demo: ["demos.view", "demos.manage"],
    message: ["messages.view", "messages.manage"],
  };
  const label = { request: "service request", demo: "demo request", message: "message" }[kind];
  const href = `/office/requests/${doc.id}`;
  await safely(req, async () => {
    if (operation === "create")
      await notifyPermission(req, perms[kind]!, {
        kind,
        title: `New ${label} from ${doc.name}`,
        body: doc.product ? `Product: ${doc.product}` : doc.company || doc.message,
        href,
      });
    const to = idOf(doc.assignee);
    if (operation === "update" && to && to !== idOf(previousDoc?.assignee) && to !== req.user?.id)
      await notifyUser(req, to, {
        kind: "assignment",
        title: `${who(req)} assigned you ${doc.ref}`,
        body: doc.name,
        href,
      });
  });
  return doc;
};

/** New applications → the people who review that type; assignments → the reviewer. */
export const notifyApplication: CollectionAfterChangeHook = async ({ doc, previousDoc, operation, req }) => {
  const href = `/office/applicants/${doc.id}`;
  await safely(req, async () => {
    if (operation === "create")
      await notifyPermission(req, [`applicants.${doc.type}` as Permission], {
        kind: "application",
        title: `New application from ${doc.name}`,
        body: doc.subject ?? doc.type,
        href,
      });
    const to = idOf(doc.assignee);
    if (operation === "update" && to && to !== idOf(previousDoc?.assignee) && to !== req.user?.id)
      await notifyUser(req, to, {
        kind: "assignment",
        title: `${who(req)} asked you to review ${doc.ref}`,
        body: doc.name,
        href,
      });
  });
  return doc;
};
