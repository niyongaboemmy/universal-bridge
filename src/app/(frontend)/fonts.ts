import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";

// SRS §4.3 / NFR-PERF-06: self-hosted, subset (Latin + Latin Extended), swap.
// `subsets` only decides what is preloaded: Latin only. Extended characters (e.g.
// French "œ") still load on demand through unicode-range (UI/UX audit v2 §3.5).
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Mono is used for eyebrows and code only — not preloaded (UI/UX §16).
export const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
  preload: false,
});
