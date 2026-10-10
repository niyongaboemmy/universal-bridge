import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";
import { buttonVariants } from "./button-variants";

/**
 * Button for Client Components: same look as <Button>, without tailwind-merge
 * in the browser bundle. Don't pass classes that override the variant.
 */
export function ClientButton({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cx(buttonVariants({ variant, size }), className)} {...props} />;
}
