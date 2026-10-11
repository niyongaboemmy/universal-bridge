"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteOpening } from "@/features/office/admin-actions";
import { toast } from "./Toaster";

export function DeleteOpening({ id }: { id: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this opening? Its applications stay, without the link to it.")) return;
        start(async () => {
          const r = await deleteOpening(id);
          toast(r.ok ? (r.message ?? "Deleted") : r.error, r.ok ? undefined : "error");
          if (r.ok) router.push("/office/openings");
        });
      }}
      className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-body-sm font-medium text-danger hover:bg-[color-mix(in_oklab,var(--danger)_10%,transparent)]"
    >
      <Trash2 className="size-4" aria-hidden /> Delete
    </button>
  );
}
