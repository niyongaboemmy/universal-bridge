import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { staffNext } from "@/features/staff-auth/actions";
import { enabledProviders } from "@/lib/auth/sso";
import { payload } from "@/lib/cms/payload";
import { sameSiteHeaders } from "@/lib/live-edit/session";
import { LoginForm } from "./LoginForm";
import { LoginShell } from "./Shell";

export const metadata: Metadata = { title: "Sign in · UB Office", robots: { index: false } };
export const dynamic = "force-dynamic";

const SSO_MESSAGES: Record<string, string> = {
  "no-account": "No staff account uses that email. Ask an administrator to invite you.",
  rejected: "That sign-in couldn't be verified. Try again.",
  expired: "The sign-in took too long. Try again.",
  cancelled: "Sign-in was cancelled.",
};

type SP = Promise<Record<string, string | undefined>>;

/** Staff sign-in for the office and the CMS (/admin/login redirects here). */
export default async function Login({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const next = (await staffNext(sp.next ?? sp.redirect)) ?? undefined;
  const p = await payload();
  const { user } = await p.auth({ headers: sameSiteHeaders(await headers()) });
  if (user?.collection === "users") redirect(next ?? "/office");

  const providers = enabledProviders().map((pr) => ({ id: pr.id, label: pr.label }));
  const notice = sp.sso
    ? { tone: "error" as const, text: SSO_MESSAGES[sp.sso] ?? "Sign-in failed." }
    : sp.signedOut
      ? { tone: "info" as const, text: "You're signed out." }
      : sp.reset
        ? { tone: "info" as const, text: "Password set. Sign in with your new password." }
        : undefined;

  return (
    <LoginShell>
      <LoginForm next={next} providers={providers} notice={notice} forgot={!!sp.forgot} />
    </LoginShell>
  );
}
