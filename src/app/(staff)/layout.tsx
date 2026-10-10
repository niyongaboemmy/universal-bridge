import type { Metadata } from "next";
import type { ReactNode } from "react";
import { inter, jakarta, jetbrains } from "../(frontend)/fonts";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Staff sign-in · Universal Bridge",
  robots: { index: false, follow: false },
};

/** Staff-only screens outside the Payload admin (two-step verification). English, like the admin. */
export default function StaffLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh bg-[var(--bg-canvas)] font-sans text-fg antialiased">
        {children}
      </body>
    </html>
  );
}
