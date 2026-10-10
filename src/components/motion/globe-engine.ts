// Drawing code for Globe, loaded with import() only on capable devices.
import createGlobe, { type Marker } from "cobe";
import type { Place } from "./Globe";

const KIGALI: [number, number] = [-1.9441, 30.0619];
const SPARK: [number, number, number] = [0.996, 0.463, 0.051];

/** cobe's phi that puts a longitude in the middle of the globe. */
const phiFor = (lng: number) => Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2);

/**
 * UI/UX audit v2 M-2: the "Built in Kigali" globe stays on Kigali. It swings
 * gently (±50°) around Africa instead of spinning, the Kigali marker pulses in
 * spark orange, hovering pauses the swing, and it can be dragged — it springs
 * back to Kigali when let go. Returns a cleanup function.
 */
export function startGlobe(
  wrap: HTMLElement,
  canvas: HTMLCanvasElement,
  places: Place[],
  onReady: () => void,
) {
  // One globe per canvas: stop any previous instance (re-attach, hot reload).
  const host = canvas as HTMLCanvasElement & { __ubGlobeStop?: () => void };
  host.__ubGlobeStop?.();
  const centre = phiFor(KIGALI[1]);
  const markets: Marker[] = places.map((p) => ({ location: [p.lat, p.lng], size: 0.045 }));
  let globe: ReturnType<typeof createGlobe> | undefined;
  let raf = 0;
  let t = 0;
  let swing = 1; // eases to 0 while hovered
  let hovered = false;
  let drag = 0; // radians added by dragging
  let dragFrom: number | null = null;
  let last = performance.now();

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    swing += ((hovered || dragFrom !== null ? 0 : 1) - swing) * Math.min(1, dt * 3);
    t += dt * swing;
    if (dragFrom === null) drag *= 1 - Math.min(1, dt * 2.5); // spring back to Kigali
    const pulse = 0.07 + 0.025 * Math.sin(now / 320);
    globe?.update({
      phi: centre + Math.sin(t * 0.22) * 0.87 + drag,
      markers: [{ location: KIGALI, size: pulse, color: SPARK }, ...markets],
    });
    raf = requestAnimationFrame(frame);
  };

  // Paper-light globe in the light theme, deep navy in the dark theme; rebuilt
  // when the theme changes.
  const palette = () =>
    document.documentElement.dataset.theme === "dark"
      ? {
          dark: 1,
          diffuse: 1.4,
          mapBrightness: 6,
          baseColor: [0.14, 0.23, 0.48],
          glowColor: [0.1, 0.22, 0.55],
        }
      : {
          dark: 0,
          diffuse: 1.3,
          mapBrightness: 6,
          baseColor: [0.82, 0.88, 1],
          glowColor: [0.9, 0.93, 1],
        };

  let visible = false;
  const create = () => {
    globe?.destroy();
    const size = canvas.offsetWidth;
    globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: size * 2,
      height: size * 2,
      phi: centre,
      theta: 0.18,
      mapSamples: 14000,
      markerColor: SPARK,
      markers: [{ location: KIGALI, size: 0.08, color: SPARK }, ...markets],
      arcs: places.map((p) => ({ from: KIGALI, to: [p.lat, p.lng] as [number, number] })),
      arcColor: [1, 0.62, 0.3],
      arcWidth: 0.9,
      arcHeight: 0.32,
      markerElevation: 0.02,
      ...(palette() as {
        dark: number;
        diffuse: number;
        mapBrightness: number;
        baseColor: [number, number, number];
        glowColor: [number, number, number];
      }),
    });
  };

  const io = new IntersectionObserver(
    ([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible && !globe) {
        create();
        onReady();
      }
      cancelAnimationFrame(raf);
      if (visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    },
    { rootMargin: "200px" },
  );
  const themeWatch = new MutationObserver(() => {
    if (globe) create();
  });
  themeWatch.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const onEnter = () => (hovered = true);
  const onLeave = () => {
    hovered = false;
    dragFrom = null;
  };
  const onDown = (e: PointerEvent) => {
    dragFrom = e.clientX - drag * 200;
    canvas.setPointerCapture?.(e.pointerId);
    canvas.style.cursor = "grabbing";
  };
  const onMove = (e: PointerEvent) => {
    if (dragFrom !== null) drag = (e.clientX - dragFrom) / 200;
  };
  const onUp = () => {
    dragFrom = null;
    canvas.style.cursor = "";
  };

  io.observe(wrap);
  wrap.addEventListener("pointerenter", onEnter);
  wrap.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  const stop = () => {
    if (host.__ubGlobeStop === stop) delete host.__ubGlobeStop;
    io.disconnect();
    themeWatch.disconnect();
    cancelAnimationFrame(raf);
    wrap.removeEventListener("pointerenter", onEnter);
    wrap.removeEventListener("pointerleave", onLeave);
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    globe?.destroy();
  };
  host.__ubGlobeStop = stop;
  return stop;
}
