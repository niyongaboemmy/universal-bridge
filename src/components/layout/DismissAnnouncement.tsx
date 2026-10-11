"use client";

import { X } from "lucide-react";

export function DismissAnnouncement({ storageKey, label }: { storageKey: string; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="absolute right-2 inline-flex size-9 items-center justify-center rounded-md hover:bg-white/15"
      onClick={() => {
        try {
          localStorage.setItem(storageKey, "1");
        } catch {}
        document.documentElement.dataset.annDismissed = "1";
        document.documentElement.style.setProperty("--announcement-h", "0px");
      }}
    >
      <X aria-hidden className="size-4" />
    </button>
  );
}
