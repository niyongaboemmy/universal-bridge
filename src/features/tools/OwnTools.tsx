import {
  ArrowRight,
  ArrowUpRight,
  Ban,
  Check,
  Cpu,
  Download,
  Film,
  Languages,
  Link2,
  Lock,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { KubikaLockup, KubikaLogo } from "@/components/brand/KubikaLogo";
import { VizullaLogo } from "@/components/brand/VizullaLogo";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { buttonVariants } from "@/components/ui/button-variants";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { KUBIKA_URL, PLATFORM_COLOR, PLATFORMS, PlatformGlyph } from "@/features/kubika/platforms";
import { localizePath, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Css = React.CSSProperties & Record<`--${string}`, string | number>;

/**
 * Our own products, Vizulla Browser and Kubika, as two cards that play a short
 * loop of what each does (globals.css "ot-*"; static under reduced motion and
 * Lite mode), with links to their pages. Used in the products sections (home,
 * /products) and, with a header, on /solutions.
 */
export async function OwnTools({
  locale,
  header,
  className,
}: {
  locale: Locale;
  /** Which section header to show; none inside a block that has its own. */
  header?: "solutions";
  className?: string;
}) {
  const t = await getTranslations({ locale, namespace: "tools" });
  const tools = [
    {
      key: "vizulla",
      logo: <VizullaLogo title={null} className="size-full" />,
      art: <VizullaMini ad={t("art.ad")} blocked={t("art.blocked")} />,
      facts: [
        [ShieldCheck, t("vizulla.facts.0")],
        [Cpu, t("vizulla.facts.1")],
        [Languages, t("vizulla.facts.2")],
      ],
      primary: { href: localizePath("/vizulla-browser", locale), label: t("vizulla.explore") },
      secondary: {
        href: localizePath("/vizulla-browser", locale) + "#install",
        label: t("vizulla.secondary"),
        external: false,
      },
      glow: "rgb(124 58 237 / 0.35)",
    },
    {
      key: "kubika",
      logo: <KubikaLogo title={null} className="size-full" />,
      art: <KubikaMini saved={t("art.saved")} noAds={t("art.noAds")} save={t("art.save")} />,
      facts: [
        [Link2, t("kubika.facts.0")],
        [Film, t("kubika.facts.1")],
        [Timer, t("kubika.facts.2")],
      ],
      primary: { href: localizePath("/kubika", locale), label: t("kubika.explore") },
      secondary: { href: KUBIKA_URL, label: t("kubika.secondary"), external: true },
      glow: "rgb(14 165 233 / 0.35)",
    },
  ] as const;

  return (
    <div className={className}>
      {header && (
        <SectionHeader
          eyebrow={t(`${header}.eyebrow`)}
          title={t(`${header}.title`)}
          lead={t(`${header}.lead`)}
          className="mb-12"
        />
      )}
      <ul className="grid gap-6 lg:grid-cols-2">
        {tools.map((tool, i) => (
          <li key={tool.key} className="reveal" style={{ "--i": i } as Css}>
            <SpotlightCard className="group flex h-full flex-col overflow-hidden rounded-3xl border border-subtle bg-surface p-2 transition-[translate,border-color,box-shadow] duration-300 ease-standard hover:-translate-y-1 hover:border-[color-mix(in_oklab,#3b82f6_45%,var(--border-subtle))] hover:shadow-4">
              <div
                aria-hidden
                data-fx="tilt"
                className="relative h-72 overflow-hidden rounded-[1.25rem] border border-subtle bg-[radial-gradient(120%_90%_at_50%_0%,color-mix(in_oklab,#2563eb_22%,transparent),transparent_70%),linear-gradient(160deg,#0b1430,#060b1a)] sm:h-80"
              >
                <div
                  className="absolute -top-24 left-1/2 size-[420px] -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-70"
                  style={{ background: `radial-gradient(closest-side, ${tool.glow}, transparent)` }}
                />
                {tool.art}
              </div>
              <div className="flex flex-1 flex-col px-4 pt-6 pb-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="size-11 shrink-0 drop-shadow-[0_8px_18px_rgb(37_99_235/0.4)]">
                    {tool.logo}
                  </span>
                  <h3 className="font-display text-heading-md text-fg">{t(`${tool.key}.name`)}</h3>
                  <span className="ml-auto rounded-full bg-[color-mix(in_oklab,#16a34a_16%,transparent)] px-2.5 py-1 text-[0.72rem] font-semibold text-success">
                    {t("free")}
                  </span>
                </div>
                <p className="mt-3 text-body-md text-fg-secondary">{t(`${tool.key}.pitch`)}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {tool.facts.map(([Icon, label]) => (
                    <li
                      key={label}
                      className="flex items-center gap-1.5 rounded-full border border-subtle bg-sunken px-3 py-1 text-[0.8rem] font-medium text-fg-secondary"
                    >
                      <Icon aria-hidden className="size-3.5 text-accent" />
                      {label}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-wrap gap-3 pt-7">
                  <a href={tool.primary.href} className={cn(buttonVariants(), "vz-cta")}>
                    {tool.primary.label} <ArrowRight aria-hidden data-arrow />
                  </a>
                  <a
                    href={tool.secondary.href}
                    {...(tool.secondary.external ? { target: "_blank", rel: "noopener" } : {})}
                    className={buttonVariants({ variant: "secondary" })}
                  >
                    {tool.secondary.label}
                    {tool.secondary.external && <ArrowUpRight aria-hidden />}
                  </a>
                </div>
              </div>
            </SpotlightCard>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A Vizulla window on a news page: the ads are stamped and fold away, the shield counts. */
function VizullaMini({ ad, blocked }: { ad: string; blocked: string }) {
  return (
    <div
      className="showcase-layer absolute inset-x-5 top-7 bottom-0 sm:inset-x-10"
      style={{ "--depth": 8 } as Css}
    >
      <div className="h-full overflow-hidden rounded-t-2xl border border-white/10 bg-white text-slate-800 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)]">
        <div className="flex h-9 items-center gap-2 bg-[#e7ebf1] px-3">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="ml-2 flex h-6 items-center gap-1.5 rounded-t-lg bg-[#f5f7fa] px-2.5 text-[0.68rem] font-medium">
            <VizullaLogo title={null} className="size-3.5" />
            Vizulla
          </span>
        </div>
        <div className="flex h-9 items-center gap-2 border-b border-slate-200 bg-[#f5f7fa] px-3">
          <span className="flex h-6 flex-1 items-center gap-1.5 rounded-full bg-[#e7ebf1] px-3 text-[0.68rem] text-slate-600">
            <Lock className="size-3 text-[#16a34a]" />
            news.example.com
          </span>
          <span className="relative grid size-7 place-items-center text-[#f97316]">
            <ShieldCheck className="size-4" />
            <span
              className="ot-count vz-count absolute -top-1 -right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#f97316] px-1 text-[0.55rem] leading-none font-bold text-white"
              style={{ "--vz-n": 27 } as Css}
            />
          </span>
        </div>
        <div className="flex gap-4 p-4">
          <div className="flex-1 space-y-2">
            <span className="block h-3 w-4/5 rounded-full bg-slate-800/80" />
            <span className="block h-3 w-3/5 rounded-full bg-slate-800/80" />
            <span className="mt-3 block h-20 rounded-lg bg-[linear-gradient(135deg,#bfdbfe,#c7d2fe)]" />
            <Ad label={ad} blocked={blocked} n={0} />
            {[92, 84, 70].map((w) => (
              <span
                key={w}
                className="block h-2 rounded-full bg-slate-200"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
          <div className="hidden w-28 space-y-2 min-[420px]:block">
            <Ad label={ad} blocked={blocked} n={1} tall />
            {[90, 76, 84].map((w) => (
              <span
                key={w}
                className="block h-2 rounded-full bg-slate-200"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Ad({
  label,
  blocked,
  n,
  tall,
}: {
  label: string;
  blocked: string;
  n: number;
  tall?: boolean;
}) {
  return (
    <span
      className="ot-ad relative block overflow-hidden rounded-lg"
      style={{ "--h": tall ? "7rem" : "3rem", "--n": n } as Css}
    >
      <span className="absolute inset-0 grid place-items-center bg-[repeating-linear-gradient(45deg,#fde68a,#fde68a_8px,#fcd34d_8px,#fcd34d_16px)] text-[0.65rem] font-bold tracking-widest text-amber-800 uppercase">
        {label}
      </span>
      <span className="ot-ad__x absolute inset-0 grid place-items-center bg-[rgb(239_68_68/0.85)] text-[0.68rem] font-bold text-white">
        <span className="flex items-center gap-1">
          <Ban className="size-3.5" /> {blocked}
        </span>
      </span>
    </span>
  );
}

/** A phone running Kubika: a link lands, the post downloads, it is saved. Platforms float around. */
function KubikaMini({ saved, noAds, save }: { saved: string; noAds: string; save: string }) {
  const spots = [
    "top-[12%] left-[8%]",
    "top-[48%] left-[4%]",
    "bottom-[10%] left-[14%]",
    "top-[14%] right-[8%]",
    "top-[50%] right-[4%]",
    "bottom-[12%] right-[14%]",
  ];
  return (
    <>
      {PLATFORMS.map((p, i) => (
        <span
          key={p}
          className={cn("showcase-layer absolute", spots[i])}
          style={{ "--depth": 14 + (i % 3) * 6 } as Css}
        >
          <span
            className="kb-bob grid size-10 place-items-center rounded-full bg-white shadow-[0_10px_24px_-8px_rgb(0_0_0/0.6)]"
            style={{ "--n": i, color: PLATFORM_COLOR[p] } as Css}
          >
            <PlatformGlyph platform={p} className="size-[18px]" />
          </span>
        </span>
      ))}
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <div className="showcase-layer" style={{ "--depth": 8 } as Css}>
          <div className="h-[270px] w-[170px] rounded-t-[30px] bg-[linear-gradient(145deg,#3b4252,#0b1020_45%,#1f2937)] p-[7px] pb-0 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)] sm:h-[300px]">
            <div className="relative h-full overflow-hidden rounded-t-[24px] bg-white text-[#0b1220]">
              <span className="absolute top-1.5 left-1/2 h-4 w-14 -translate-x-1/2 rounded-full bg-black" />
              <div className="px-3 pt-8">
                <KubikaLockup title={null} className="h-4 w-auto" />
                <p className="mt-4 text-center text-[0.8rem] leading-tight font-extrabold tracking-tight">
                  Keep what is yours
                </p>
                <div className="mt-3 flex h-8 items-center gap-1.5 rounded-full border-[1.5px] border-[#2563eb] px-1.5">
                  <span className="relative grid size-5 shrink-0 place-items-center rounded-full bg-slate-100 text-[#0b1220]">
                    <Link2 className="ot-link size-3 text-slate-400" />
                    <span className="ot-glyph absolute inset-0 grid place-items-center">
                      <PlatformGlyph platform="tiktok" className="size-3" />
                    </span>
                  </span>
                  <span className="ot-type block overflow-hidden text-[0.55rem] whitespace-nowrap">
                    tiktok.com/@amani.rw/video
                  </span>
                </div>
                <div className="ot-post mt-3 overflow-hidden rounded-xl border border-slate-200">
                  <span className="relative block h-16 bg-[linear-gradient(180deg,#fb923c,#f43f5e_50%,#7c3aed)]">
                    <span className="absolute top-2 right-6 size-4 rounded-full bg-[#fde68a]" />
                    <svg
                      viewBox="0 0 100 40"
                      preserveAspectRatio="none"
                      className="absolute inset-x-0 bottom-0 h-1/2 w-full"
                    >
                      <path d="M0 22 C25 8 45 24 70 12 S95 18 100 16 V40 H0Z" fill="#4c1d95" />
                    </svg>
                  </span>
                  <div className="p-2">
                    <span className="block h-1.5 w-3/4 rounded-full bg-slate-800/80" />
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <span className="ot-bar block h-full origin-left rounded-full bg-[linear-gradient(90deg,#0ea5e9,#2563eb)]" />
                    </span>
                  </div>
                </div>
                <span className="ot-save mt-3 flex h-7 items-center justify-center gap-1 rounded-full bg-[#2563eb] text-[0.6rem] font-semibold text-white">
                  <Download className="size-3" /> {save}
                </span>
              </div>
              <span className="ot-toast absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#0b1220] px-3 py-1.5 text-[0.6rem] font-semibold whitespace-nowrap text-white">
                <Check className="size-3 text-[#4ade80]" strokeWidth={3} /> {saved}
              </span>
            </div>
          </div>
        </div>
      </div>
      <span
        className="showcase-layer absolute right-[6%] bottom-[34%] max-sm:hidden"
        style={{ "--depth": 24 } as Css}
      >
        <span className="vz-chip flex items-center gap-1.5 rounded-full border border-subtle py-1 pr-3 pl-1 text-[0.72rem] font-semibold text-fg shadow-3">
          <span className="grid size-5 place-items-center rounded-full bg-[color-mix(in_oklab,#16a34a_20%,transparent)] text-success">
            <Ban className="size-3" />
          </span>
          {noAds}
        </span>
      </span>
    </>
  );
}
