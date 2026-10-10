import { startGlobe } from "@/components/motion/globe-engine";
import type { Place } from "@/components/motion/Globe";
import { canUseRichEffects } from "@/lib/motion/can-use-rich-effects";

/** Kigali → World globe (UI/UX §10.5): live on WebGL2 and ≥ 768 px; otherwise the static frame stays. */
export function attach(wrap: HTMLElement) {
  const canvas = wrap.querySelector("canvas");
  if (!canvas || !canUseRichEffects({ minWidth: 768, webgl: true })) return;
  const places = JSON.parse(wrap.dataset.places ?? "[]") as Place[];
  try {
    return startGlobe(wrap, canvas, places, () => {
      wrap.dataset.active = "true";
    });
  } catch (error) {
    // e.g. a GPU that refuses the context: the pre-rendered globe stays.
    console.warn("[fx] globe unavailable, keeping the static frame", error);
    return undefined;
  }
}
