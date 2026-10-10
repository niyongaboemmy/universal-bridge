import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Media } from "@/components/ui/Media";
import type { Product } from "@/payload-types";

/** FR-PRD-01: product card with status badge. */
export function ProductCard({
  product,
  href,
  statusLabel,
  cta,
}: {
  product: Product;
  href: string;
  statusLabel: string;
  cta: string;
}) {
  const shot = product.screenshots?.[0];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-subtle bg-raised">
      <div className="relative aspect-[16/10] overflow-hidden bg-sunken">
        {shot ? (
          <Media
            media={shot}
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="absolute inset-0"
            imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <span className="font-display text-display-lg text-accent opacity-80">
              {product.name.slice(0, 1)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Badge
          tone={
            product.status === "live" ? "live" : product.status === "beta" ? "spark" : "neutral"
          }
          className="self-start"
        >
          {product.status === "live" && (
            <span aria-hidden className="size-1.5 rounded-full bg-success" />
          )}
          {statusLabel}
        </Badge>
        <h3 className="mt-3 font-display text-heading-md">
          <a href={href} className="after:absolute after:inset-0">
            {product.name}
          </a>
        </h3>
        <p className="mt-2 flex-1 text-fg-secondary">{product.tagline}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-body-sm font-semibold text-accent">
          {cta}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform group-hover:translate-x-1"
          />
        </span>
      </div>
    </article>
  );
}
