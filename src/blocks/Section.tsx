import { cn } from "@/lib/utils";

/** Standard page-builder section: spacing, optional Night mood, page container. */
export function Section({
  id,
  night,
  className,
  children,
}: {
  id?: string | null;
  night?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id ?? undefined} className={cn("section relative", night && "night", className)}>
      <div className="container-page">{children}</div>
    </section>
  );
}
