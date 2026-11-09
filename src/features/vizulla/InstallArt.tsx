import { Check, Folder, MousePointer2 } from "lucide-react";
import { VizullaLogo } from "@/components/brand/VizullaLogo";
import type { OsFamily } from "./platforms";

type Css = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * The install, played out for each system (globals.css "vzi-*"): on macOS the
 * icon is dragged into Applications, on Windows the setup bar fills, on Linux
 * the AppImage is made executable and started. Static: the finished state.
 */
export function InstallArt({ os }: { os: OsFamily }) {
  return (
    <div
      aria-hidden
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-subtle bg-surface shadow-3"
    >
      <div className="flex h-9 items-center gap-1.5 border-b border-subtle bg-sunken px-3.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-[0.72rem] text-fg-muted">
          {os === "mac" ? "Vizulla.dmg" : os === "windows" ? "Vizulla Setup" : "Terminal"}
        </span>
      </div>
      {os === "mac" ? <MacArt /> : os === "windows" ? <WindowsArt /> : <LinuxArt />}
    </div>
  );
}

function MacArt() {
  return (
    // Fixed 18rem row, 5rem columns: the drag travels 13rem (globals.css vzi-drag).
    <div className="relative mx-auto flex h-56 w-[18rem] items-center justify-between">
      <div className="flex w-20 flex-col items-center gap-2">
        <span className="relative size-20">
          <VizullaLogo title={null} className="size-full opacity-35" />
          <span className="vzi-drag absolute inset-0">
            <VizullaLogo
              title={null}
              className="size-full drop-shadow-[0_10px_18px_rgb(37_99_235/0.45)]"
            />
            <MousePointer2 className="absolute -right-2 -bottom-2 size-6 fill-fg text-surface" />
          </span>
        </span>
        <span className="text-body-sm font-medium text-fg">Vizulla</span>
      </div>
      <svg viewBox="0 0 80 20" className="w-16 text-fg-muted" fill="none">
        <path
          d="M2 10 H70 M62 3 l9 7 -9 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
          strokeLinecap="round"
          className="vzi-flow"
        />
      </svg>
      <div className="flex w-20 flex-col items-center gap-2 whitespace-nowrap">
        <span className="vzi-folder grid size-20 place-items-center rounded-2xl bg-[linear-gradient(180deg,#60a5fa,#2563eb)] text-white shadow-[0_10px_24px_-8px_rgb(37_99_235/0.6)]">
          <Folder className="size-10" strokeWidth={1.6} />
        </span>
        <span className="text-body-sm font-medium text-fg">Applications</span>
      </div>
    </div>
  );
}

function WindowsArt() {
  return (
    <div className="flex h-56 flex-col items-center justify-center gap-5 px-10">
      <span className="relative">
        <VizullaLogo title={null} className="size-16" />
        <span className="vzi-done absolute -right-1.5 -bottom-1.5 grid size-7 place-items-center rounded-full bg-[#16a34a] text-white ring-4 ring-[var(--bg-surface)]">
          <Check className="size-4" strokeWidth={3} />
        </span>
      </span>
      <div className="w-full">
        <div className="h-2 overflow-hidden rounded-full bg-[var(--border-subtle)]">
          <span className="vzi-bar block h-full origin-left rounded-full bg-[linear-gradient(90deg,#3b82f6,#1d4ed8)]" />
        </div>
        <p className="mt-2 flex justify-between font-mono text-[0.72rem] text-fg-muted">
          <span>Vizulla</span>
          <span className="vzi-pct vz-count tabular-nums" style={{ "--vz-n": 100 } as Css} />
        </p>
      </div>
    </div>
  );
}

function LinuxArt() {
  const lines = ["chmod +x Vizulla-x86_64.AppImage", "./Vizulla-x86_64.AppImage"];
  return (
    <div className="h-56 bg-[#0b1020] p-5 font-mono text-[0.8rem] leading-7 text-slate-200">
      {lines.map((l, i) => (
        <p key={l} className="flex whitespace-nowrap">
          <span className="mr-2 text-[#4ade80]">$</span>
          <span className="vzi-line block overflow-hidden" style={{ "--n": i } as Css}>
            {l}
          </span>
        </p>
      ))}
      <p className="vzi-ready mt-3 flex items-center gap-2.5 text-white">
        <VizullaLogo title={null} className="size-6" />
        <Check className="size-4 text-[#4ade80]" strokeWidth={3} />
        Vizulla
      </p>
      <span className="vzi-caret mt-1 inline-block h-4 w-2 bg-slate-300" />
    </div>
  );
}
