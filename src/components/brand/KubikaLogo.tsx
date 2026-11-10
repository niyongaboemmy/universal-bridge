import { cn } from "@/lib/utils";

// Kubika logo system v2 (social-media-downloader: docs/assets/kubika-logo.svg).
// Mark: a lowercase k whose stem sweeps into a lipped floor, so the letter forms
// a tray ("kubika" = "to keep"). Geometry and colours unchanged.
const MARK = (
  <>
    <rect width="120" height="120" rx="30" fill="#2563EB" />
    <g fill="none" stroke="#fff" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
      <path d="M38 23v50a15 15 0 0 0 15 15h26a9 9 0 0 0 9-9v-3" />
      <path d="M38 63l26-23" />
      <path d="M51 53l17 17" />
    </g>
  </>
);
// Wordmark: Plus Jakarta Sans ExtraBold, outlined. The i's dot (Sky) is the one kept item.
const WORDMARK =
  "M4.29 0V-59.05H15.99V-21.22L11.62 -22.62L30.42 -42.59H44.85L29.41 -25.43L44.77 0H31.51L18.64 -21.61L25.43 -23.32L12.4 -9.13L15.99 -15.91V0Z M62.56 0.94Q57.41 0.94 53.78 -1.29Q50.15 -3.51 48.28 -7.49Q46.41 -11.47 46.41 -16.77V-42.59H58.11V-17.71Q58.11 -15.29 59.08 -13.46Q60.06 -11.62 61.85 -10.61Q63.65 -9.59 65.91 -9.59Q68.25 -9.59 70 -10.61Q71.76 -11.62 72.73 -13.46Q73.71 -15.29 73.71 -17.71V-42.59H85.41V0H74.49V-8.42L75.11 -6.55Q73.63 -2.73 70.32 -0.9Q67 0.94 62.56 0.94Z M115.13 0.94Q110.76 0.94 107.05 -0.66Q103.35 -2.26 101.09 -5.38L102.18 -7.8V0H91.26V-59.05H102.96V-34.48L101.17 -36.82Q103.27 -40.01 106.9 -41.77Q110.53 -43.52 115.21 -43.52Q121.29 -43.52 126.2 -40.56Q131.12 -37.6 134 -32.56Q136.89 -27.53 136.89 -21.29Q136.89 -15.13 134.04 -10.06Q131.2 -4.99 126.28 -2.03Q121.37 0.94 115.13 0.94ZM113.72 -9.59Q117 -9.59 119.5 -11.08Q121.99 -12.56 123.4 -15.21Q124.8 -17.86 124.8 -21.29Q124.8 -24.73 123.4 -27.34Q121.99 -29.95 119.5 -31.47Q117 -32.99 113.72 -32.99Q110.6 -32.99 108.15 -31.51Q105.69 -30.03 104.32 -27.38Q102.96 -24.73 102.96 -21.29Q102.96 -17.86 104.32 -15.21Q105.69 -12.56 108.15 -11.08Q110.6 -9.59 113.72 -9.59Z M140.17 0V-42.59H151.87V0Z M156.86 0V-59.05H168.56V-21.22L164.19 -22.62L182.99 -42.59H197.42L181.97 -25.43L197.34 0H184.08L171.21 -21.61L178 -23.32L164.97 -9.13L168.56 -15.91V0Z M213.02 0.94Q208.42 0.94 205.06 -0.55Q201.71 -2.03 199.91 -4.8Q198.12 -7.57 198.12 -11.39Q198.12 -14.98 199.76 -17.74Q201.4 -20.51 204.79 -22.39Q208.18 -24.26 213.25 -25.04L226.28 -27.14V-18.56L215.36 -16.61Q212.86 -16.15 211.54 -15.02Q210.21 -13.88 210.21 -11.78Q210.21 -9.83 211.69 -8.74Q213.17 -7.64 215.36 -7.64Q218.24 -7.64 220.43 -8.89Q222.61 -10.14 223.82 -12.29Q225.03 -14.43 225.03 -17V-28.08Q225.03 -30.5 223.12 -32.14Q221.21 -33.77 217.93 -33.77Q214.81 -33.77 212.43 -32.06Q210.05 -30.34 208.96 -27.53L199.6 -31.98Q200.85 -35.57 203.58 -38.14Q206.31 -40.72 210.13 -42.12Q213.95 -43.52 218.48 -43.52Q223.86 -43.52 227.99 -41.57Q232.13 -39.62 234.43 -36.15Q236.73 -32.68 236.73 -28.08V0H225.81V-6.86L228.46 -7.33Q226.59 -4.52 224.33 -2.69Q222.07 -0.86 219.26 0.04Q216.45 0.94 213.02 0.94Z";

function a11y(title: string | null) {
  return {
    role: title ? "img" : undefined,
    "aria-label": title ?? undefined,
    "aria-hidden": title ? undefined : true,
  } as const;
}

/** The Kubika app icon: the k-tray on a blue tile. */
export function KubikaLogo({
  className,
  title = "Kubika",
}: {
  className?: string;
  title?: string | null;
}) {
  return (
    <svg viewBox="0 0 120 120" className={cn("shrink-0", className)} {...a11y(title)}>
      {MARK}
    </svg>
  );
}

/** Icon and wordmark. The letters take currentColor; the dot stays Sky. */
export function KubikaLockup({
  className,
  title = "Kubika",
}: {
  className?: string;
  title?: string | null;
}) {
  return (
    <svg viewBox="20 20 383 120" className={cn("shrink-0", className)} {...a11y(title)}>
      <g transform="translate(20 20)">{MARK}</g>
      <g transform="translate(166 112)">
        <path fill="currentColor" d={WORDMARK} />
        <circle cx="146.02" cy="-55.85" r="7.41" className="fill-[#0EA5E9] dark:fill-[#38BDF8]" />
      </g>
    </svg>
  );
}
