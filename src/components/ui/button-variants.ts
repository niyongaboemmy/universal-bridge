import { cva } from "class-variance-authority";

// UI/UX §11/§13: pill-shaped, lift on hover, press scales 0.97, arrow icon slides
// 4 px. 44 px min height (md).
// Long labels wrap on phones instead of overflowing the screen.
// One primary-action colour site-wide (UI/UX audit P1-4): every primary button is
// the orange "spark"; blue is for links, focus, selection and secondary actions.
const primaryAction =
  "bg-spark text-on-spark shadow-1 hover:-translate-y-px hover:bg-spark-hover hover:shadow-2";
export const buttonVariants = cva(
  [
    "group/button relative inline-flex max-w-full shrink-0 items-center justify-center gap-2 text-center font-medium select-none sm:whitespace-nowrap",
    "rounded-full transition-[background-color,color,box-shadow,transform] duration-[var(--dur-fast)] ease-standard",
    "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-[1.1em] [&_svg]:shrink-0 [&_[data-arrow]]:transition-transform [&_[data-arrow]]:duration-[var(--dur-fast)] hover:[&_[data-arrow]]:translate-x-1",
  ],
  {
    variants: {
      variant: {
        primary: primaryAction,
        spark: primaryAction,
        secondary:
          "border border-strong bg-surface text-fg hover:-translate-y-px hover:border-accent hover:text-accent",
        ghost: "text-fg hover:bg-accent-soft hover:text-accent",
        link: "h-auto rounded-none px-0 text-accent underline-offset-4 hover:underline",
        destructive: "bg-danger text-white hover:opacity-90",
      },
      size: {
        sm: "min-h-9 px-3.5 py-1.5 text-body-sm",
        md: "min-h-11 px-5 py-2 text-[0.9375rem]",
        lg: "min-h-13 px-7 py-3 text-base",
        icon: "size-11",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);
