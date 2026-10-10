"use client";

import { Printer } from "lucide-react";
import { ClientButton } from "@/components/ui/ClientButton";

export function PrintButton({ label }: { label: string }) {
  return (
    <ClientButton type="button" variant="secondary" onClick={() => window.print()}>
      <Printer aria-hidden />
      {label}
    </ClientButton>
  );
}
