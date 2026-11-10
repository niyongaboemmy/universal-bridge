import {
  BatteryFull,
  Check,
  Clapperboard,
  ClipboardPaste,
  Download,
  EyeOff,
  FileVideo,
  Layers,
  Library,
  Link2,
  Loader2,
  Moon,
  Play,
  ShieldCheck,
  Signal,
  Timer,
  Wifi,
  X,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { KubikaLockup } from "@/components/brand/KubikaLogo";
import { cn } from "@/lib/utils";
import { PLATFORM_COLOR, PLATFORMS, PlatformGlyph, type PlatformKey } from "./platforms";

type Css = React.CSSProperties & Record<`--${string}`, string | number>;

const SCENES = ["paste", "choose", "download", "save"] as const;
/** The scene shown when nothing moves (reduced motion, Lite mode). */
const STATIC = 1;
const LINK = "tiktok.com/@amani.rw/video/7341";
const FORMATS = ["Best", "1080p", "720p", "MP3"];
const COVERS = [
  "linear-gradient(160deg,#fb923c,#e11d48)",
  "linear-gradient(160deg,#38bdf8,#4f46e5)",
  "linear-gradient(160deg,#c084fc,#db2777)",
];

/**
 * Hero art: a phone running Kubika, playing four scenes in a 16 s loop
 * (globals.css "kb-*"): a TikTok link is pasted, a format is picked, the
 * download runs, the file is saved. A fingertip drives each scene. The phone
 * is sized in em off its own width (container query), so the tap path holds at
 * every size; its coordinates are screen em (24.4 × 52.4). Static: the
 * "choose" scene. Decorative; the page text says the same.
 */
export async function PhoneShowcase({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "kubika.showcase" });
  const scene = (s: number) => ({ "--s": s }) as Css;
  const first = (s: number) => (s === STATIC ? { "data-static": true as const } : {});

  return (
    <div aria-hidden className="inner-media relative mx-auto w-full max-w-[560px] py-6 lg:py-10">
      <div data-fx="tilt" className="relative">
        <div className="absolute inset-[12%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(37_99_235/0.55),transparent)] blur-2xl" />
        <div className="vz-aurora absolute top-1/2 left-1/2 -z-10 aspect-square w-[95%] -translate-1/2 rounded-full opacity-50 blur-3xl" />

        {/* platform bubbles, each on its own depth */}
        {PLATFORMS.map((p, i) => (
          <Bubble key={p} platform={p} n={i} />
        ))}

        <div
          className="showcase-layer mx-auto w-[min(100%,300px)] sm:w-[320px]"
          style={{ "--depth": 6 } as Css}
        >
          <div className="[container-type:inline-size]">
            <div className="relative h-[54em] w-[26em] rounded-[4.2em] bg-[linear-gradient(145deg,#3b4252,#0b1020_45%,#1f2937)] p-[0.8em] text-[3.846cqw] shadow-[0_3em_6em_-1.5em_rgb(2_6_23/0.7),inset_0_0_0_0.12em_rgb(255_255_255/0.14)]">
              {/* side buttons */}
              <span className="absolute top-[11em] -left-[0.25em] h-[3.2em] w-[0.25em] rounded-l-full bg-[#2a3140]" />
              <span className="absolute top-[15.5em] -left-[0.25em] h-[5em] w-[0.25em] rounded-l-full bg-[#2a3140]" />
              <span className="absolute top-[14em] -right-[0.25em] h-[7em] w-[0.25em] rounded-r-full bg-[#2a3140]" />

              <div className="relative h-[52.4em] w-[24.4em] overflow-hidden rounded-[3.4em] bg-white text-[#0b1220]">
                <StatusBar />
                <div className="absolute inset-x-0 top-[3.2em] flex h-[3.4em] items-center justify-between px-[1.3em]">
                  <KubikaLockup title={null} className="h-[1.9em] w-auto" />
                  <span className="grid size-[2.5em] place-items-center rounded-full border border-slate-200">
                    <Moon className="size-[1.15em]" />
                  </span>
                </div>
                <span className="absolute inset-x-0 top-[6.8em] h-px bg-slate-200" />

                <PasteScene
                  style={scene(0)}
                  {...first(0)}
                  title={t("hero")}
                  placeholder={t("placeholder")}
                  fetching={t("fetching")}
                  trust={[t("noAds"), t("noTrackers"), t("deleted")]}
                  recent={t("recent")}
                  items={[
                    { platform: "youtube", title: t("recent1"), meta: "MP4 · 1080p", cover: 1 },
                    { platform: "instagram", title: t("recent2"), meta: "ZIP · 6", cover: 2 },
                  ]}
                />
                <ChooseScene
                  style={scene(1)}
                  {...first(1)}
                  title={t("postTitle")}
                  meta={t("postMeta")}
                  format={t("format")}
                  download={t("download")}
                />
                <DownloadScene
                  style={scene(2)}
                  {...first(2)}
                  title={t("postTitle")}
                  steps={[t("stepFetch"), t("stepMerge"), t("stepSave")]}
                />
                <SaveScene
                  style={scene(3)}
                  {...first(3)}
                  ready={t("ready")}
                  file={t("file")}
                  device={t("saveDevice")}
                  library={t("saveLibrary")}
                  saved={t("saved")}
                />

                <BottomNav labels={[t("navDownload"), t("navBatch"), t("navLibrary")]} />
                <Tap />
              </div>
            </div>
          </div>
        </div>

        {/* floating labels */}
        <div
          className="showcase-layer absolute top-[22%] left-0 max-sm:hidden lg:-left-6"
          style={{ "--depth": 18 } as Css}
        >
          <div className="vz-chip flex items-center gap-2.5 rounded-2xl border border-subtle py-2 pr-4 pl-2 text-body-sm font-medium text-fg shadow-3">
            <span className="grid size-8 place-items-center rounded-xl bg-[color-mix(in_oklab,#16a34a_16%,transparent)] text-success">
              <ShieldCheck className="size-4" />
            </span>
            <span className="leading-tight">
              {t("noAds")}
              <span className="flex items-center gap-1 text-[0.72rem] text-fg-muted">
                <EyeOff className="size-3" /> {t("noTrackers")}
              </span>
            </span>
          </div>
        </div>
        <div
          className="showcase-layer absolute right-0 bottom-[20%] max-sm:hidden lg:-right-4"
          style={{ "--depth": 26 } as Css}
        >
          <div className="vz-chip flex items-center gap-2.5 rounded-2xl border border-subtle py-2 pr-4 pl-2 text-body-sm font-medium text-fg shadow-3">
            <span className="relative grid size-8 place-items-center">
              <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  strokeWidth="3"
                  className="stroke-[var(--border-subtle)]"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={100}
                  className="kb-countdown stroke-[#f97316]"
                />
              </svg>
              <Timer className="size-3.5 text-[#f97316]" />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.72rem] text-fg-muted">{t("privacy")}</span>
              {t("deleted")}
            </span>
          </div>
        </div>
        <div
          className="showcase-layer absolute top-[3%] -right-6 max-sm:hidden"
          style={{ "--depth": 12 } as Css}
        >
          <div className="vz-chip flex items-center gap-2 rounded-full border border-subtle py-1.5 pr-4 pl-1.5 text-body-sm font-medium text-fg shadow-3">
            <span className="grid size-7 place-items-center rounded-full bg-[#2563eb] text-white">
              <FileVideo className="size-3.5" />
            </span>
            <span className="relative block h-[1.4em] w-[6.5em] overflow-hidden">
              {["MP4 · 1080p", "MP3 · Audio", "JPG · Photo", "ZIP · Carousel"].map((w, i) => (
                <span
                  key={w}
                  data-first={i === 0 || undefined}
                  className="vz-word absolute inset-0 whitespace-nowrap"
                  style={{ "--n": i } as Css}
                >
                  {w}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>

      <ol className="mt-8 flex flex-wrap justify-center gap-2">
        {SCENES.map((s, i) => (
          <li
            key={s}
            {...first(i)}
            className="kb-pill relative overflow-hidden rounded-full border border-subtle bg-[color-mix(in_oklab,var(--bg-surface)_70%,transparent)] px-3.5 py-1.5 text-[0.78rem] font-medium text-fg"
            style={scene(i)}
          >
            {t(`scenes.${s}`)}
            <span className="kb-pill__fill absolute inset-x-0 bottom-0 h-0.5 origin-left bg-spark" />
          </li>
        ))}
      </ol>
    </div>
  );
}

const BUBBLES: { pos: string; depth: number }[] = [
  { pos: "top-[10%] left-[8%]", depth: 22 },
  { pos: "top-[46%] left-[2%]", depth: 30 },
  { pos: "bottom-[8%] left-[12%]", depth: 16 },
  { pos: "top-[30%] right-[4%]", depth: 28 },
  { pos: "top-[60%] right-[10%]", depth: 14 },
  { pos: "bottom-[2%] right-[22%]", depth: 20 },
];

function Bubble({ platform, n }: { platform: PlatformKey; n: number }) {
  const { pos, depth } = BUBBLES[n]!;
  return (
    <div
      className={cn("showcase-layer absolute max-sm:hidden", pos)}
      style={{ "--depth": depth } as Css}
    >
      <span
        className="kb-bob grid size-12 place-items-center rounded-full border border-white/70 bg-white shadow-[0_12px_30px_-10px_rgb(2_6_23/0.5)]"
        style={{ "--n": n, color: PLATFORM_COLOR[platform] } as Css}
      >
        <PlatformGlyph platform={platform} className="size-5" />
      </span>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="absolute inset-x-0 top-0 h-[3em]">
      <span className="absolute top-[1.05em] left-[2.1em] text-[0.95em] font-semibold">9:41</span>
      <span className="absolute top-[0.7em] left-1/2 h-[2.1em] w-[7.4em] -translate-x-1/2 rounded-full bg-black" />
      <span className="absolute top-[1.05em] right-[1.9em] flex items-center gap-[0.35em] [&_svg]:size-[1.05em]">
        <Signal />
        <Wifi />
        <BatteryFull className="!size-[1.3em]" />
      </span>
    </div>
  );
}

function BottomNav({ labels }: { labels: string[] }) {
  const icons = [Download, Layers, Library];
  return (
    <div className="absolute inset-x-0 bottom-0 h-[5em] border-t border-slate-200 bg-white">
      <div className="grid h-[3.9em] grid-cols-3">
        {labels.map((label, i) => {
          const Icon = icons[i]!;
          return (
            <span
              key={label}
              className={cn(
                "flex flex-col items-center justify-center gap-[0.25em] text-[0.72em] font-semibold",
                i === 0 ? "text-[#2563eb]" : "text-slate-500",
              )}
            >
              <Icon className="size-[1.75em]" strokeWidth={2} />
              {label}
            </span>
          );
        })}
      </div>
      <span className="absolute bottom-[0.55em] left-1/2 h-[0.3em] w-[8.5em] -translate-x-1/2 rounded-full bg-[#0b1220]" />
    </div>
  );
}

type SceneProps = { style: Css; "data-static"?: true };

function Scene({ children, ...rest }: SceneProps & { children: React.ReactNode }) {
  return (
    // Full screen, so its parts are placed in screen em like the tap path.
    <div className="kb-scene absolute inset-0" {...rest}>
      {children}
    </div>
  );
}

/** Scene 1: the link is pasted, the platform is recognised, the post is fetched. */
function PasteScene({
  title,
  placeholder,
  fetching,
  trust,
  recent,
  items,
  ...rest
}: SceneProps & {
  title: string;
  placeholder: string;
  fetching: string;
  trust: string[];
  recent: string;
  items: { platform: PlatformKey; title: string; meta: string; cover: number }[];
}) {
  return (
    <Scene {...rest}>
      <p className="absolute inset-x-[1.4em] top-[9em] text-center">
        <span className="block text-[2.2em] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance">
          {title}
        </span>
      </p>
      <div className="absolute top-[15.4em] left-[1.95em] flex gap-[0.5em]">
        {PLATFORMS.map((p) => (
          <span
            key={p}
            className={cn(
              "grid size-[3em] place-items-center rounded-full border border-slate-200",
              p === "tiktok" && "kb-hit",
            )}
            style={{ color: PLATFORM_COLOR[p] }}
          >
            <PlatformGlyph platform={p} className="size-[1.3em]" />
          </span>
        ))}
      </div>
      <div className="absolute inset-x-[1.2em] top-[20.6em] h-[4.2em] rounded-full border-[0.12em] border-[#2563eb] bg-white shadow-[0_0_0_0.35em_rgb(37_99_235/0.12)]">
        <span className="absolute top-1/2 left-[0.7em] grid size-[2.8em] -translate-y-1/2 place-items-center rounded-full bg-slate-100 text-slate-500">
          <Link2 className="kb-link-icon size-[1.2em]" />
          <span className="kb-glyph absolute inset-0 grid place-items-center text-[#0b1220]">
            <PlatformGlyph platform="tiktok" className="size-[1.35em]" />
          </span>
        </span>
        <span className="kb-ph absolute top-1/2 left-[4.2em] -translate-y-1/2 text-slate-400">
          {placeholder}
        </span>
        <span className="absolute inset-y-0 right-[4em] left-[4.2em] flex items-center overflow-hidden">
          <span className="kb-type block overflow-hidden text-[0.95em] whitespace-nowrap">
            {LINK}
          </span>
        </span>
        <span className="kb-press absolute top-1/2 right-[0.6em] grid size-[3em] -translate-y-1/2 place-items-center rounded-full bg-[#2563eb] text-white">
          <ClipboardPaste className="size-[1.25em]" />
        </span>
      </div>
      <p className="kb-fetch absolute inset-x-[1.2em] top-[26.2em] flex items-center justify-center gap-[0.5em] text-slate-500">
        <Loader2 className="kb-spin size-[1em] text-[#2563eb]" />
        <span className="text-[0.9em]">{fetching}</span>
      </p>
      <div className="absolute inset-x-[1.2em] top-[30em]">
        <div className="flex flex-wrap justify-center gap-x-[1.2em] gap-y-[0.6em] text-[0.88em] text-slate-600">
          <span className="flex items-center gap-[0.4em]">
            <ShieldCheck className="size-[1.15em] text-[#16a34a]" /> {trust[0]}
          </span>
          <span className="flex items-center gap-[0.4em]">
            <EyeOff className="size-[1.15em] text-[#7c3aed]" /> {trust[1]}
          </span>
          <span className="flex items-center gap-[0.4em]">
            <Timer className="size-[1.15em] text-[#c2410c]" /> {trust[2]}
          </span>
        </div>
      </div>
      <div className="absolute inset-x-[1.2em] top-[34.6em]">
        <p className="text-[0.78em] font-semibold tracking-wide text-slate-500 uppercase">
          {recent}
        </p>
        <ul className="mt-[0.7em] space-y-[0.5em]">
          {items.map((it) => (
            <li
              key={it.title}
              className="flex items-center gap-[0.7em] rounded-[0.9em] border border-slate-200 p-[0.45em]"
            >
              <span
                className="relative size-[2.6em] shrink-0 rounded-[0.6em]"
                style={{ background: COVERS[it.cover] }}
              >
                <span
                  className="absolute -right-[0.3em] -bottom-[0.3em] grid size-[1.3em] place-items-center rounded-full bg-white shadow"
                  style={{ color: PLATFORM_COLOR[it.platform] }}
                >
                  <PlatformGlyph platform={it.platform} className="size-[0.85em]" />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.85em] font-semibold">{it.title}</span>
                <span className="text-[0.72em] text-slate-500">{it.meta}</span>
              </span>
              <Check className="mr-[0.4em] size-[1.1em] text-[#16a34a]" strokeWidth={3} />
            </li>
          ))}
        </ul>
      </div>
    </Scene>
  );
}

/** A sunset over hills: the post's cover, drawn. */
function Cover({ className, play = true }: { className?: string; play?: boolean }) {
  return (
    <span
      className={cn(
        "relative block overflow-hidden bg-[linear-gradient(180deg,#fb923c_0%,#f43f5e_45%,#7c3aed_100%)]",
        className,
      )}
    >
      <span className="absolute top-[18%] left-[60%] aspect-square w-[16%] rounded-full bg-[#fde68a] shadow-[0_0_2em_0.5em_rgb(253_230_138/0.6)]" />
      <svg
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-[60%] w-full"
      >
        <path d="M0 34 C18 22 30 28 44 20 S74 18 100 26 V60 H0Z" fill="#4c1d95" opacity="0.75" />
        <path d="M0 44 C20 36 40 42 60 34 S88 36 100 40 V60 H0Z" fill="#1e1b4b" />
        <path d="M0 52 H100 V60 H0Z" fill="#0f172a" opacity="0.6" />
      </svg>
      {play && (
        <span className="absolute top-1/2 left-1/2 grid size-[3.2em] -translate-1/2 place-items-center rounded-full bg-white/25 backdrop-blur-sm">
          <Play className="ml-[0.15em] size-[1.3em] fill-white text-white" />
        </span>
      )}
    </span>
  );
}

/** Scene 2: the post preview; 1080p is picked, then Download. */
function ChooseScene({
  title,
  meta,
  format,
  download,
  ...rest
}: SceneProps & { title: string; meta: string; format: string; download: string }) {
  return (
    <Scene {...rest}>
      <div className="absolute inset-x-[1.2em] top-[8em] flex h-[3.6em] items-center gap-[0.6em] rounded-full border border-slate-200 bg-slate-50 px-[0.9em]">
        <PlatformGlyph platform="tiktok" className="size-[1.3em]" />
        <span className="min-w-0 flex-1 truncate text-[0.9em] text-slate-700">{LINK}</span>
        <X className="size-[1.1em] text-slate-400" />
      </div>
      <div className="kb-card absolute inset-x-[1.2em] top-[12.6em] overflow-hidden rounded-[1.4em] border border-slate-200 bg-white shadow-[0_1em_2em_-1.2em_rgb(15_23_42/0.3)]">
        <Cover className="h-[11.6em]" />
        <span className="absolute top-[9.6em] right-[0.8em] rounded-[0.4em] bg-black/60 px-[0.45em] py-[0.1em] font-mono text-[0.75em] text-white">
          0:42
        </span>
        <div className="flex gap-[0.7em] px-[1em] py-[0.9em]">
          <span className="grid size-[2.4em] shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#f97316,#db2777)] text-[0.8em] font-bold text-white">
            A
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.95em] font-bold">{title}</span>
            <span className="mt-[0.15em] flex items-center gap-[0.35em] text-[0.78em] text-slate-500">
              <PlatformGlyph platform="tiktok" className="size-[1.1em]" /> @amani.rw · {meta}
            </span>
          </span>
        </div>
      </div>
      <p className="absolute top-[30.4em] left-[1.4em] leading-none">
        <span className="text-[0.78em] font-semibold tracking-wide text-slate-500 uppercase">
          {format}
        </span>
      </p>
      <div className="absolute inset-x-[1.2em] top-[32em] h-[2.8em]">
        <span className="kb-sel absolute inset-y-0 left-0 w-[5.125em] rounded-full border-[0.1em] border-[#2563eb] bg-[#eff6ff]" />
        <div className="relative grid h-full grid-cols-4 gap-[0.5em]">
          {FORMATS.map((f) => (
            <span
              key={f}
              className="grid place-items-center rounded-full border border-slate-200 text-[0.85em] font-semibold text-slate-700"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
      <span className="kb-press kb-press--late absolute inset-x-[1.2em] top-[36.2em] flex h-[3.8em] items-center justify-center gap-[0.5em] rounded-full bg-[#2563eb] text-[1em] font-semibold text-white shadow-[0_0.8em_1.6em_-0.8em_rgb(37_99_235/0.8)]">
        <Download className="size-[1.2em]" /> {download}
      </span>
    </Scene>
  );
}

/** Scene 3: the download runs; the steps tick off. */
function DownloadScene({ title, steps, ...rest }: SceneProps & { title: string; steps: string[] }) {
  return (
    <Scene {...rest}>
      <div className="absolute inset-x-[1.2em] top-[8.4em] flex items-center gap-[0.8em] rounded-[1.1em] border border-slate-200 p-[0.6em]">
        <Cover className="size-[3.4em] shrink-0 rounded-[0.7em]" play={false} />
        <span className="min-w-0">
          <span className="block truncate text-[0.92em] font-bold">{title}</span>
          <span className="text-[0.78em] text-slate-500">1080p · MP4</span>
        </span>
      </div>
      <div className="absolute top-[14.4em] left-1/2 size-[12em] -translate-x-1/2">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <defs>
            <linearGradient id="kb-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0ea5e9" />
              <stop offset="1" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="43" fill="none" stroke="#e2e8f0" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            r="43"
            fill="none"
            stroke="url(#kb-ring)"
            strokeWidth="7"
            strokeLinecap="round"
            pathLength={100}
            className="kb-ring"
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="kb-pct vz-count text-[2.6em] leading-none font-extrabold tracking-tight tabular-nums"
            style={{ "--vz-n": 100 } as Css}
          />
          <span className="mt-[0.4em] text-[0.8em] text-slate-500">MP4 · 24.6 MB</span>
        </span>
      </div>
      <ol className="absolute inset-x-[1.6em] top-[28.4em] space-y-[0.5em]">
        {steps.map((s, i) => (
          <li
            key={s}
            className="kb-step flex h-[2.9em] items-center gap-[0.7em] rounded-[0.9em] bg-slate-50 px-[0.8em] text-[0.88em]"
            style={{ "--n": i } as Css}
          >
            <span className="relative grid size-[1.7em] shrink-0 place-items-center rounded-full border-[0.12em] border-slate-300">
              <span className="kb-tick absolute inset-[-0.12em] grid place-items-center rounded-full bg-[#16a34a] text-white">
                <Check className="size-[1em]" strokeWidth={3} />
              </span>
            </span>
            {s}
          </li>
        ))}
      </ol>
    </Scene>
  );
}

/** Scene 4: the file is ready; Save to device, and it is saved. */
function SaveScene({
  ready,
  file,
  device,
  library,
  saved,
  ...rest
}: SceneProps & { ready: string; file: string; device: string; library: string; saved: string }) {
  return (
    <Scene {...rest}>
      <div className="absolute top-[9.4em] left-1/2 size-[6.4em] -translate-x-1/2">
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            className="kb-ray absolute top-1/2 left-1/2 h-[0.3em] w-[1.2em] origin-left rounded-full bg-[#22c55e]"
            style={{ "--a": `${i * 45}deg` } as Css}
          />
        ))}
        <span className="kb-done absolute inset-0 grid place-items-center rounded-full bg-[#16a34a] text-white shadow-[0_1em_2em_-0.8em_rgb(22_163_74/0.8)]">
          <Check className="size-[3em]" strokeWidth={3} />
        </span>
      </div>
      <p className="absolute inset-x-0 top-[17.2em] text-center">
        <span className="text-[1.5em] font-extrabold tracking-tight">{ready}</span>
      </p>
      <div className="kb-card absolute inset-x-[1.2em] top-[21.4em] flex h-[5em] items-center gap-[0.8em] rounded-[1.1em] border border-slate-200 bg-white px-[0.8em] shadow-[0_1em_2em_-1.4em_rgb(15_23_42/0.35)]">
        <span className="grid size-[3.2em] shrink-0 place-items-center rounded-[0.8em] bg-[#eff6ff] text-[#2563eb]">
          <Clapperboard className="size-[1.5em]" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-mono text-[0.85em] font-semibold">
            lake-kivu-1080p.mp4
          </span>
          <span className="text-[0.78em] text-slate-500">{file}</span>
        </span>
      </div>
      <span className="kb-press kb-press--save absolute inset-x-[1.2em] top-[28.4em] flex h-[3.8em] items-center justify-center gap-[0.5em] rounded-full bg-[#2563eb] font-semibold text-white">
        <Download className="size-[1.2em]" /> {device}
      </span>
      <span className="absolute inset-x-[1.2em] top-[33em] flex h-[3.6em] items-center justify-center gap-[0.5em] rounded-full border border-slate-200 font-semibold text-slate-700">
        <Library className="size-[1.2em]" /> {library}
      </span>
      <span className="kb-toast absolute top-[39.6em] left-1/2 flex h-[3em] -translate-x-1/2 items-center gap-[0.5em] rounded-full bg-[#0b1220] px-[1.2em] font-semibold whitespace-nowrap text-white">
        <Check className="size-[1.1em] text-[#4ade80]" strokeWidth={3} />
        <span className="text-[0.9em]">{saved}</span>
      </span>
    </Scene>
  );
}

/** The fingertip; its path (globals.css kb-tap) is in screen em. */
function Tap() {
  return (
    <span className="kb-tap pointer-events-none absolute top-0 left-0 z-20 -mt-[1.3em] -ml-[1.3em] hidden size-[2.6em]">
      <span className="kb-tap__ring absolute inset-[-0.6em] rounded-full border-[0.15em] border-[#2563eb]" />
      <span className="absolute inset-0 rounded-full bg-[rgb(15_23_42/0.28)] ring-[0.18em] ring-white/80 backdrop-blur-[1px]" />
    </span>
  );
}
