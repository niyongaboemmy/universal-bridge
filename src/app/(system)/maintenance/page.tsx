import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { getSiteSettings } from "@/lib/cms/settings";
import { freshSettings } from "@/lib/settings";
import { nowMs } from "@/lib/time/office-hours";

export const metadata: Metadata = { title: "Back soon · Universal Bridge" };
export const dynamic = "force-dynamic";

/** Shown to visitors while maintenance mode is on (Settings → Website). */
export default async function Maintenance() {
  const [s, site] = await Promise.all([freshSettings(), getSiteSettings("en").catch(() => null)]);
  const until = s.maintenance.until ? new Date(s.maintenance.until) : null;
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-5 py-16">
      <div aria-hidden className="login-aurora absolute inset-0 opacity-[0.07] [[data-theme=dark]_&]:opacity-60" />
      <div className="relative w-full max-w-xl text-center">
        <Logo className="mx-auto h-9 w-auto" />
        <svg viewBox="0 0 240 120" className="mx-auto mt-10 w-64" aria-hidden fill="none">
          <path d="M10 100 H230" stroke="var(--border-strong)" strokeWidth="3" strokeLinecap="round" />
          <path d="M30 100 C 60 40, 100 40, 120 60" stroke="#0145b8" strokeWidth="6" strokeLinecap="round" className="login-path" pathLength={1} />
          <path d="M210 100 C 180 40, 150 40, 130 60" stroke="#fe760d" strokeWidth="6" strokeLinecap="round" className="login-path" pathLength={1} />
          <circle cx="125" cy="62" r="7" fill="#fe760d" className="login-pulse" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
        </svg>
        <h1 className="mt-8 font-display text-display-lg tracking-tight">We&apos;re improving the site</h1>
        <p className="mt-4 text-body-lg text-fg-secondary">
          {s.maintenance.message ?? "Universal Bridge is getting an update. Please check back shortly."}
        </p>
        {until && until.getTime() > nowMs() && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-1.5 text-body-sm font-medium text-accent">
            Back around{" "}
            {until.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Kigali" })}{" "}
            (Kigali)
          </p>
        )}
        {site?.email && (
          <p className="mt-8 text-body-sm text-fg-muted">
            Need us now?{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-accent underline underline-offset-4">
              {site.email}
            </a>
          </p>
        )}
      </div>
    </main>
  );
}
