import { readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import {
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
  type Payload,
} from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { bootPayload } from "./setup-db";

// Integration: lead + outbox in one transaction, then delivery (NFR-REL-02).
let payload: Payload;
const MAIL = path.resolve(".data/mail");

beforeAll(async () => {
  payload = await bootPayload();
  await payload.delete({
    collection: "outbox",
    where: { id: { exists: true } },
    overrideAccess: true,
  });
  await payload.delete({
    collection: "leads",
    where: { id: { exists: true } },
    overrideAccess: true,
  });
  await rm(MAIL, { recursive: true, force: true });
}, 120_000);

afterAll(async () => {
  await payload?.db.destroy?.();
});

const lead = (ref: string) => ({
  ref,
  status: "new" as const,
  department: "sales" as const,
  name: "Test Person",
  email: `${ref.toLowerCase()}@example.org`,
  message: "Integration test message for the outbox.",
});

describe("outbox", () => {
  it("rolls back the lead and its jobs together", async () => {
    const { enqueue } = await import("@/lib/outbox");
    const req = await createLocalReq({}, payload);
    await initTransaction(req);
    await payload.create({
      collection: "leads",
      data: lead("L-ROLLBACK"),
      req,
      overrideAccess: true,
    });
    await enqueue(req, { kind: "notify-team", payload: { text: "should vanish" } });
    await killTransaction(req);
    const leads = await payload.find({
      collection: "leads",
      where: { ref: { equals: "L-ROLLBACK" } },
      overrideAccess: true,
    });
    const jobs = await payload.find({ collection: "outbox", overrideAccess: true });
    expect(leads.totalDocs).toBe(0);
    expect(jobs.totalDocs).toBe(0);
  });

  it("delivers committed emails and marks jobs done", async () => {
    const { enqueue, processOutbox } = await import("@/lib/outbox");
    const req = await createLocalReq({}, payload);
    await initTransaction(req);
    await payload.create({
      collection: "leads",
      data: lead("L-DELIVER"),
      req,
      overrideAccess: true,
    });
    const data = { ...lead("L-DELIVER"), locale: "fr" as const };
    await enqueue(req, {
      kind: "send-email",
      payload: { template: "lead-confirmation", to: data.email, data },
    });
    await enqueue(req, {
      kind: "send-email",
      payload: {
        template: "lead-notification",
        to: "sales@example.org",
        replyTo: data.email,
        data,
        adminPath: "/admin",
      },
    });
    await commitTransaction(req);

    const summary = await processOutbox(payload);
    expect(summary).toMatchObject({ claimed: 2, done: 2, dead: 0 });

    const files = await readdir(MAIL);
    const mails = await Promise.all(
      files.map(async (f) => JSON.parse(await readFile(path.join(MAIL, f), "utf8"))),
    );
    const confirmation = mails.find((m) => m.to === data.email);
    expect(confirmation.subject).toBe("Nous avons bien reçu votre message (L-DELIVER)");
    expect(confirmation.html).toContain('lang="fr"');
    expect(confirmation.text).toContain("Bonjour Test,");
    const notification = mails.find((m) => m.to === "sales@example.org");
    expect(notification.replyTo).toBe(data.email);
    expect(notification.subject).toContain("New sales inquiry from Test Person");
  });

  it("retries failures with backoff instead of losing them", async () => {
    const { enqueue, processOutbox } = await import("@/lib/outbox");
    process.env.TEAM_ALERT_WEBHOOK_URL = "http://127.0.0.1:9/unreachable";
    const req = await createLocalReq({}, payload);
    await initTransaction(req);
    await enqueue(req, { kind: "notify-team", payload: { text: "will fail" } });
    await commitTransaction(req);

    const summary = await processOutbox(payload);
    expect(summary).toMatchObject({ claimed: 1, retried: 1 });
    const job = (
      await payload.find({
        collection: "outbox",
        where: { kind: { equals: "notify-team" } },
        overrideAccess: true,
      })
    ).docs[0]!;
    expect(job.status).toBe("pending");
    expect(job.attempts).toBe(1);
    expect(new Date(job.runAfter!).getTime()).toBeGreaterThan(Date.now() + 50_000);
    expect(job.lastError).toBeTruthy();

    // Not due yet → a second run claims nothing.
    expect((await processOutbox(payload)).claimed).toBe(0);
    delete process.env.TEAM_ALERT_WEBHOOK_URL;
  });

  it("never lets two workers claim the same job", async () => {
    const { enqueue, processOutbox } = await import("@/lib/outbox");
    const req = await createLocalReq({}, payload);
    await initTransaction(req);
    for (let i = 0; i < 6; i++) await enqueue(req, { kind: "crm-sync", payload: { i } });
    await commitTransaction(req);
    const [a, b] = await Promise.all([processOutbox(payload), processOutbox(payload)]);
    expect(a.claimed + b.claimed).toBe(6);
    expect(a.done + b.done).toBe(6);
  });
});
