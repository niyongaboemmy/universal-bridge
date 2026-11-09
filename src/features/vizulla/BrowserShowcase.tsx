import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Cookie,
  Cpu,
  KeyRound,
  Languages,
  Lock,
  Plus,
  RotateCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Monogram } from "@/components/brand/Monogram";
import { VizullaLogo } from "@/components/brand/VizullaLogo";
import { cn } from "@/lib/utils";

type Css = React.CSSProperties & Record<`--${string}`, string | number>;

const SCENES = ["start", "shields", "assistant", "passwords"] as const;
const DIAL = [
  ["U", "#0145B8"],
  ["K", "#16a34a"],
  ["N", "#e11d48"],
  ["W", "#7c3aed"],
  ["S", "#f59e0b"],
  ["M", "#0891b2"],
] as const;

/** A grey text line in the simulated pages; width in %. */
function Bar({ w, className }: { w: number; className?: string }) {
  return (
    <span
      className={cn("block h-[0.5em] rounded-full bg-slate-200", className)}
      style={{ width: `${w}%` }}
    />
  );
}

/**
 * Hero art: a Vizulla window that plays four scenes in a loop (globals.css
 * "vz-*", 18 s): the start page with a search being typed, Shields clearing
 * ads off a news page, the assistant summarising a page, and a password
 * filled in. A cursor drives each scene. Everything is sized in em off the
 * stage width (container query), so the cursor's path holds at every size.
 * Static (reduced motion, Lite mode) it is the start page. Decorative; the
 * page text says the same.
 */
export async function BrowserShowcase({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "vizulla.showcase" });
  const scene = (s: number) => ({ "--s": s }) as Css;
  const tabs = [
    { title: t("newTab"), icon: <VizullaLogo title={null} className="size-full" /> },
    { title: t("tabNews"), icon: <Favicon letter="N" color="#e11d48" /> },
    {
      title: t("tabInsights"),
      icon: (
        <span className="grid size-full place-items-center rounded-[0.25em] bg-[#0a1633]">
          <Monogram title={null} className="w-[78%] text-white" />
        </span>
      ),
    },
    { title: t("tabSignIn"), icon: <Favicon letter="M" color="#0f766e" /> },
  ];
  const addresses = [null, "news.example.com", "universalbridge.rw/insights", "mail.example.com"];
  const blockedToday = new Intl.NumberFormat(locale).format(1284);

  return (
    <div aria-hidden className="inner-media relative mx-auto w-full max-w-[600px] py-8 lg:py-12">
      <div data-fx="tilt" className="relative">
        {/* glow + slowly turning aurora behind the window */}
        <div className="absolute inset-[4%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(59_130_246/0.5),transparent)] blur-2xl" />
        <div className="vz-aurora absolute top-1/2 left-1/2 -z-10 aspect-square w-[115%] -translate-1/2 rounded-full opacity-60 blur-3xl" />

        <div className="showcase-layer" style={{ "--depth": 6 } as Css}>
          <div className="[container-type:inline-size]">
            <div className="vz-window relative overflow-hidden rounded-[1.1em] border border-[var(--vz-line)] text-[2cqw] text-[var(--vz-fg)] shadow-[0_2.5em_5em_-1.5em_rgb(2_6_23/0.55)]">
              {/* tab strip */}
              <div className="flex h-[3.4em] items-end bg-[var(--vz-strip)] pr-[0.8em] pl-[1em]">
                <div className="mr-[1.2em] mb-[1.2em] flex gap-[0.55em]">
                  <span className="size-[0.95em] rounded-full bg-[#ff5f57]" />
                  <span className="size-[0.95em] rounded-full bg-[#febc2e]" />
                  <span className="size-[0.95em] rounded-full bg-[#28c840]" />
                </div>
                <div className="vz-tab relative flex h-[2.7em] w-[15em] items-center rounded-t-[0.8em] bg-[var(--vz-bar)] px-[0.9em]">
                  {tabs.map((tab, i) => (
                    <span
                      key={i}
                      data-first={i === 0 || undefined}
                      className="vz-swap absolute inset-y-0 right-[2.4em] left-[0.9em] flex items-center gap-[0.6em]"
                      style={scene(i)}
                    >
                      <span className="size-[1.2em] shrink-0">{tab.icon}</span>
                      <span className="truncate text-[0.95em]">{tab.title}</span>
                    </span>
                  ))}
                  <X className="ml-auto size-[1em] text-[var(--vz-fg2)]" />
                </div>
                <div className="flex h-[2.7em] w-[12em] items-center gap-[0.6em] px-[0.9em] text-[var(--vz-fg2)]">
                  <span className="size-[1.2em] shrink-0">
                    <VizullaLogo title={null} className="size-full" />
                  </span>
                  <span className="truncate text-[0.95em]">vizulla.app</span>
                </div>
                <Plus className="mb-[0.85em] ml-[0.4em] size-[1.1em] text-[var(--vz-fg2)]" />
              </div>

              {/* toolbar */}
              <div className="relative flex h-[3.6em] items-center gap-[0.4em] bg-[var(--vz-bar)] px-[1em] text-[var(--vz-fg2)]">
                <ToolButton>
                  <ArrowLeft />
                </ToolButton>
                <ToolButton className="opacity-45">
                  <ArrowRight />
                </ToolButton>
                <ToolButton>
                  <RotateCw />
                </ToolButton>
                <div className="relative mx-[0.4em] flex h-[2.5em] flex-1 items-center rounded-full bg-[var(--vz-omni)] px-[1em]">
                  {addresses.map((a, i) => (
                    <span
                      key={i}
                      data-first={i === 0 || undefined}
                      className="vz-swap absolute inset-y-0 right-[2.6em] left-[1em] flex items-center gap-[0.6em]"
                      style={scene(i)}
                    >
                      {a ? (
                        <>
                          <Lock className="size-[1em] shrink-0 text-[#16a34a]" />
                          <span className="truncate text-[0.95em] text-[var(--vz-fg)]">{a}</span>
                        </>
                      ) : (
                        <>
                          <Search className="size-[1em] shrink-0" />
                          <span className="truncate text-[0.95em]">{t("address")}</span>
                        </>
                      )}
                    </span>
                  ))}
                  <Star className="ml-auto size-[1.05em]" />
                </div>
                <ToolButton className="relative text-[#f97316]">
                  <ShieldCheck />
                  <span
                    className="vz-badge vz-count absolute -top-[0.15em] -right-[0.25em] grid h-[1.35em] min-w-[1.35em] place-items-center rounded-full bg-[#f97316] px-[0.3em] text-[0.68em] leading-none font-bold text-white"
                    style={{ "--vz-n": 0 } as Css}
                  />
                </ToolButton>
                <ToolButton className="text-[#3b82f6]">
                  <Sparkles />
                </ToolButton>
                <span className="grid size-[2.4em] shrink-0 place-items-center">
                  <span className="grid size-[1.9em] place-items-center rounded-full bg-[linear-gradient(135deg,#3b82f6,#7c3aed)] text-[0.85em] font-bold text-white">
                    P
                  </span>
                </span>
                <span className="vz-load absolute bottom-0 left-0 h-[0.18em] w-0 bg-[linear-gradient(90deg,#3b82f6,#60a5fa)]" />
              </div>

              {/* viewport: the pages are always light, like most of the web */}
              <div className="relative h-[31.25em] overflow-hidden bg-white text-slate-800">
                <StartScene
                  style={scene(0)}
                  address={t("address")}
                  query={t("query")}
                  blocked={t("blocked")}
                  blockedToday={blockedToday}
                />
                <ShieldsScene
                  style={scene(1)}
                  ad={t("ad")}
                  title={t("shieldsOn")}
                  rows={[
                    [t("ads"), 12],
                    [t("trackers"), 27],
                    [t("cookies"), 1],
                  ]}
                />
                <AssistantScene
                  style={scene(2)}
                  title={t("scenes.assistant")}
                  onDevice={t("onDevice")}
                  ask={t("ask")}
                />
                <PasswordScene style={scene(3)} title={t("tabSignIn")} strong={t("strong")} />
              </div>

              <Cursor />
            </div>
          </div>
        </div>

        {/* floating labels, each on its own parallax depth */}
        <div
          className="showcase-layer absolute top-[30%] -left-14 max-sm:hidden"
          style={{ "--depth": 18 } as Css}
        >
          <div className="vz-chip flex items-center gap-2.5 rounded-2xl border border-subtle py-2 pr-4 pl-2 text-body-sm font-medium text-fg shadow-3">
            <span className="grid size-8 place-items-center rounded-xl bg-[color-mix(in_oklab,#16a34a_16%,transparent)] text-success">
              <ShieldCheck className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.72rem] text-fg-muted">{t("blocked")}</span>
              <span
                className="vz-total vz-count font-display text-[1.05rem] font-semibold tabular-nums"
                style={{ "--vz-n": 251 } as Css}
              />
            </span>
          </div>
        </div>
        <div
          className="showcase-layer absolute -right-10 bottom-[12%] max-sm:hidden"
          style={{ "--depth": 26 } as Css}
        >
          <div className="vz-chip flex items-center gap-2.5 rounded-2xl border border-subtle py-2 pr-4 pl-2 text-body-sm font-medium text-fg shadow-3">
            <span className="grid size-8 place-items-center rounded-xl bg-[linear-gradient(135deg,#3b82f6,#7c3aed)] text-white">
              <Sparkles className="size-4" />
            </span>
            <span className="leading-tight">
              {t("assistant")}
              <span className="flex items-center gap-1 text-[0.72rem] text-fg-muted">
                <Cpu className="size-3" /> {t("onDevice")}
              </span>
            </span>
          </div>
        </div>
        <div
          className="showcase-layer absolute -top-5 right-[12%] max-sm:hidden"
          style={{ "--depth": 12 } as Css}
        >
          <div className="vz-chip flex items-center gap-2 rounded-full border border-subtle py-1.5 pr-4 pl-1.5 text-body-sm font-medium text-fg shadow-3">
            <span className="grid size-7 place-items-center rounded-full bg-spark text-on-spark">
              <Languages className="size-3.5" />
            </span>
            <span className="relative block h-[1.4em] w-[5em] overflow-hidden">
              {["Muraho", "Habari", "Bonjour", "Hello"].map((w, i) => (
                <span
                  key={w}
                  data-first={i === 0 || undefined}
                  className="vz-word absolute inset-0"
                  style={{ "--n": i } as Css}
                >
                  {w}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>

      {/* which scene is playing */}
      <ol className="mt-8 flex flex-wrap justify-center gap-2">
        {SCENES.map((s, i) => (
          <li
            key={s}
            data-first={i === 0 || undefined}
            className="vz-pill relative overflow-hidden rounded-full border border-subtle bg-[color-mix(in_oklab,var(--bg-surface)_70%,transparent)] px-3.5 py-1.5 text-[0.78rem] font-medium text-fg"
            style={scene(i)}
          >
            {t(`scenes.${s}`)}
            <span className="vz-pill__fill absolute inset-x-0 bottom-0 h-0.5 origin-left bg-spark" />
          </li>
        ))}
      </ol>
    </div>
  );
}

function ToolButton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-[2.4em] shrink-0 place-items-center rounded-full [&_svg]:size-[1.2em]",
        className,
      )}
    >
      {children}
    </span>
  );
}

function Favicon({ letter, color }: { letter: string; color: string }) {
  return (
    <span
      className="grid size-full place-items-center rounded-[0.25em] text-[0.75em] font-bold text-white"
      style={{ background: color }}
    >
      {letter}
    </span>
  );
}

/** Pointer that drives the scenes; its path (globals.css) is keyed to the em layout. */
function Cursor() {
  return (
    <span className="vz-cursor pointer-events-none absolute z-20 hidden size-[1.6em]">
      <span className="vz-click absolute -top-[0.9em] -left-[0.9em] size-[1.8em] rounded-full border-[0.15em] border-[#3b82f6] bg-[rgb(59_130_246/0.18)]" />
      <svg
        viewBox="0 0 24 24"
        className="relative size-full drop-shadow-[0_0.15em_0.3em_rgb(0_0_0/0.35)]"
      >
        <path
          d="M4 2.5 20 12l-7 1.6-3.6 6.6L4 2.5Z"
          fill="#0f172a"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function StartScene({
  style,
  address,
  query,
  blocked,
  blockedToday,
}: {
  style: Css;
  address: string;
  query: string;
  blocked: string;
  blockedToday: string;
}) {
  return (
    <div
      data-first
      className="vz-scene absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#dbe6ff,transparent_62%),linear-gradient(180deg,#f8fafc,#eef2f8)]"
      style={style}
    >
      <div className="absolute inset-x-0 top-[8.2em] flex flex-col items-center">
        <VizullaLogo
          title={null}
          className="size-[4.4em] drop-shadow-[0_0.8em_1.4em_rgb(37_99_235/0.35)]"
        />
        <div className="relative mt-[1.6em] flex h-[3em] w-[64%] items-center gap-[0.7em] rounded-full bg-white px-[1.2em] shadow-[0_0.3em_1.2em_-0.3em_rgb(15_23_42/0.18)] ring-1 ring-slate-200">
          <Search className="size-[1.1em] shrink-0 text-slate-400" />
          <span className="relative flex h-full min-w-0 flex-1 items-center text-[1.05em]">
            <span className="vz-placeholder truncate text-slate-400">{address}</span>
            <span className="absolute inset-y-0 left-0 flex items-center">
              <span className="vz-type block overflow-hidden whitespace-nowrap text-slate-900">
                {query}
              </span>
              <span className="vz-caret ml-[0.1em] h-[1.2em] w-[0.1em] bg-[#2563eb]" />
            </span>
          </span>
          <div className="vz-suggest absolute top-[calc(100%+0.4em)] left-0 z-10 w-full rounded-[1.1em] bg-white p-[0.5em] shadow-[0_0.8em_2em_-0.5em_rgb(15_23_42/0.25)] ring-1 ring-slate-200">
            {[0, 1, 2].map((r) => (
              <div
                key={r}
                className={cn(
                  "flex h-[2.2em] items-center gap-[0.7em] rounded-[0.7em] px-[0.8em]",
                  r === 0 && "bg-[#eef3ff]",
                )}
              >
                <Search className="size-[0.95em] shrink-0 text-slate-400" />
                {r === 0 ? (
                  <span className="truncate font-semibold text-slate-900">{query}</span>
                ) : (
                  <Bar w={r === 1 ? 48 : 36} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-[1.8em] flex gap-[1.2em]">
          {DIAL.map(([letter, color], i) => (
            <span
              key={letter}
              className="vz-dial flex flex-col items-center"
              style={{ "--n": i } as Css}
            >
              <span className="grid size-[3.2em] place-items-center rounded-[1em] bg-white shadow-[0_0.2em_0.6em_-0.2em_rgb(15_23_42/0.2)] ring-1 ring-slate-200/70">
                <span
                  className="grid size-[1.8em] place-items-center rounded-full text-[0.85em] font-bold text-white"
                  style={{ background: color }}
                >
                  {letter}
                </span>
              </span>
              <span className="mt-[0.5em] h-[0.4em] w-[2.4em] rounded-full bg-slate-300/70" />
            </span>
          ))}
        </div>
      </div>
      {/* privacy widget */}
      <div className="absolute bottom-[1.2em] left-[1.2em] flex items-end gap-[1em] rounded-[1em] bg-white/85 px-[1em] py-[0.8em] shadow-[0_0.3em_1em_-0.3em_rgb(15_23_42/0.18)] ring-1 ring-slate-200/70">
        <div>
          <span className="flex items-center gap-[0.4em] text-[0.8em] text-slate-500">
            <ShieldCheck className="size-[1.1em] text-[#16a34a]" />
            {blocked}
          </span>
          <span className="mt-[0.2em] block font-display text-[1.5em] leading-none font-semibold text-slate-900">
            {blockedToday}
          </span>
        </div>
        <div className="flex h-[2.6em] items-end gap-[0.25em]">
          {[38, 62, 45, 80, 56, 92, 70].map((h, i) => (
            <span
              key={i}
              className="vz-spark w-[0.45em] origin-bottom rounded-t-[0.2em] bg-[linear-gradient(180deg,#22c55e,#16a34a)]"
              style={{ height: `${h}%`, "--n": i } as Css}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Ad({ label, h, tall }: { label: string; h: string; tall?: boolean }) {
  return (
    <div className="vz-ad relative overflow-hidden rounded-[0.6em]" style={{ "--h": h } as Css}>
      <div className="flex size-full items-center gap-[1em] bg-[repeating-linear-gradient(135deg,#fef3c7_0_0.8em,#fde68a_0.8em_1.6em)] p-[0.8em]">
        <span className="absolute top-[0.4em] left-[0.4em] rounded-[0.3em] bg-[#b45309] px-[0.4em] text-[0.7em] font-bold text-white">
          {label}
        </span>
        {!tall && <span className="size-[3em] shrink-0 rounded-[0.5em] bg-[#f59e0b]/70" />}
        <span className="flex flex-1 flex-col gap-[0.5em]">
          <Bar w={70} className="bg-[#b45309]/40" />
          <Bar w={45} className="bg-[#b45309]/30" />
        </span>
      </div>
      <div className="vz-ad__x absolute inset-0 grid place-items-center bg-white/75 backdrop-blur-[2px]">
        <span className="grid size-[2.2em] place-items-center rounded-full bg-[#16a34a] text-white shadow-lg">
          <ShieldCheck className="size-[1.2em]" />
        </span>
      </div>
    </div>
  );
}

function ShieldsScene({
  style,
  ad,
  title,
  rows,
}: {
  style: Css;
  ad: string;
  title: string;
  rows: [string, number][];
}) {
  return (
    <div className="vz-scene absolute inset-0 flex flex-col bg-white" style={style}>
      <div className="flex h-[3.2em] shrink-0 items-center gap-[0.8em] border-b border-slate-100 px-[2em]">
        <span className="grid size-[1.6em] place-items-center rounded-[0.3em] bg-[#e11d48] text-[0.8em] font-black text-white">
          N
        </span>
        <span className="h-[0.7em] w-[6em] rounded-full bg-slate-800" />
        <span className="ml-auto flex gap-[1em]">
          {[3, 4, 3.5, 3].map((w, i) => (
            <span
              key={i}
              className="h-[0.5em] rounded-full bg-slate-200"
              style={{ width: `${w}em` }}
            />
          ))}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-[2em]">
        <Ad label={ad} h="4.6em" />
        <div className="grid min-h-0 flex-1 grid-cols-[2fr_1fr] gap-[1.6em] pt-[1.4em]">
          <div>
            <Bar w={92} className="h-[1.1em] bg-slate-800" />
            <Bar w={64} className="mt-[0.6em] h-[1.1em] bg-slate-800" />
            <Bar w={30} className="mt-[0.9em] bg-slate-300" />
            <div className="mt-[1em] h-[8em] overflow-hidden rounded-[0.7em] bg-[linear-gradient(180deg,#bae6fd,#e0f2fe)]">
              <svg viewBox="0 0 200 80" preserveAspectRatio="none" className="size-full">
                <circle cx="150" cy="24" r="10" fill="#fde68a" />
                <path d="M0 80 L0 52 Q40 30 80 50 T160 44 T200 50 L200 80Z" fill="#4ade80" />
                <path d="M0 80 L0 64 Q50 48 110 62 T200 60 L200 80Z" fill="#16a34a" />
              </svg>
            </div>
            {[96, 88, 93, 60].map((w, i) => (
              <Bar key={i} w={w} className="mt-[0.7em]" />
            ))}
          </div>
          <div className="flex flex-col">
            <Ad label={ad} h="9em" tall />
            {[80, 64, 72].map((w, i) => (
              <div key={i} className="mt-[1em] flex items-center gap-[0.6em]">
                <span className="size-[2em] shrink-0 rounded-[0.4em] bg-slate-100" />
                <Bar w={w} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="vz-cookie absolute inset-x-[2em] bottom-[1.2em] flex items-center gap-[1em] rounded-[0.9em] bg-slate-900 px-[1.2em] py-[0.9em] text-white shadow-xl">
        <Cookie className="size-[1.6em] shrink-0 text-[#fbbf24]" />
        <span className="flex flex-1 flex-col gap-[0.45em]">
          <Bar w={80} className="bg-white/35" />
          <Bar w={55} className="bg-white/25" />
        </span>
        <span className="h-[2em] w-[5em] rounded-full bg-white/15" />
        <span className="h-[2em] w-[5em] rounded-full bg-[#f59e0b]" />
      </div>
      {/* Shields panel, dropped from the toolbar button */}
      <div className="vz-popover absolute top-[0.4em] right-[6.4em] z-10 w-[17em] origin-top-right rounded-[1em] bg-white p-[1em] text-[0.95em] shadow-[0_1em_2.5em_-0.6em_rgb(15_23_42/0.35)] ring-1 ring-slate-200">
        <div className="flex items-center gap-[0.6em]">
          <span className="grid size-[2em] place-items-center rounded-full bg-[#dcfce7] text-[#16a34a]">
            <ShieldCheck className="size-[1.1em]" />
          </span>
          <span className="flex-1 font-semibold text-slate-900">{title}</span>
          <span className="flex h-[1.3em] w-[2.3em] items-center justify-end rounded-full bg-[#16a34a] p-[0.15em]">
            <span className="size-[1em] rounded-full bg-white" />
          </span>
        </div>
        <ul className="mt-[0.8em] space-y-[0.35em]">
          {rows.map(([label, n], i) => (
            <li
              key={label}
              className="vz-row flex items-center justify-between rounded-[0.5em] bg-slate-50 px-[0.7em] py-[0.45em]"
              style={{ "--n": i } as Css}
            >
              <span className="text-slate-600">{label}</span>
              <span
                className="vz-tally vz-count font-semibold text-slate-900 tabular-nums"
                style={{ "--to": n, "--vz-n": n } as Css}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function AssistantScene({
  style,
  title,
  onDevice,
  ask,
}: {
  style: Css;
  title: string;
  onDevice: string;
  ask: string;
}) {
  return (
    <div className="vz-scene absolute inset-0 bg-white" style={style}>
      <div className="flex h-[3.2em] items-center gap-[0.8em] bg-[#0a1633] px-[2em]">
        <Monogram title={null} className="w-[1.8em] text-white" />
        <span className="h-[0.55em] w-[6em] rounded-full bg-white/80" />
        <span className="ml-[1.5em] flex gap-[0.9em]">
          {[3, 3.5, 2.8].map((w, i) => (
            <span
              key={i}
              className="h-[0.45em] rounded-full bg-white/25"
              style={{ width: `${w}em` }}
            />
          ))}
        </span>
      </div>
      <div className="w-[54%] px-[2em] pt-[1.6em]">
        <Bar w={22} className="bg-[#f97316]" />
        <Bar w={95} className="mt-[0.8em] h-[1.1em] bg-slate-800" />
        <Bar w={70} className="mt-[0.6em] h-[1.1em] bg-slate-800" />
        <div className="relative mt-[1.1em] h-[7em] overflow-hidden rounded-[0.7em] bg-[linear-gradient(135deg,#0145b8,#0a1633)]">
          <svg viewBox="0 0 200 70" className="absolute inset-0 size-full opacity-60">
            <path
              d="M0 50 H60 l14 -14 H130 l12 12 H200"
              stroke="#7fa3fa"
              strokeWidth="1.2"
              fill="none"
            />
            <path d="M20 0 V20 l14 14 H90" stroke="#f97316" strokeWidth="1.2" fill="none" />
            <circle cx="90" cy="34" r="3" fill="#f97316" />
            <circle cx="142" cy="48" r="3" fill="none" stroke="#7fa3fa" strokeWidth="1.2" />
          </svg>
        </div>
        {[96, 90, 94, 84, 62].map((w, i) => (
          <span key={i} className="relative mt-[0.7em] block">
            <Bar w={w} />
            {i < 3 && (
              <span
                className="vz-hl absolute inset-y-[-0.25em] left-0 origin-left rounded-[0.2em] bg-[rgb(59_130_246/0.2)]"
                style={{ width: `${w}%`, "--n": i } as Css}
              />
            )}
          </span>
        ))}
      </div>
      <div className="vz-panel absolute inset-y-0 right-0 flex w-[44%] flex-col border-l border-slate-200 bg-[#f8faff] p-[1.2em] text-[0.95em] shadow-[-1em_0_2em_-1em_rgb(15_23_42/0.25)]">
        <div className="flex items-center gap-[0.5em]">
          <span className="grid size-[1.9em] shrink-0 place-items-center rounded-[0.6em] bg-[linear-gradient(135deg,#3b82f6,#7c3aed)] text-white">
            <Sparkles className="size-[1em]" />
          </span>
          <span className="truncate font-semibold text-slate-900">{title}</span>
          <span className="ml-auto flex shrink-0 items-center gap-[0.3em] rounded-full bg-[#dcfce7] px-[0.6em] py-[0.2em] text-[0.8em] font-medium text-[#15803d]">
            <Cpu className="size-[1em]" />
            {onDevice}
          </span>
        </div>
        <div className="relative mt-[1.2em] flex-1">
          <span className="vz-bubble absolute top-0 right-0 max-w-[90%] rounded-[1em] rounded-br-[0.3em] bg-[#2563eb] px-[0.9em] py-[0.55em] text-white">
            {ask}
          </span>
          <span className="vz-typing absolute top-[3.4em] left-0 flex gap-[0.3em] rounded-[1em] bg-white px-[0.9em] py-[0.8em] ring-1 ring-slate-200">
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                className="vz-dot size-[0.45em] rounded-full bg-slate-400"
                style={{ "--n": d } as Css}
              />
            ))}
          </span>
          <div className="vz-answer absolute inset-x-0 top-[3.4em] space-y-[0.7em] rounded-[1em] rounded-tl-[0.3em] bg-white p-[0.9em] ring-1 ring-slate-200">
            {[92, 78, 86, 60].map((w, i) => (
              <span key={i} className="flex items-center gap-[0.5em]">
                <span className="size-[0.45em] shrink-0 rounded-full bg-[#3b82f6]" />
                <span
                  className="vz-line block h-[0.5em] origin-left rounded-full bg-slate-300"
                  style={{ width: `${w}%`, "--n": i } as Css}
                />
              </span>
            ))}
          </div>
        </div>
        <div className="flex h-[2.6em] items-center rounded-full bg-white pr-[0.3em] pl-[1em] ring-1 ring-slate-200">
          <Bar w={50} className="bg-slate-200" />
          <span className="ml-auto grid size-[2em] place-items-center rounded-full bg-[#2563eb] text-white">
            <ArrowUp className="size-[1em]" />
          </span>
        </div>
      </div>
    </div>
  );
}

function PasswordScene({ style, title, strong }: { style: Css; title: string; strong: string }) {
  return (
    <div
      className="vz-scene absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,#ccfbf1,transparent_70%),linear-gradient(180deg,#f8fafc,#eef2f6)]"
      style={style}
    >
      <div className="absolute top-[4.35em] left-1/2 w-[22em] -translate-x-1/2 rounded-[1.2em] bg-white p-[1.4em] shadow-[0_1em_2.5em_-1em_rgb(15_23_42/0.3)] ring-1 ring-slate-200/80">
        <span className="grid size-[2.4em] place-items-center rounded-[0.7em] bg-[#0f766e] font-bold text-white">
          M
        </span>
        <p className="mt-[0.8em] truncate text-[1.1em] leading-none font-semibold text-slate-900">
          {title}
        </p>
        <Bar w={22} className="mt-[1.2em] h-[0.6em] bg-slate-300" />
        <div className="relative mt-[0.4em]">
          <div className="vz-focus flex h-[2.6em] items-center rounded-[0.6em] px-[0.8em] ring-1 ring-slate-300">
            <span className="vz-fill block overflow-hidden whitespace-nowrap text-slate-900">
              you@example.com
            </span>
          </div>
          <div className="vz-drop absolute inset-x-0 top-[calc(100%+0.3em)] z-10 rounded-[0.8em] bg-white p-[0.4em] shadow-[0_0.8em_2em_-0.5em_rgb(15_23_42/0.3)] ring-1 ring-slate-200">
            <div className="flex h-[2.4em] items-center gap-[0.6em] rounded-[0.6em] bg-[#eef3ff] px-[0.6em]">
              <span className="grid size-[1.6em] shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#3b82f6,#7c3aed)] text-[0.75em] font-bold text-white">
                P
              </span>
              <span className="flex-1 truncate text-slate-900">you@example.com</span>
              <KeyRound className="size-[1em] text-[#2563eb]" />
            </div>
          </div>
        </div>
        <Bar w={30} className="mt-[0.9em] h-[0.6em] bg-slate-300" />
        <div className="mt-[0.4em] flex h-[2.6em] items-center rounded-[0.6em] px-[0.8em] ring-1 ring-slate-300">
          <span className="vz-fill vz-fill--late block overflow-hidden text-[1.2em] leading-none tracking-[0.1em] whitespace-nowrap text-slate-900">
            ••••••••••••
          </span>
          <KeyRound className="ml-auto size-[1em] shrink-0 text-[#2563eb]" />
        </div>
        <div className="mt-[0.7em] h-[0.35em] overflow-hidden rounded-full bg-slate-100">
          <span className="vz-meter block h-full origin-left rounded-full bg-[linear-gradient(90deg,#f59e0b,#22c55e)]" />
        </div>
        <p className="vz-strong mt-[0.5em] flex h-[1em] items-center gap-[0.35em] text-[0.85em] font-medium text-[#15803d]">
          <Check className="size-[1.1em]" />
          {strong}
        </p>
        <span className="mt-[1em] grid h-[2.6em] place-items-center rounded-[0.6em] bg-[#0f766e] text-white">
          <ArrowRight className="size-[1.1em]" />
        </span>
      </div>
    </div>
  );
}
