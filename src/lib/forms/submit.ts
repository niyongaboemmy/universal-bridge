import "server-only";
import { after } from "next/server";
import {
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
  type PayloadRequest,
} from "payload";
import type * as z from "zod/mini";
import { isLocale, type Locale } from "@/i18n/routing";
import { payload as getPayload } from "@/lib/cms/payload";
import { processOutbox } from "@/lib/outbox";
import { rateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstile, type BotCheck } from "@/lib/security/turnstile";
import { formDataToObject, issuesToFieldErrors } from "./form-data";
import { requestContext } from "./request-context";
import { HONEYPOT_FIELD, type FormState } from "./types";
import { checkUpload, UploadRejected, type UploadCheck } from "@/lib/uploads";

type UploadOk = Extract<UploadCheck, { ok: true }>;

export type SubmissionMeta = {
  locale: Locale;
  botCheck: Exclude<BotCheck, "failed">;
  referrer: string | null;
  landingPage: string | null;
  utm: Record<string, string>;
};

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const TRACKING_KEYS = [...UTM_KEYS, "landing_page", "locale", HONEYPOT_FIELD];

type Options<S extends z.ZodMiniType> = {
  formData: FormData;
  schema: S;
  /** Rate-limit scope, e.g. "contact". */
  scope: string;
  arrayKeys?: string[];
  emailField?: string;
  /** Feature-specific server checks (e.g. phone → E.164, intake still open). Return fieldErrors to reject. */
  refine?: (
    data: NoInfer<z.output<S>>,
  ) => Refined<NoInfer<z.output<S>>> | Promise<Refined<NoInfer<z.output<S>>>>;
  /** File inputs, checked by magic bytes and size before anything is saved (ADR-004). */
  files?: { name: string; required?: boolean }[];
  /** Persist and enqueue side effects inside the transaction. Returns the public reference. */
  save: (args: {
    data: NoInfer<z.output<S>>;
    req: PayloadRequest;
    meta: SubmissionMeta;
    uploads: Record<string, UploadOk | undefined>;
  }) => Promise<string | { ref: string; waitlisted?: boolean }>;
};

/**
 * The one submit pipeline every public form uses (FR-FORM-01…10):
 * honeypot → Turnstile → rate limits → Zod → refine → transaction(save + outbox)
 * → process the outbox after the response is sent.
 */
export async function handleSubmission<S extends z.ZodMiniType>(
  opts: Options<S>,
): Promise<FormState> {
  const raw = formDataToObject(opts.formData, opts.arrayKeys);
  const values = Object.fromEntries(
    Object.entries(raw).filter(([k]) => !TRACKING_KEYS.includes(k)),
  );

  // 1. Honeypot: bots get a convincing success and nothing is stored.
  if (typeof raw[HONEYPOT_FIELD] === "string" && raw[HONEYPOT_FIELD] !== "") {
    return { status: "success", ref: "L-OK" };
  }

  const localeRaw = typeof raw.locale === "string" ? raw.locale : "en";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : "en";
  const ctx = await requestContext();

  // 2. Bot check. A missing token = no JavaScript; allowed with stricter limits.
  const bot = await verifyTurnstile(
    opts.formData.get("cf-turnstile-response") as string | null,
    ctx.ip,
  );
  if (bot === "failed") return { status: "error", formError: "botCheckFailed", values };

  // 3. Rate limits per IP and per email (hashed keys).
  const ipLimit = bot === "missing" ? { limit: 3, windowSec: 3600 } : { limit: 8, windowSec: 600 };
  const byIp = await rateLimit(`${opts.scope}:ip`, ctx.ip, ipLimit);
  const emailValue = opts.emailField ? raw[opts.emailField] : undefined;
  const byEmail =
    typeof emailValue === "string" && emailValue
      ? await rateLimit(`${opts.scope}:email`, emailValue, { limit: 4, windowSec: 3600 })
      : { success: true };
  if (!byIp.success || !byEmail.success)
    return { status: "error", formError: "rateLimited", values };

  // 4. Validate with the same schema the client used.
  const parsed = opts.schema["~standard"].validate(raw);
  const result = parsed instanceof Promise ? await parsed : parsed;
  if (result.issues) {
    return {
      status: "error",
      fieldErrors: issuesToFieldErrors(
        result.issues.map((i) => ({
          path: (i.path ?? []).map((p) => (typeof p === "object" ? p.key : p)),
          message: i.message,
        })),
      ),
      values,
    };
  }
  let data = result.value as z.output<S>;

  // 5. Server-only refinements.
  if (opts.refine) {
    const refined = await opts.refine(data);
    if ("fieldErrors" in refined)
      return { status: "error", fieldErrors: refined.fieldErrors, values };
    data = refined.data;
  }

  // 5b. Files: magic bytes + size, before anything is stored.
  const uploads: Record<string, UploadOk | undefined> = {};
  for (const spec of opts.files ?? []) {
    const value = opts.formData.get(spec.name);
    const file = value instanceof File && value.size > 0 ? value : undefined;
    if (!file) {
      if (spec.required)
        return { status: "error", fieldErrors: { [spec.name]: "required" }, values };
      continue;
    }
    const checked = await checkUpload(file);
    if (!checked.ok)
      return { status: "error", fieldErrors: { [spec.name]: checked.error }, values };
    uploads[spec.name] = checked;
  }

  const meta: SubmissionMeta = {
    locale,
    botCheck: bot,
    referrer: ctx.referrer,
    landingPage:
      typeof raw.landing_page === "string" ? raw.landing_page.slice(0, 300) || null : null,
    utm: Object.fromEntries(
      UTM_KEYS.filter((k) => typeof raw[k] === "string" && raw[k]).map((k) => [
        k,
        String(raw[k]).slice(0, 120),
      ]),
    ),
  };

  // 6. Save first, in one transaction with its outbox jobs (NFR-REL-02).
  const payload = await getPayload();
  const req = await createLocalReq({}, payload);
  await initTransaction(req);
  try {
    const saved = await opts.save({ data, req, meta, uploads });
    const { ref, waitlisted } =
      typeof saved === "string" ? { ref: saved, waitlisted: undefined } : saved;
    await commitTransaction(req);
    // 7. Send emails right after responding; the cron is the safety net.
    after(async () => {
      try {
        await processOutbox(payload, { limit: 10 });
      } catch (err) {
        payload.logger.error({ msg: "Outbox processing after submit failed", err });
      }
    });
    return { status: "success", ref, ...(waitlisted ? { waitlisted } : {}) };
  } catch (err) {
    await killTransaction(req);
    if (err instanceof UploadRejected)
      return { status: "error", fieldErrors: { [err.field]: "fileType" }, values };
    payload.logger.error({ msg: `Form ${opts.scope} failed to save`, err });
    return { status: "error", formError: "generic", values };
  }
}

/** Return type for `refine`: cleaned data, or field errors to show. */
export type Refined<T> = { data: T } | { fieldErrors: Record<string, string> };

/** A refine failure for one field (keeps refine return types simple to infer). */
export const fail = (field: string, code: string): { fieldErrors: Record<string, string> } => ({
  fieldErrors: { [field]: code },
});
