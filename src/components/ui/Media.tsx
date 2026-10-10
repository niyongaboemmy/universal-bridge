import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { Media as MediaDoc } from "@/payload-types";
import { mediaSrc } from "@/lib/cms/media-src";
import { cn } from "@/lib/utils";

/**
 * CMS image via next/image (NFR-PERF-04). Decorative images get alt="";
 * concept renders always carry a visible "Concept" label (OI-06, UI/UX §14.4).
 */
export async function Media({
  media,
  sizes = "100vw",
  priority,
  className,
  style,
  imgClassName,
  conceptLabel,
  fill = true,
  conceptPosition = "left",
  editAttrs,
}: {
  media?: MediaDoc | number | null;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** e.g. a view-transition-name shared with the matching card or cover. */
  style?: React.CSSProperties;
  imgClassName?: string;
  conceptLabel?: string;
  fill?: boolean;
  /** Use "right" inside the diagonal bridge mask, which clips the top-left corner. */
  conceptPosition?: "left" | "right";
  /** Live editing: marks this image as replaceable (lib/live-edit). */
  editAttrs?: Record<string, string>;
}) {
  if (!media || typeof media === "number" || !media.url) return null;
  const label =
    conceptLabel ?? (media.isConcept ? (await getTranslations("common"))("concept") : "");
  const alt = media.decorative ? "" : media.alt;
  return (
    <div className={cn("relative overflow-hidden", className)} style={style} {...editAttrs}>
      {fill ? (
        <Image
          src={mediaSrc(media.url)}
          alt={alt}
          fill
          sizes={sizes}
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          className={cn("object-cover", imgClassName)}
          style={
            media.focalX != null
              ? { objectPosition: `${media.focalX}% ${media.focalY}%` }
              : undefined
          }
        />
      ) : (
        <Image
          src={mediaSrc(media.url)}
          alt={alt}
          width={media.width ?? 1200}
          height={media.height ?? 800}
          sizes={sizes}
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          className={imgClassName}
        />
      )}
      {media.isConcept && (
        <span
          className={cn(
            "absolute top-3 z-10 rounded-full",
            conceptPosition === "right" ? "right-3" : "left-3",
            " bg-black/75 px-2.5 py-1 text-[0.75rem] font-medium tracking-wide text-white",
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
}
