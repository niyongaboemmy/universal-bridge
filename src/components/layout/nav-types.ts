import type { ReactNode } from "react";

/** Navigation data resolved on the server: hrefs already localised, icons pre-rendered. */
export type NavChild = {
  label: string;
  href: string;
  description?: string | null;
  icon?: ReactNode;
};
export type NavItem = {
  label: string;
  href: string;
  children?: NavChild[];
  feature?: {
    eyebrow?: string | null;
    title?: string | null;
    body?: string | null;
    href?: string | null;
    cta?: string | null;
  } | null;
};
