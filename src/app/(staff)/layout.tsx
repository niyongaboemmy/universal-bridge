import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { InlineScript } from "../(frontend)/providers";
import { inter, jakarta, jetbrains } from "../(frontend)/fonts";
import { navProgressScript } from "@/lib/ui/nav-progress";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Staff · Universal Bridge",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
    { media: "(prefers-color-scheme: dark)", color: "#060d20" },
  ],
};

// Light / dark / system, applied before paint. Same storage key as the website
// (next-themes "theme"), so a staff member's choice follows them everywhere.
const themeScript = `try{var t=localStorage.getItem('theme')||'system';if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}`;

/** Staff-only screens outside the Payload admin (Company dashboard, two-step verification). */
export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: the theme script and browser extensions (e.g. Scribe) set
    // attributes on <html> before React loads; this only affects <html>'s own attributes.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable}`}
    >
      <head>
        <InlineScript code={themeScript} />
        <InlineScript code={navProgressScript} />
      </head>
      <body className="office-ui min-h-dvh bg-[var(--bg-canvas)] text-fg antialiased">
        {children}
      </body>
    </html>
  );
}
