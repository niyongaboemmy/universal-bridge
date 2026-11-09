import {
  Ban,
  Check,
  Clapperboard,
  EyeOff,
  FileArchive,
  Image as ImageIcon,
  KeyRound,
  Loader2,
  Music2,
  Search,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { KubikaLogo } from "@/components/brand/KubikaLogo";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { cn } from "@/lib/utils";
import { PLATFORM_COLOR, PlatformGlyph, type PlatformKey } from "./platforms";

type Css = React.CSSProperties & Record<`--${string}`, string | number>;
export type FeatureKey = "formats" | "carousels" | "batch" | "extension" | "library" | "privacy";
export type BentoLabels = {
  zip: string;
  links: string;
  download: string;
  search: string;
  noAds: string;
  noTrackers: string;
  noPasswords: string;
  deleted: string;
};

const GRADIENTS = [
  "linear-gradient(160deg,#fb923c,#e11d48)",
  "linear-gradient(160deg,#38bdf8,#4f46e5)",
  "linear-gradient(160deg,#4ade80,#0d9488)",
  "linear-gradient(160deg,#facc15,#f97316)",
  "linear-gradient(160deg,#c084fc,#db2777)",
  "linear-gradient(160deg,#60a5fa,#0f766e)",
];

/**
 * "Why Kubika" as a bento grid: each feature plays itself in a small loop
 * (globals.css "kbb-*") above a one-line title and body. Static under reduced
 * motion and Lite mode. Server component.
 */
export function FeatureBento({
  items,
  labels,
}: {
  items: Record<FeatureKey, { title: string; body: string }>;
  labels: BentoLabels;
}) {
  const cards: { key: FeatureKey; art: ReactNode; className?: string }[] = [
    { key: "formats", art: <FormatsArt />, className: "sm:col-span-2" },
    { key: "carousels", art: <CarouselArt zip={labels.zip} /> },
    { key: "batch", art: <BatchArt links={labels.links} /> },
    { key: "extension", art: <ExtensionArt download={labels.download} /> },
    { key: "library", art: <LibraryArt search={labels.search} /> },
    {
      key: "privacy",
      art: <PrivacyArt labels={labels} />,
      className: "sm:col-span-2 lg:col-span-3",
    },
  ];
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ key, art, className }) => (
        <li key={key} className={cn("reveal", className)}>
          <SpotlightCard
            className={cn(
              "group h-full overflow-hidden rounded-3xl border border-subtle bg-surface p-2 transition-[translate,border-color,box-shadow] duration-300 ease-standard hover:-translate-y-1 hover:border-[color-mix(in_oklab,#2563eb_45%,var(--border-subtle))] hover:shadow-3",
              key === "privacy" &&
                "lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center",
            )}
          >
            <div
              aria-hidden
              className={cn(
                "relative h-48 overflow-hidden rounded-[1.25rem] border border-subtle bg-[radial-gradient(120%_90%_at_50%_0%,color-mix(in_oklab,#2563eb_14%,transparent),transparent_70%),var(--bg-sunken)]",
                key === "privacy" && "lg:order-2",
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

/** One post in, four formats out: each lights up in turn as the link flows to it. */
function FormatsArt() {
  const outs = [
    { icon: Clapperboard, label: "MP4 · 1080p", tint: "#2563eb" },
    { icon: Music2, label: "MP3 · Audio", tint: "#7c3aed" },
    { icon: ImageIcon, label: "JPG · Cover", tint: "#db2777" },
    { icon: Sparkles, label: "GIF", tint: "#ea580c" },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-0 px-6">
      <span
        className="relative block size-28 shrink-0 overflow-hidden rounded-2xl shadow-3"
        style={{ background: GRADIENTS[0] }}
      >
        <span className="absolute top-[22%] left-[58%] size-6 rounded-full bg-[#fde68a]" />
        <svg
          viewBox="0 0 100 60"
          preserveAspectRatio="none"
          className="absolute inset-x-0 bottom-0 h-1/2 w-full"
        >
          <path d="M0 30 C25 12 45 28 70 14 S95 20 100 18 V60 H0Z" fill="#4c1d95" opacity="0.8" />
          <path d="M0 44 C30 30 55 46 100 34 V60 H0Z" fill="#1e1b4b" />
        </svg>
        <span className="absolute top-2 left-2 grid size-7 place-items-center rounded-full bg-white text-[#e02424]">
          <PlatformGlyph platform="youtube" className="size-4" />
        </span>
      </span>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-36 w-16 shrink-0 text-fg-muted sm:w-24"
      >
        {[14, 38, 62, 86].map((y, i) => (
          <path
            key={y}
            d={`M0 50 C50 50 50 ${y} 100 ${y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
            className="kbb-flow"
            style={{ "--n": i } as Css}
          />
        ))}
      </svg>
      <ul className="flex shrink-0 flex-col gap-2">
        {outs.map(({ icon: Icon, label, tint }, i) => (
          <li
            key={label}
            data-first={i === 0 || undefined}
            className="kbb-out flex items-center gap-2 rounded-full border border-subtle bg-surface py-1 pr-3.5 pl-1 text-[0.8rem] font-semibold whitespace-nowrap text-fg shadow-1"
            style={{ "--n": i } as Css}
          >
            <span
              className="grid size-6 place-items-center rounded-full text-white"
              style={{ background: tint }}
            >
              <Icon className="size-3.5" />
            </span>
            {label}
            {i === 1 && (
              <span className="ml-0.5 flex h-3 items-end gap-[2px]">
                {[0, 1, 2, 3].map((b) => (
                  <span
                    key={b}
                    className="kbb-eq block h-full w-[3px] origin-bottom rounded-full bg-[#7c3aed]"
                    style={{ "--n": b } as Css}
                  />
                ))}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A carousel fans out, gathers, and lands in one ZIP. */
function CarouselArt({ zip }: { zip: string }) {
  const cards = [-2, -1, 0, 1, 2];
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative h-28 w-20">
        {cards.map((k, i) => (
          <span
            key={k}
            className="kbb-card absolute inset-0 overflow-hidden rounded-xl border-2 border-white shadow-3"
            style={
              {
                "--x": `${k * 30}px`,
                "--r": `${k * 9}deg`,
                "--n": i,
                background: GRADIENTS[i + 1],
              } as Css
            }
          >
            <span className="absolute top-3 left-3 size-3 rounded-full bg-white/80" />
            <svg
              viewBox="0 0 40 30"
              preserveAspectRatio="none"
              className="absolute inset-x-0 bottom-0 h-1/2 w-full"
            >
              <path d="M0 20 L12 10 L22 18 L30 12 L40 20 V30 H0Z" fill="rgb(0 0 0 / 0.25)" />
            </svg>
          </span>
        ))}
        <span className="kbb-zip absolute top-1/2 left-1/2 flex -translate-1/2 flex-col items-center gap-1.5">
          <span className="grid size-16 place-items-center rounded-2xl bg-[linear-gradient(180deg,#facc15,#f59e0b)] text-white shadow-3">
            <FileArchive className="size-8" strokeWidth={1.8} />
          </span>
          <span className="rounded-full bg-surface px-2.5 py-0.5 text-[0.75rem] font-semibold whitespace-nowrap text-fg shadow-1">
            {zip}
          </span>
        </span>
      </div>
      <span
        className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white shadow-1"
        style={{ color: PLATFORM_COLOR.instagram }}
      >
        <PlatformGlyph platform="instagram" className="size-4" />
      </span>
    </div>
  );
}

/** Four links, one batch: each row runs and ticks off in turn. */
function BatchArt({ links }: { links: string }) {
  const rows: [PlatformKey, number][] = [
    ["tiktok", 72],
    ["instagram", 58],
    ["youtube", 80],
    ["x", 50],
  ];
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-1.5 px-5">
      <p className="font-mono text-[0.72rem] leading-none text-fg-muted">{links}</p>
      {rows.map(([p, w], i) => (
        <div
          key={p}
          className="flex items-center gap-2.5 rounded-xl border border-subtle bg-surface px-2.5 py-1.5 shadow-1"
        >
          <span
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-full bg-white",
              p === "x" || p === "tiktok" ? "text-[#0b1220]" : "",
            )}
            style={{ color: PLATFORM_COLOR[p] }}
          >
            <PlatformGlyph platform={p} className="size-3.5" />
          </span>
          <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <span
              className="kbb-run absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#0ea5e9,#2563eb)]"
              style={{ width: `${w}%`, "--n": i } as Css}
            />
          </span>
          <span className="relative grid size-5 shrink-0 place-items-center">
            <Loader2
              className="kbb-wait absolute size-4 text-fg-muted"
              style={{ "--n": i } as Css}
            />
            <span
              className="kbb-ok absolute inset-0 grid place-items-center rounded-full bg-[#16a34a] text-white"
              style={{ "--n": i } as Css}
            >
              <Check className="size-3" strokeWidth={3} />
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Browsing a post, the Download pill appears; one click opens it in Kubika. */
function ExtensionArt({ download }: { download: string }) {
  return (
    <div className="absolute inset-x-4 top-4 bottom-0 overflow-hidden rounded-t-xl border border-b-0 border-subtle bg-surface shadow-3">
      <div className="flex h-8 items-center gap-2 border-b border-subtle bg-sunken px-2.5">
        <span className="flex gap-1">
          <span className="size-2 rounded-full bg-[#ff5f57]" />
          <span className="size-2 rounded-full bg-[#febc2e]" />
          <span className="size-2 rounded-full bg-[#28c840]" />
        </span>
        <span className="h-5 flex-1 truncate rounded-full bg-surface px-2.5 font-mono text-[0.62rem] leading-5 text-fg-muted">
          instagram.com/p/C9x…
        </span>
        <span className="relative">
          <KubikaLogo title={null} className="size-5" />
          <span className="kbb-badge absolute -top-1 -right-1.5 grid size-3.5 place-items-center rounded-full bg-[#16a34a] text-[0.5rem] font-bold text-white ring-2 ring-[var(--bg-sunken)]">
            ↓
          </span>
        </span>
      </div>
      <div className="flex gap-3 p-3">
        <span
          className="relative block h-28 flex-1 overflow-hidden rounded-lg"
          style={{ background: GRADIENTS[4] }}
        >
          <span className="absolute top-3 left-3 size-4 rounded-full bg-white/80" />
          <svg
            viewBox="0 0 40 30"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-0 h-1/2 w-full"
          >
            <path d="M0 22 L10 12 L20 20 L28 10 L40 22 V30 H0Z" fill="rgb(0 0 0 / 0.25)" />
          </svg>
          <span className="kbb-pill absolute right-2 bottom-2 flex items-center gap-1.5 rounded-full bg-[#2563eb] py-1 pr-2.5 pl-1 text-[0.68rem] font-semibold text-white shadow-[0_6px_16px_-6px_rgb(37_99_235/0.9)]">
            <KubikaLogo title={null} className="size-4" />
            {download}
          </span>
          <svg viewBox="0 0 24 24" className="kbb-cursor absolute size-5 drop-shadow">
            <path
              d="M4 2.5 20 12l-7 1.6-3.6 6.6L4 2.5Z"
              fill="#0f172a"
              stroke="#fff"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="hidden w-16 flex-col gap-1.5 pt-1 min-[380px]:flex">
          {[90, 70, 80, 55].map((w, i) => (
            <span
              key={i}
              className="block h-1.5 rounded-full bg-[var(--border-subtle)]"
              style={{ width: `${w}%` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

/** Everything saved, searchable: typing narrows the grid to the matches. */
function LibraryArt({ search }: { search: string }) {
  return (
    <div className="absolute inset-0 flex flex-col gap-3 px-5 py-5">
      <div className="flex h-9 items-center gap-2 rounded-full border border-subtle bg-surface px-3 shadow-1">
        <Search className="size-3.5 text-fg-muted" />
        <span className="kbb-type block overflow-hidden font-mono text-[0.78rem] whitespace-nowrap text-fg">
          {search}
        </span>
        <span className="kbb-caret h-3.5 w-px bg-fg" />
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2">
        {GRADIENTS.map((g, i) => (
          <span
            key={g}
            className={cn(
              "relative block overflow-hidden rounded-lg",
              i === 1 || i === 4 ? "kbb-match" : "kbb-miss",
            )}
            style={{ background: g }}
          >
            <span className="absolute top-1.5 left-1.5 size-2 rounded-full bg-white/80" />
          </span>
        ))}
      </div>
    </div>
  );
}

/** A day's countdown on every file; no ads, no trackers, no passwords asked. */
function PrivacyArt({ labels }: { labels: BentoLabels }) {
  const chips = [
    { icon: Ban, label: labels.noAds },
    { icon: EyeOff, label: labels.noTrackers },
    { icon: KeyRound, label: labels.noPasswords },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-6 px-6">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div className="relative size-28">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              strokeWidth="6"
              className="stroke-[var(--border-subtle)]"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={100}
              className="kbb-day stroke-[#f97316]"
            />
          </svg>
          <span className="kbb-file absolute inset-0 m-auto grid size-12 place-items-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
            <Clapperboard className="size-6" />
          </span>
        </div>
        <span className="text-[0.75rem] font-semibold text-fg-secondary">{labels.deleted}</span>
      </div>
      <ul className="hidden flex-col gap-2 min-[400px]:flex">
        {chips.map(({ icon: Icon, label }, i) => (
          <li
            key={label}
            className="kbb-chip flex items-center gap-2 rounded-full border border-subtle bg-surface py-1 pr-3.5 pl-1 text-[0.8rem] font-semibold text-fg shadow-1"
            style={{ "--n": i } as Css}
          >
            <span className="grid size-6 place-items-center rounded-full bg-[color-mix(in_oklab,#16a34a_16%,transparent)] text-success">
              <Icon className="size-3.5" />
            </span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
