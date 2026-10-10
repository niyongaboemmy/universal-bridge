"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

// next-themes sets the theme with an inline script before paint. It must run when the
// server-rendered HTML loads; when React later renders it in the browser (e.g. the
// 404 boundary in development) it has already done its job, so there it becomes an
// inert data block instead of a <script> React would warn about.
const themeScriptProps = {
  type: typeof window === "undefined" ? "text/javascript" : "application/json",
  suppressHydrationWarning: true,
} as const;

/**
 * An inline script that runs before paint from the server-rendered HTML. When React
 * renders it in the browser (e.g. the 404 boundary in development) it has already
 * run, so it is emitted as an inert data block instead of a <script> React warns about.
 */
export function InlineScript({ code }: { code: string }) {
  return <script {...themeScriptProps} dangerouslySetInnerHTML={{ __html: code }} />;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={themeScriptProps}
    >
      {children}
    </ThemeProvider>
  );
}
