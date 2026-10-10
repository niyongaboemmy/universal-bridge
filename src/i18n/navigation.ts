import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Server-side helpers only. For links use `@/i18n/link` (server) or pass a
// localised href string into client components.
export const { redirect, getPathname } = createNavigation(routing);
