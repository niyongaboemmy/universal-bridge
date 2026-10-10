import "server-only";
import { settings } from "@/lib/settings";
import { cached } from "./cached";

/** The few system settings public pages need, cached until the settings are saved. */
export const getPublicSystem = cached(
  async () => {
    const s = await settings();
    return {
      plausibleDomain: s.plausibleDomain ?? null,
      calLink: s.calLink ?? null,
      pressEmail: s.inbox.press ?? null,
      noindex: s.noindex,
      registrationOpen: s.registrationOpen,
    };
  },
  ["system-public"],
  () => ["global:system-settings"],
);
