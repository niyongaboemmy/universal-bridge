"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Toast = { id: number; text: string; tone: "ok" | "error" };

/** Fire a toast from anywhere in the staff app. */
export function toast(text: string, tone: Toast["tone"] = "ok") {
  window.dispatchEvent(new CustomEvent("office:toast", { detail: { text, tone } }));
}

/** Bottom-right confirmations; announced to screen readers; auto-dismiss after 4 s. */
export function Toaster() {
  const [list, setList] = useState<Toast[]>([]);
  useEffect(() => {
    let n = 0;
    const onToast = (e: Event) => {
      const { text, tone } = (e as CustomEvent<Omit<Toast, "id">>).detail;
      const id = ++n;
      setList((l) => [...l.slice(-3), { id, text, tone }]);
      setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 4000);
    };
    window.addEventListener("office:toast", onToast);
    return () => window.removeEventListener("office:toast", onToast);
  }, []);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-[80] grid gap-2"
    >
      {list.map((t) => (
        <p
          key={t.id}
          role="status"
          className={cn(
            "office-page pointer-events-auto flex max-w-sm items-center gap-2 rounded-xl border border-subtle bg-surface px-4 py-2.5 text-[0.8125rem] shadow-3",
            t.tone === "error" && "border-[color-mix(in_oklab,var(--danger)_40%,transparent)]",
          )}
        >
          {t.tone === "ok" ? (
            <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
          ) : (
            <XCircle className="size-4 shrink-0 text-danger" aria-hidden />
          )}
          {t.text}
        </p>
      ))}
    </div>
  );
}
