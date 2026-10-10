/* eslint-disable @next/next/no-html-link-for-pages -- the website is a separate root layout. */
import { Briefcase, FolderKanban, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { ThemeSwitch } from "@/components/office/ThemeSwitch";
import { staffNext } from "@/features/staff-auth/actions";
import { enabledProviders } from "@/lib/auth/sso";
import { payload } from "@/lib/cms/payload";
import { sameSiteHeaders } from "@/lib/live-edit/session";
import { LoginForm } from "./LoginForm";

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
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside
        aria-hidden
        className="login-aurora relative hidden overflow-hidden text-white lg:flex lg:flex-col lg:justify-between lg:p-12"
      >
        <div className="login-grid absolute inset-0" />
        <Logo variant="white" className="relative h-9 w-auto" />
        <div className="relative mx-auto w-full max-w-md">
          <svg viewBox="0 0 400 150" className="w-full overflow-visible" fill="none">
            <path
              pathLength={1}
              className="login-path"
              d="M4 128 C 60 120, 80 70, 130 82 S 210 120, 250 64 S 330 26, 396 18"
              stroke="url(#lg)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="lg" x1="0" x2="1">
                <stop stopColor="#6b9cff" />
                <stop offset="1" stopColor="#fe760d" />
              </linearGradient>
            </defs>
            {[
              [130, 82],
              [250, 64],
              [396, 18],
            ].map(([cx, cy]) => (
              <g key={cx}>
                <circle
                  className="login-pulse origin-center"
                  cx={cx}
                  cy={cy}
                  r="9"
                  fill="#fe760d"
                  opacity="0.5"
                  style={{ transformBox: "fill-box" }}
                />
                <circle cx={cx} cy={cy} r="4.5" fill="#fff" />
              </g>
            ))}
          </svg>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: <Briefcase />, label: "Clients" },
              { icon: <GraduationCap />, label: "Talent" },
              { icon: <FolderKanban />, label: "Projects" },
            ].map((c) => (
              <div
                key={c.label}
                className="login-float rounded-2xl border border-white/12 bg-white/8 p-4 backdrop-blur-md"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-white/12 [&_svg]:size-4.5">
                  {c.icon}
                </span>
                <p className="mt-3 text-[0.8125rem] font-medium">{c.label}</p>
                <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/10">
                  <span className="office-bar block h-full w-2/3 rounded-full bg-gradient-to-r from-[#6b9cff] to-[#fe760d]" />
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <p className="font-display text-[1.75rem] leading-tight font-semibold tracking-tight">
            One place to run
            <br />
            Universal Bridge.
          </p>
          <p className="mt-2 text-white/60">Office · Content · Website</p>
        </div>
      </aside>

      <main className="relative flex flex-col bg-[var(--bg-canvas)] px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo className="h-8 w-auto lg:invisible" />
          <ThemeSwitch />
        </div>
        <div className="mx-auto flex w-full max-w-[24rem] flex-1 flex-col justify-center py-10">
          <LoginForm next={next} providers={providers} notice={notice} />
        </div>
        <p className="text-center text-[0.75rem] text-fg-muted">
          <a href="/" className="hover:text-fg">
            ← universalbridge.rw
          </a>
        </p>
      </main>
    </div>
  );
}
