import { ArrowLeft, ArrowRight, RotateCw, Search, ShieldCheck, Sparkles } from "lucide-react";
import { VizullaLogo } from "@/components/brand/VizullaLogo";

/**
 * Hero art: a Vizulla window drawn in HTML (tabs, address bar, the start page
 * with the logo), with two floating labels. Decorative; the page text says the same.
 */
export function BrowserShowcase({
  labels,
}: {
  labels: { blocked: string; assistant: string; address: string; newTab: string };
}) {
  return (
    <div aria-hidden className="inner-media relative mx-auto w-full max-w-[560px] py-6 lg:py-10">
      <div className="absolute inset-[8%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(59_130_246/0.45),transparent)] blur-2xl" />
      <div className="overflow-hidden rounded-[1.25rem] border border-white/12 bg-[#0b1224]/85 shadow-4 backdrop-blur-xl">
        {/* tab strip */}
        <div className="flex h-10 items-end gap-1.5 bg-white/[0.04] px-3">
          <div className="mb-3.5 mr-2 flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex h-8 w-40 items-center gap-2 rounded-t-[10px] bg-white/[0.09] px-3 text-[0.72rem] text-white/90">
            <VizullaLogo title={null} className="size-3.5" />
            <span className="truncate">{labels.newTab}</span>
          </div>
          <div className="flex h-8 w-36 items-center gap-2 px-3 text-[0.72rem] text-white/55 max-sm:hidden">
            <span className="size-3.5 rounded-[4px] bg-[#0145B8]" />
            <span className="truncate">universalbridge.rw</span>
          </div>
        </div>
        {/* toolbar */}
        <div className="flex h-11 items-center gap-2 bg-white/[0.09] px-3 text-white/60">
          <ArrowLeft className="size-3.5" />
          <ArrowRight className="size-3.5 opacity-50" />
          <RotateCw className="size-3.5" />
          <div className="ml-1 flex h-7 flex-1 items-center gap-2 rounded-full bg-black/25 px-3 text-[0.72rem] text-white/55">
            <Search className="size-3" />
            <span className="truncate">{labels.address}</span>
          </div>
          <span className="grid size-6 place-items-center rounded-full bg-[#2563eb] text-[0.6rem] font-bold text-white">
            P
          </span>
        </div>
        {/* start page */}
        <div className="grid aspect-[16/10] place-items-center bg-[linear-gradient(180deg,#f8fafc,#eef2f8)]">
          <div className="flex w-3/4 flex-col items-center">
            <VizullaLogo title={null} className="size-14 sm:size-16" />
            <div className="mt-5 flex h-9 w-full items-center gap-2 rounded-full bg-[#e9eef6] px-4 text-[0.72rem] text-slate-500">
              <Search className="size-3.5" />
              <span className="truncate">{labels.address}</span>
            </div>
            <div className="mt-5 flex gap-4">
              {["#0145B8", "#16a34a", "#e11d48", "#7c3aed"].map((c) => (
                <span key={c} className="grid size-9 place-items-center rounded-full bg-[#e9eef6]">
                  <span className="size-5 rounded-full" style={{ background: c }} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div
        className="inner-stage__chip absolute top-[30%] -left-2 flex items-center gap-2 rounded-full border border-white/12 bg-[#0b1224]/90 px-3.5 py-2 text-[0.78rem] font-medium text-white shadow-3 backdrop-blur sm:-left-8"
        style={{ "--i": 0 } as React.CSSProperties}
      >
        <ShieldCheck className="size-4 text-[#4ade80]" />
        {labels.blocked}
      </div>
      <div
        className="inner-stage__chip absolute -right-2 bottom-[14%] flex items-center gap-2 rounded-full border border-white/12 bg-[#0b1224]/90 px-3.5 py-2 text-[0.78rem] font-medium text-white shadow-3 backdrop-blur sm:-right-6"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <Sparkles className="size-4 text-[#93c5fd]" />
        {labels.assistant}
      </div>
    </div>
  );
}
