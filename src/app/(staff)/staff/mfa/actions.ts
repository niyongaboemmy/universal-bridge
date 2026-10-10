"use server";

import { redirect } from "next/navigation";
import { audit } from "@/lib/audit";
import {
  decryptSecret,
  encryptSecret,
  generateRecoveryCodes,
  generateSecret,
  hashRecoveryCode,
  verifyTotp,
} from "@/lib/auth/totp";
import {
  endSession,
  safeNext,
  setMfaCookie,
  staffReq,
  staffSession,
} from "@/lib/auth/staff-session";
import { rateLimit } from "@/lib/security/rate-limit";

export type MfaState = { error?: string; codes?: string[]; next?: string };

const MAX_TRIES = 5;

async function guard(userId: string | number) {
  return rateLimit("mfa", String(userId), { limit: MAX_TRIES, windowSec: 10 * 60 });
}

/** Step 1 of set-up: create a secret (kept encrypted until confirmed). */
export async function startSetup() {
  const s = await staffSession();
  if (!s) redirect("/login");
  if (s.user.mfaEnabled) redirect("/staff/mfa");
  await s.p.update({
    collection: "users",
    id: s.user.id,
    overrideAccess: true,
    data: { mfaPendingSecret: encryptSecret(generateSecret()) } as never,
  });
  redirect("/staff/mfa");
}

/** Step 2: the first code proves the app is set up; recovery codes are shown once. */
export async function confirmSetup(_: MfaState, form: FormData): Promise<MfaState> {
  const s = await staffSession();
  if (!s) redirect("/login");
  if (!s.user.mfaPendingSecret) return { error: "Start the set-up again." };
  if (!(await guard(s.user.id)).success)
    return { error: "Too many attempts. Wait a few minutes and try again." };
  const secret = decryptSecret(s.user.mfaPendingSecret);
  const step = verifyTotp(secret, String(form.get("code") ?? ""));
  if (step === null)
    return {
      error: "That code didn't match. Check the time on your phone and try the newest code.",
    };
  const codes = generateRecoveryCodes();
  await s.p.update({
    collection: "users",
    id: s.user.id,
    overrideAccess: true,
    data: {
      mfaEnabled: true,
      mfaSecret: s.user.mfaPendingSecret,
      mfaPendingSecret: null,
      mfaRecoveryCodes: codes.map(hashRecoveryCode),
      mfaLastStep: step,
      mfaEnrolledAt: new Date().toISOString(),
      mfaEnrolledSid: s.sid,
    } as never,
  });
  await audit(staffReq(s.p, s.user), {
    action: "auth.mfa-enrolled",
    entity: "users",
    entityId: s.user.id,
  });
  // No cookie yet: setting one re-renders the page and would hide the codes before they're saved.
  return { codes, next: safeNext(form.get("next")) };
}

/** After the codes are saved: the session that just enrolled continues without another code. */
export async function finishSetup(form: FormData) {
  const s = await staffSession();
  if (!s) redirect("/login");
  const enrolledAt = s.user.mfaEnrolledAt ? new Date(s.user.mfaEnrolledAt).getTime() : 0;
  const recent = Date.now() - enrolledAt < 30 * 60 * 1000;
  if (!s.user.mfaEnabled || s.user.mfaEnrolledSid !== s.sid || !recent) redirect("/staff/mfa");
  await setMfaCookie(s.user.id, s.sid);
  redirect(safeNext(form.get("next")));
}

/** Sign-in step: a code from the app, or one recovery code. */
export async function verify(_: MfaState, form: FormData): Promise<MfaState> {
  const s = await staffSession();
  if (!s) redirect("/login");
  if (!s.user.mfaEnabled || !s.user.mfaSecret) redirect("/staff/mfa");
  const next = safeNext(form.get("next"));
  const req = staffReq(s.p, s.user);
  const limit = await guard(s.user.id);
  if (!limit.success) {
    await audit(req, { action: "auth.mfa-locked", entity: "users", entityId: s.user.id });
    await endSession(s.user, s.sid);
    redirect("/login");
  }
  const input = String(form.get("code") ?? "").trim();
  let ok = false;
  let method = "totp";
  if (/^\d[\d\s]{5,6}$/.test(input)) {
    const step = verifyTotp(decryptSecret(s.user.mfaSecret), input, {
      lastStep: s.user.mfaLastStep ?? -1,
    });
    if (step !== null) {
      ok = true;
      await s.p.update({
        collection: "users",
        id: s.user.id,
        overrideAccess: true,
        data: { mfaLastStep: step } as never,
      });
    }
  } else if (input) {
    method = "recovery";
    const hashes = s.user.mfaRecoveryCodes ?? [];
    const hash = hashRecoveryCode(input);
    if (hashes.includes(hash)) {
      ok = true;
      await s.p.update({
        collection: "users",
        id: s.user.id,
        overrideAccess: true,
        data: { mfaRecoveryCodes: hashes.filter((h) => h !== hash) } as never,
      });
    }
  }
  if (!ok) {
    await audit(req, { action: "auth.mfa-failed", entity: "users", entityId: s.user.id });
    return { error: `That code didn't work. ${Math.max(0, limit.remaining)} attempts left.` };
  }
  await audit(req, {
    action: "auth.mfa-verified",
    entity: "users",
    entityId: s.user.id,
    meta: { method },
  });
  await setMfaCookie(s.user.id, s.sid);
  redirect(next);
}

/** New recovery codes (the old ones stop working). Needs a verified session. */
export async function regenerateCodes(_: MfaState): Promise<MfaState> {
  const s = await staffSession();
  if (!s || !s.verified) redirect("/staff/mfa");
  const codes = generateRecoveryCodes();
  await s.p.update({
    collection: "users",
    id: s.user.id,
    overrideAccess: true,
    data: { mfaRecoveryCodes: codes.map(hashRecoveryCode) } as never,
  });
  await audit(staffReq(s.p, s.user), {
    action: "auth.mfa-recovery-regenerated",
    entity: "users",
    entityId: s.user.id,
  });
  return { codes };
}
