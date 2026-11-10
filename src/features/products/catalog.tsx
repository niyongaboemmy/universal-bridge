import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { KubikaLogo } from "@/components/brand/KubikaLogo";
import { PhoneScreens } from "@/components/brand/PhoneScreens";
import { VizullaLogo } from "@/components/brand/VizullaLogo";
import { KubikaMini, VizullaMini } from "@/features/tools/OwnTools";
import { localizePath, type Locale } from "@/i18n/routing";
import { getProducts } from "@/lib/cms/content";

/** One product as the home page promotes it (hero carousel, shortcuts). */
export type CatalogProduct = {
  key: string;
  name: string;
  tagline: string;
  /** "Live", "Free", "Beta"… */
  status: string;
  /** One feature, shown as a floating chip. */
  highlight?: string;
  href: string;
  logo: ReactNode;
  /** The stage's glow, as an rgb() colour. */
  accent: string;
  /** The device shown on the stage (decorative). */
  visual: ReactNode;
};

/** Tints for CMS products' letter logos, in order. */
const TINTS = [
  ["#fb923c", "#ea580c", "rgb(249 115 22 / 0.45)"],
  ["#34d399", "#059669", "rgb(16 185 129 / 0.4)"],
  ["#f472b6", "#db2777", "rgb(236 72 153 / 0.4)"],
  ["#facc15", "#ca8a04", "rgb(234 179 8 / 0.4)"],
] as const;

function LetterLogo({ name, from, to }: { name: string; from: string; to: string }) {
  return (
    <span
      aria-hidden
      className="grid size-full place-items-center rounded-[28%] font-display font-extrabold text-white"
      style={{ background: `linear-gradient(160deg, ${from}, ${to})`, fontSize: "0.9em" }}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * Every product we build and run, in the order the home page shows them: the
 * CMS products first (any product published in the CMS joins automatically,
 * shown on its animated phone), then our two own apps with their own scenes.
 * Add a built-in product here with its logo and scene.
 */
export async function getCatalog(locale: Locale): Promise<CatalogProduct[]> {
  const [products, tt, tp] = await Promise.all([
    getProducts(locale),
    getTranslations({ locale, namespace: "tools" }),
    getTranslations({ locale, namespace: "templates" }),
  ]);
  const cms: CatalogProduct[] = products.map((p, i) => {
    const [from, to, accent] = TINTS[i % TINTS.length]!;
    return {
      key: `cms-${p.slug}`,
      name: p.name,
      tagline: p.tagline,
      status: tp(`product.status.${p.status}`),
      highlight: p.features?.[0]?.title,
      href: localizePath(`/products/${p.slug}`, locale),
      logo: <LetterLogo name={p.name} from={from} to={to} />,
      accent,
      visual: (
        <div className="absolute inset-x-0 bottom-0 flex translate-y-[14%] justify-center">
          <PhoneScreens
            name={p.name}
            tagline={p.tagline}
            features={p.features ?? []}
            className="rotate-[4deg] max-lg:[zoom:0.78]"
          />
        </div>
      ),
    };
  });
  const own: CatalogProduct[] = [
    {
      key: "kubika",
      name: tt("kubika.name"),
      tagline: tt("kubika.short"),
      status: tt("free"),
      highlight: tt("kubika.facts.0"),
      href: localizePath("/kubika", locale),
      logo: <KubikaLogo title={null} className="size-full" />,
      accent: "rgb(14 165 233 / 0.42)",
      visual: <KubikaMini saved={tt("art.saved")} noAds={tt("art.noAds")} save={tt("art.save")} />,
    },
    {
      key: "vizulla",
      name: tt("vizulla.name"),
      tagline: tt("vizulla.short"),
      status: tt("free"),
      highlight: tt("vizulla.facts.0"),
      href: localizePath("/vizulla-browser", locale),
      logo: <VizullaLogo title={null} className="size-full" />,
      accent: "rgb(124 58 237 / 0.42)",
      visual: <VizullaMini ad={tt("art.ad")} blocked={tt("art.blocked")} />,
    },
  ];
  return [...cms, ...own];
}
