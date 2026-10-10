import type { Metadata } from "next";
import type { ReactNode } from "react";
import { InlineScript } from "../(frontend)/providers";
import { inter, jakarta } from "../(frontend)/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const themeScript = `try{var t=localStorage.getItem('theme')||'system';if(t==='system')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}`;

/** Stand-alone screens outside the website and the office (maintenance). */
export default function SystemLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable}`}>
      <head>
        <InlineScript code={themeScript} />
      </head>
      <body className="min-h-dvh bg-[var(--bg-canvas)] text-fg antialiased">{children}</body>
    </html>
  );
}
