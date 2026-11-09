import {
  Briefcase,
  Check,
  Cpu,
  Eye,
  GraduationCap,
  House,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { cn } from "@/lib/utils";

type Css = React.CSSProperties & Record<`--${string}`, string | number>;
export type FeatureKey = "shields" | "assistant" | "tabs" | "passwords" | "profiles" | "languages";

/**
 * "Why Vizulla" as a bento grid: every feature shows itself in a small looping
 * scene (globals.css "vzb-*") above a one-line title and body. Static under
 * reduced motion and Lite mode. Server component.
 */
export function FeatureBento({
  items,
  labels,
}: {
  items: Record<FeatureKey, { title: string; body: string }>;
  labels: { blocked: string; onDevice: string; ask: string; strong: string };
}) {
  const cards: { key: FeatureKey; art: ReactNode; className?: string }[] = [
    { key: "shields", art: <ShieldsArt blocked={labels.blocked} />, className: "sm:col-span-2" },
    { key: "assistant", art: <AssistantArt onDevice={labels.onDevice} ask={labels.ask} /> },
    { key: "tabs", art: <TabsArt /> },
    { key: "passwords", art: <PasswordArt strong={labels.strong} /> },
    { key: "profiles", art: <ProfilesArt /> },
    { key: "languages", art: <LanguagesArt />, className: "sm:col-span-2 lg:col-span-3" },
  ];
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ key, art, className }) => (
        <li key={key} className={cn("reveal", className)}>
          <SpotlightCard
            className={cn(
              "group h-full overflow-hidden rounded-3xl border border-subtle bg-surface p-2 transition-[translate,border-color,box-shadow] duration-300 ease-standard hover:-translate-y-1 hover:border-[color-mix(in_oklab,#2563eb_45%,var(--border-subtle))] hover:shadow-3",
              key === "languages" &&
                "lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center",
            )}
          >
            <div
              aria-hidden
              className={cn(
                "relative h-48 overflow-hidden rounded-[1.25rem] border border-subtle bg-[radial-gradient(120%_90%_at_50%_0%,color-mix(in_oklab,#2563eb_14%,transparent),transparent_70%),var(--bg-sunken)]",
                key === "languages" && "lg:order-2",
              )}
            >
              {art}
            </div>
            <div className="px-4 pt-5 pb-4">
              <h3 className="font-display text-[1.2rem] leading-snug font-semibold text-fg">
                {items[key].title}
              </h3>
              <p className="mt-1.5 text-body-sm text-fg-secondary">{items[key].body}</p>
            </div>
          </SpotlightCard>
        </li>
      ))}
    </ul>
  );
}

/** Trackers fly in from the left and stop at the shield; the page beyond stays clean. */
function ShieldsArt({ blocked }: { blocked: string }) {
  const bugs = [
    ["#ef4444", 22],
    ["#f59e0b", 48],
    ["#a855f7", 70],
    ["#ef4444", 34],
    ["#f59e0b", 60],
  ] as const;
  return (
    <div className="absolute inset-0">
      <svg className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        {[30, 50, 70].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="46"
            y2="50"
            className="vzb-ray"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeDasharray="2 3"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {bugs.map(([color, top], i) => (
        <span
          key={i}
          className="vzb-bug absolute grid size-7 place-items-center rounded-full text-white shadow-2"
          style={{ background: color, "--y": `${top}%`, "--n": i } as Css}
        >
          <Eye className="size-3.5" />
        </span>
      ))}
      <div className="absolute top-1/2 left-[46%] grid size-20 -translate-1/2 place-items-center">
        <span className="vzb-ring absolute inset-0 rounded-full border-2 border-[#16a34a]/40" />
        <span
          className="vzb-ring absolute inset-0 rounded-full border-2 border-[#16a34a]/40"
          style={{ "--n": 1 } as Css}
        />
        <span className="grid size-16 place-items-center rounded-2xl bg-[linear-gradient(160deg,#22c55e,#15803d)] text-white shadow-[0_12px_30px_-8px_rgb(22_163_74/0.6)]">
          <ShieldCheck className="size-8" strokeWidth={1.8} />
        </span>
      </div>
      <div className="absolute top-1/2 right-[6%] w-[34%] -translate-y-1/2 rounded-xl border border-subtle bg-surface p-3 shadow-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
        </div>
        <span className="mt-3 block h-2 w-4/5 rounded-full bg-fg/70" />
        <span className="mt-2 block h-12 rounded-md bg-[linear-gradient(135deg,#bfdbfe,#ddd6fe)]" />
        <span className="mt-2 block h-1.5 w-full rounded-full bg-[var(--border-subtle)]" />
        <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-[var(--border-subtle)]" />
      </div>
      <span className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full border border-subtle bg-surface px-3 py-1 text-[0.75rem] font-medium text-fg shadow-1">
        <ShieldCheck className="size-3.5 text-success" />
        {blocked}
        <span
          className="vzb-total vz-count font-semibold tabular-nums"
          style={{ "--vz-n": 1284 } as Css}
        />
      </span>
    </div>
  );
}

function AssistantArt({ onDevice, ask }: { onDevice: string; ask: string }) {
  return (
    <div className="absolute inset-0 flex flex-col p-4 text-[0.75rem]">
      <span className="flex items-center gap-1.5 self-start rounded-full bg-[color-mix(in_oklab,#16a34a_14%,transparent)] px-2.5 py-1 font-medium text-success">
        <Cpu className="size-3.5" />
        {onDevice}
      </span>
      <span className="vzb-q mt-3 max-w-[85%] self-end rounded-2xl rounded-br-md bg-[#2563eb] px-3 py-1.5 text-white">
        {ask}
      </span>
      <div className="relative mt-2">
        <span className="vzb-typing absolute top-0 left-0 flex gap-1 rounded-2xl bg-surface px-3 py-2.5 ring-1 ring-[var(--border-subtle)]">
          {[0, 1, 2].map((d) => (
            <span
              key={d}
              className="vz-dot size-1.5 rounded-full bg-fg-muted"
              style={{ "--n": d } as Css}
            />
          ))}
        </span>
        <div className="vzb-a flex gap-2 rounded-2xl rounded-tl-md bg-surface p-3 ring-1 ring-[var(--border-subtle)]">
          <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[linear-gradient(135deg,#3b82f6,#7c3aed)] text-white">
            <Sparkles className="size-3.5" />
          </span>
          <span className="flex flex-1 flex-col gap-1.5 pt-1">
            {[92, 74, 84].map((w, i) => (
              <span
                key={i}
                className="vzb-line block h-1.5 origin-left rounded-full bg-[color-mix(in_oklab,var(--text-primary)_22%,transparent)]"
                style={{ width: `${w}%`, "--n": i } as Css}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Side tabs: the selection steps down the list, the page changes with it. */
function TabsArt() {
  const tabs = ["#0145B8", "#e11d48", "#16a34a", "#7c3aed"];
  return (
    <div className="absolute inset-4 flex overflow-hidden rounded-xl border border-subtle bg-surface shadow-2">
      <div className="relative w-[42%] border-r border-subtle p-2">
        <span className="vzb-sel absolute inset-x-2 top-2 h-8 rounded-lg bg-[color-mix(in_oklab,#2563eb_14%,transparent)] ring-1 ring-[color-mix(in_oklab,#2563eb_35%,transparent)]" />
        {tabs.map((c, i) => (
          <span
            key={c}
            className="relative flex h-8 items-center gap-2 px-2"
            style={{ "--n": i } as Css}
          >
            <span className="size-3 shrink-0 rounded-[4px]" style={{ background: c }} />
            <span className="h-1.5 flex-1 rounded-full bg-[var(--border-strong)] opacity-60" />
          </span>
        ))}
        <span className="absolute bottom-2 left-2 flex gap-1.5">
          <span className="size-2 rounded-full bg-[#2563eb]" />
          <span className="size-2 rounded-full bg-[var(--border-strong)]" />
          <span className="size-2 rounded-full bg-[var(--border-strong)]" />
        </span>
      </div>
      <div className="relative flex-1">
        {tabs.map((c, i) => (
          <div
            key={c}
            data-first={i === 0 || undefined}
            className="vzb-page absolute inset-0 p-3"
            style={{ "--n": i } as Css}
          >
            <span className="block h-10 rounded-md opacity-80" style={{ background: c }} />
            <span className="mt-2.5 block h-1.5 w-11/12 rounded-full bg-[var(--border-strong)] opacity-60" />
            <span className="mt-1.5 block h-1.5 w-3/4 rounded-full bg-[var(--border-strong)] opacity-60" />
            <span className="mt-1.5 block h-1.5 w-5/6 rounded-full bg-[var(--border-strong)] opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** A password fills in, the meter turns green, the lock closes on a check. */
function PasswordArt({ strong }: { strong: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center p-5">
      <div className="w-full max-w-[15rem] rounded-xl border border-subtle bg-surface p-3 shadow-2">
        <div className="flex h-10 items-center gap-2 rounded-lg px-3 ring-1 ring-[var(--border-strong)]">
          <Lock className="size-4 shrink-0 text-fg-muted" />
          <span className="vzb-dots block overflow-hidden text-lg leading-none tracking-[0.12em] whitespace-nowrap text-fg">
            ••••••••••••
          </span>
          <KeyRound className="ml-auto size-4 shrink-0 text-[#3b82f6]" />
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--border-subtle)]">
          <span className="vzb-meter block h-full origin-left rounded-full bg-[linear-gradient(90deg,#ef4444,#f59e0b_45%,#22c55e)]" />
        </div>
        <p className="vzb-ok mt-2 flex items-center gap-1.5 text-[0.75rem] font-medium text-success">
          <Check className="size-3.5" />
          {strong}
        </p>
      </div>
    </div>
  );
}

/** Work, home and school profiles take turns at the front, each with its own colour. */
function ProfilesArt() {
  const people = [
    [Briefcase, "#2563eb"],
    [House, "#f97316"],
    [GraduationCap, "#16a34a"],
  ] as const;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        {people.map(([Icon, color], i) => (
          <span
            key={color}
            data-first={i === 0 || undefined}
            className="vzb-person grid size-14 place-items-center rounded-full text-white ring-4 ring-[var(--bg-sunken)]"
            style={{ background: color, "--n": i } as Css}
          >
            <Icon className="size-6" strokeWidth={1.8} />
          </span>
        ))}
      </div>
      <div className="relative h-7 w-[70%] overflow-hidden rounded-full border border-subtle bg-surface">
        {people.map(([, color], i) => (
          <span
            key={color}
            data-first={i === 0 || undefined}
            className="vzb-bar absolute inset-y-1 left-1 flex w-[calc(100%-0.5rem)] items-center gap-2 rounded-full px-2"
            style={{ "--n": i } as Css}
          >
            <span className="size-3.5 rounded-full" style={{ background: color }} />
            <span className="h-1.5 flex-1 rounded-full opacity-35" style={{ background: color }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/** One word per language, sliding up in turn, with the matching UI language lit. */
function LanguagesArt() {
  const langs = [
    ["Muraho", "RW"],
    ["Habari", "SW"],
    ["Bonjour", "FR"],
    ["Hello", "EN"],
  ] as const;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
      <div className="relative h-[3.6rem] w-full overflow-hidden">
        {langs.map(([word], i) => (
          <span
            key={word}
            data-first={i === 0 || undefined}
            className="vzb-word vz-gradient-text absolute inset-0 text-center font-display text-[3rem] leading-[1.2] font-semibold tracking-tight"
            style={{ "--n": i } as Css}
          >
            {word}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        {langs.map(([, code], i) => (
          <span
            key={code}
            data-first={i === 0 || undefined}
            className="vzb-code rounded-full border border-subtle bg-surface px-3 py-1 font-mono text-[0.75rem] font-medium text-fg-secondary"
            style={{ "--n": i } as Css}
          >
            {code}
          </span>
        ))}
      </div>
    </div>
  );
}
