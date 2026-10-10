import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-sunken text-fg-secondary border-subtle",
  accent: "bg-accent-soft text-accent border-transparent",
  live: "bg-[color-mix(in_oklch,var(--success)_12%,transparent)] text-fg border-transparent",
  spark: "bg-[color-mix(in_oklch,var(--accent-spark)_14%,transparent)] text-fg border-transparent",
} as const;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.8125rem] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
