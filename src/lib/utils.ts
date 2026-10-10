import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge our custom type scale and shadows, otherwise it
// mistakes `text-body-sm` for a colour and drops `text-on-accent`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display-2xl",
        "display-xl",
        "display-lg",
        "heading-lg",
        "heading-md",
        "body-lg",
        "body-md",
        "body-sm",
        "eyebrow",
      ],
      shadow: ["1", "2", "3", "4"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function siteUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return `${base}${path.startsWith("/") || path === "" ? path : `/${path}`}`;
}
