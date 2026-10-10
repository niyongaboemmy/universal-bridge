import { clsx, type ClassValue } from "clsx";

/**
 * Class joiner for Client Components. Unlike `cn` it doesn't run
 * tailwind-merge (~7 KB), which client components never need: they don't
 * override variant classes. Server components keep using `cn`.
 */
export const cx = (...inputs: ClassValue[]) => clsx(inputs);
