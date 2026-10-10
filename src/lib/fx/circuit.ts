import { startCircuit } from "@/components/motion/circuit-engine";
import { canUseRichEffects } from "@/lib/motion/can-use-rich-effects";

/** Living circuit hero (UI/UX §10.2): capable desktops only. */
export function attach(canvas: HTMLElement) {
  if (!(canvas instanceof HTMLCanvasElement) || !canUseRichEffects({ minWidth: 1024 })) return;
  return startCircuit(canvas);
}
