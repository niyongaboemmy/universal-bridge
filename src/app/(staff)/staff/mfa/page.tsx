/* eslint-disable @next/next/no-html-link-for-pages -- /admin and /staff are separate root layouts: full page loads on purpose. */
import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { Logo } from "@/components/brand/Logo";
import { mfaMode } from "@/lib/auth/mfa-proof";
import { safeNext, staffSession } from "@/lib/auth/staff-session";
import { decryptSecret, otpauthUrl } from "@/lib/auth/totp";
import { startSetup } from "./actions";
import { RegenerateForm, SetupForm, VerifyForm } from "./MfaForms";

export const dynamic = "force-dynamic";

/**
 * ADM-01 two-step verification for staff. Three states: set up (first sign-in),
 * verify (every sign-in) and manage (already verified this session).
 */
export default async function MfaPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (mfaMode() === "off") redirect("/admin"); // switched off: normal sign-in for now
  const s = await staffSession();
  if (!s) redirect("/login");
  const next = safeNext((await searchParams).next);
  const { user } = s;

  let title: string;
  let body: React.ReactNode;
  if (user.mfaEnabled && s.verified) {
    title = "Two-step verification is on";
    body = (
      <div className="space-y-6">
        <p className="text-fg-secondary">
          Your account asks for a code from your authenticator app at every sign-in.{" "}
          {user.mfaRecoveryCodes?.length ?? 0} recovery codes left.
        </p>
        <RegenerateForm />
        <a
          href="/admin"
          className="inline-flex h-12 w-full items-center justify-center rounded-full border border-strong font-medium"
        >
          Back to the admin
        </a>
        <p className="text-body-sm text-fg-muted">
          Lost your phone? A super admin can reset two-step verification on your account.
        </p>
      </div>
    );
  } else if (user.mfaEnabled) {
    title = "Confirm it's you";
    body = <VerifyForm next={next} />;
  } else if (user.mfaPendingSecret) {
    const secret = decryptSecret(user.mfaPendingSecret);
    const svg = await QRCode.toString(otpauthUrl({ secret, account: user.email }), {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
    });
    title = "Set up two-step verification";
    body = (
      <div className="space-y-6">
        <ol className="list-decimal space-y-1 pl-5 text-body-sm text-fg-secondary">
          <li>
            Open an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password…).
          </li>
          <li>Scan this code, or type the key below.</li>
        </ol>
        <div
          className="mx-auto w-48 rounded-2xl bg-white p-4 [&_svg]:h-auto [&_svg]:w-full"
          aria-label="QR code for your authenticator app"
          role="img"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="text-center font-mono text-body-sm break-all text-fg-secondary" data-secret>
          {secret.match(/.{1,4}/g)?.join(" ")}
        </p>
        <SetupForm next={next} />
      </div>
    );
  } else {
    title = "Protect your account";
    body = (
      <div className="space-y-6">
        <p className="text-fg-secondary">
          {mfaMode() === "required" ? "Staff accounts need" : "We recommend"} two-step verification:
          after your password, you enter a code from an authenticator app on your phone.
        </p>
        <form action={startSetup}>
          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-spark px-6 font-medium text-on-spark hover:bg-spark-hover"
          >
            Set up two-step verification
          </button>
        </form>
        {mfaMode() !== "required" && (
          <a href={next} className="block text-center text-body-sm font-medium text-accent">
            Not now
          </a>
        )}
      </div>
    );
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-subtle bg-surface p-8 shadow-3 sm:p-10">
        <div className="flex items-center gap-3">
          <Logo compact />
          <span className="font-mono text-eyebrow tracking-[0.2em] text-fg-muted uppercase">
            Staff
          </span>
        </div>
        <div className="mt-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
            <ShieldCheck aria-hidden className="size-5" />
          </span>
          <h1 className="font-display text-heading-lg">{title}</h1>
        </div>
        <p className="mt-2 text-body-sm text-fg-muted">{user.email}</p>
        <div className="mt-8">{body}</div>
        <a
          href="/admin/logout"
          className="mt-8 block text-center text-body-sm text-fg-muted hover:text-fg"
        >
          Sign out
        </a>
      </div>
    </main>
  );
}
