"use client";

import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { btn } from "./ui";
import { toast } from "./Toaster";

export function MarkAllRead() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      className={btn}
      onClick={() =>
        start(async () => {
          await fetch("/api/office/notifications", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ all: true }),
          });
          toast("All marked as read");
          router.refresh();
        })
      }
    >
      <CheckCheck className="size-4" aria-hidden /> Mark all read
    </button>
  );
}
