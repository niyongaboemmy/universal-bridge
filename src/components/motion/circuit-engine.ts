// Drawing code for CircuitField, loaded with import() only on capable desktops.
//
// Style (brand circuit, as CircuitArt): a few long traces that enter from the
// edge, make one 45° chamfer and end in a large hollow ring. Pulses flow along
// each trace into its ring; the pointer lights the traces near it.
//
// Performance (UI/UX audit v2 M-1): traces and rings are rasterised once into
// an offscreen layer; each frame copies it and draws only what is live. Frames
// are capped at 30 fps and DPR at 1.5; nothing is redrawn while at rest.
type Pt = [number, number];
type Trace = { pts: Pt[]; len: number; glow: number };
type Pulse = { trace: number; t: number; speed: number };
/** A ring flash where a pulse arrives at its node. */
type Flash = { trace: number; age: number };

const FRAME_MS = 1000 / 30;
const HALO = 220;
/** Proportions match CircuitArt at hero scale (CSS px). */
const LINE = 4;
const RING = 24;
const RING_STROKE = 5;

/** Start the living circuit on `canvas`; returns a cleanup function. */
export function startCircuit(canvas: HTMLCanvasElement): (() => void) | undefined {
  // One engine per canvas: stop any previous one (re-attach, hot reload) so two
  // engines never draw over each other with different traces.
  const host = canvas as HTMLCanvasElement & { __ubCircuitStop?: () => void };
  host.__ubCircuitStop?.();
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;
  const layer = document.createElement("canvas");
  const lctx = layer.getContext("2d");
  if (!lctx) return undefined;
  const css = getComputedStyle(canvas);
  const line = css.getPropertyValue("--circuit").trim() || "rgba(127,163,250,.28)";
  const spark = css.getPropertyValue("--accent-spark").trim() || "#FE760D";
  const blue = css.getPropertyValue("--accent-primary").trim() || "#7FA3FA";

  let w = 0;
  let h = 0;
  let traces: Trace[] = [];
  const pointer = { x: -9999, y: -9999, active: false };
  const pulses: Pulse[] = [];
  const flashes: Flash[] = [];
  const TRAIL = 140; // px of fading trail behind each pulse
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  const segLen = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const end = (tr: Trace) => tr.pts[tr.pts.length - 1]!;

  /** The point at distance d along the trace (follows every bend). */
  function at(tr: Trace, d: number): Pt {
    let left = Math.max(0, Math.min(tr.len, d));
    for (let i = 1; i < tr.pts.length; i++) {
      const a = tr.pts[i - 1]!;
      const b = tr.pts[i]!;
      const l = segLen(a, b);
      if (left <= l) {
        const k = l ? left / l : 0;
        return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
      }
      left -= l;
    }
    return end(tr);
  }

  function stroke(c: CanvasRenderingContext2D, pts: Pt[]) {
    c.moveTo(pts[0]![0], pts[0]![1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i]![0], pts[i]![1]);
  }

  function ring(c: CanvasRenderingContext2D, p: Pt, r: number, color: string, alpha: number) {
    c.beginPath();
    c.arc(p[0], p[1], r, 0, Math.PI * 2);
    c.globalAlpha = alpha;
    c.strokeStyle = color;
    c.stroke();
    c.globalAlpha = 1;
  }

  /** Clears the inside of each ring: traces stop at its edge, the centre stays transparent. */
  function punch(c: CanvasRenderingContext2D) {
    c.save();
    c.globalCompositeOperation = "destination-out";
    c.beginPath();
    for (const tr of traces) {
      const [x, y] = end(tr);
      const r = RING + tr.glow * 4 - RING_STROKE / 2;
      c.moveTo(x + r, y);
      c.arc(x, y, r, 0, Math.PI * 2);
    }
    c.fill();
    c.restore();
  }

  /** Distance from a point to a polyline. */
  function distance(px: number, py: number, pts: Pt[]) {
    let best = Infinity;
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1]!;
      const [bx, by] = pts[i]!;
      const l2 = (bx - ax) ** 2 + (by - ay) ** 2 || 1;
      const k = Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2));
      best = Math.min(best, Math.hypot(px - (ax + (bx - ax) * k), py - (ay + (by - ay) * k)));
    }
    return best;
  }

  function layout() {
    const r = canvas.getBoundingClientRect();
    w = r.width;
    h = r.height;
    for (const c of [canvas, layer]) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    lctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Seeded, so the field looks the same on every visit.
    let seed = 11;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const snap = (v: number) => Math.round(v / 40) * 40;
    const count = Math.max(6, Math.min(10, Math.round(w / 140)));
    traces = [];
    for (let tries = 0; tries < count * 80 && traces.length < count; tries++) {
      // Rings sit in the right ~55 %, clear of the headline.
      const ex = snap(w * (0.5 + rand() * 0.46));
      const ey = snap(h * (0.08 + rand() * 0.84));
      if (ex > w - RING * 2 || ey < RING * 2 || ey > h - RING * 2) continue;
      if (traces.some((t) => segLen(end(t), [ex, ey]) < RING * 5)) continue;
      const chamfer = 40 + snap(rand() * 80);
      const side = rand();
      let pts: Pt[];
      if (side < 0.4) {
        // From the right edge: run left, chamfer, run into the ring.
        const dir = rand() < 0.5 ? -1 : 1;
        const run = 40 + snap(rand() * 120);
        const y0 = ey - dir * chamfer;
        pts = [
          [w + 10, y0],
          [ex + run + chamfer, y0],
          [ex + run, ey],
        ];
      } else {
        // From the top or bottom edge: run vertically, chamfer, run into the ring.
        const fromTop = side < 0.7;
        const dir = rand() < 0.5 ? -1 : 1;
        const x0 = ex - dir * chamfer;
        const sign = fromTop ? 1 : -1;
        const turn = ey - sign * (chamfer + 40 + snap(rand() * 60));
        if (fromTop ? turn < 0 : turn > h) continue;
        pts = [
          [x0, fromTop ? -10 : h + 10],
          [x0, turn],
          [ex, turn + sign * chamfer],
        ];
      }
      pts.push([ex, ey]);
      // Keep it clean, like the static art: no trace crosses, hugs or runs
      // through another trace or ring.
      const clear = RING * 1.6;
      const sample = (ps: Pt[]) => {
        const out: Pt[] = [];
        for (let i = 1; i < ps.length; i++) {
          const n = Math.max(1, Math.ceil(segLen(ps[i - 1]!, ps[i]!) / 16));
          for (let k = 0; k <= n; k++) {
            const a = ps[i - 1]!;
            const b = ps[i]!;
            const p: Pt = [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n];
            if (p[0] >= 0 && p[0] <= w && p[1] >= 0 && p[1] <= h) out.push(p);
          }
        }
        return out;
      };
      const mine = sample(pts);
      const crowded = traces.some(
        (t) =>
          mine.some(([x, y]) => distance(x, y, t.pts) < clear) ||
          distance(end(t)[0], end(t)[1], pts) < RING * 2.5,
      );
      if (crowded) continue;
      let len = 0;
      for (let i = 1; i < pts.length; i++) len += segLen(pts[i - 1]!, pts[i]!);
      traces.push({ pts, len, glow: 0 });
    }

    // The static layer: drawn once per resize.
    lctx!.clearRect(0, 0, w, h);
    lctx!.lineWidth = LINE;
    lctx!.lineJoin = "round";
    lctx!.lineCap = "round";
    lctx!.strokeStyle = line;
    lctx!.beginPath();
    for (const tr of traces) stroke(lctx!, tr.pts);
    lctx!.stroke();
    punch(lctx!);
    lctx!.lineWidth = RING_STROKE;
    for (const tr of traces) ring(lctx!, end(tr), RING, line, 1);
    dirty = true;
  }

  let raf = 0;
  let visible = true;
  let dirty = true;
  let last = performance.now();
  let lastDraw = 0;
  let nextAmbient = 0;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    if (now - lastDraw < FRAME_MS) return;
    const dt = Math.min(100, now - last) / 1000;
    last = now;
    lastDraw = now;

    // Ambient pulses keep the field alive without a mouse.
    if (now > nextAmbient && pulses.length < 4 && traces.length) {
      pulses.push({ trace: Math.floor(Math.random() * traces.length), t: 0, speed: 0.35 });
      nextAmbient = now + 900 + Math.random() * 1200;
    }

    let live = pulses.length > 0 || flashes.length > 0 || pointer.active;
    for (const tr of traces) if (tr.glow > 0.01) live = true;
    if (!live && !dirty) return; // At rest: the last frame is still correct.
    dirty = false;

    ctx!.clearRect(0, 0, w, h);
    ctx!.drawImage(layer, 0, 0, w, h);
    ctx!.lineJoin = "round";
    ctx!.lineCap = "round";

    // 1. Lit traces near the pointer.
    traces.forEach((tr, i) => {
      const d = pointer.active ? distance(pointer.x, pointer.y, tr.pts) : Infinity;
      const target = d < HALO ? 1 - d / HALO : 0;
      tr.glow += (target - tr.glow) * Math.min(1, dt * 6);
      if (target > 0.6 && pulses.length < 10 && Math.random() < dt * 1.5)
        pulses.push({ trace: i, t: 0, speed: 0.8 });
      if (tr.glow <= 0.02) return;
      ctx!.lineWidth = LINE;
      ctx!.globalAlpha = tr.glow * 0.85;
      ctx!.strokeStyle = blue;
      ctx!.beginPath();
      stroke(ctx!, tr.pts);
      ctx!.stroke();
      ctx!.globalAlpha = 1;
    });

    // 2. Comets: the trail is sampled along the trace itself, so it bends with
    //    every chamfer, and fades from tail to head.
    const heads: Pt[] = [];
    for (let k = pulses.length - 1; k >= 0; k--) {
      const p = pulses[k]!;
      const tr = traces[p.trace];
      if (!tr) {
        pulses.splice(k, 1);
        continue;
      }
      // Travel to the ring's edge, not into its hollow centre.
      const reach = tr.len - RING;
      p.t += (dt * p.speed * 600) / reach;
      if (p.t >= 1) {
        pulses.splice(k, 1);
        flashes.push({ trace: p.trace, age: 0 });
        continue;
      }
      const head = p.t * reach;
      const tail = Math.max(0, head - TRAIL);
      const steps = Math.max(2, Math.ceil((head - tail) / 6));
      ctx!.lineWidth = LINE;
      ctx!.strokeStyle = spark;
      let prev = at(tr, tail);
      for (let i = 1; i <= steps; i++) {
        const next = at(tr, tail + ((head - tail) * i) / steps);
        ctx!.globalAlpha = 0.85 * (i / steps) ** 1.6;
        ctx!.beginPath();
        ctx!.moveTo(prev[0], prev[1]);
        ctx!.lineTo(next[0], next[1]);
        ctx!.stroke();
        prev = next;
      }
      ctx!.globalAlpha = 1;
      heads.push(prev);
    }

    // 3. Hollow ring centres.
    punch(ctx!);

    // 4. Pointer halo, lit rings and comet heads on top.
    if (pointer.active) {
      const g = ctx!.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, HALO);
      g.addColorStop(0, "rgba(74,123,235,0.18)");
      g.addColorStop(1, "rgba(74,123,235,0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(pointer.x - HALO, pointer.y - HALO, HALO * 2, HALO * 2);
    }
    ctx!.lineWidth = RING_STROKE;
    for (const tr of traces)
      if (tr.glow > 0.02) ring(ctx!, end(tr), RING + tr.glow * 4, blue, 0.6 + tr.glow * 0.4);
    // Arrival: the node's ring lights up in spark and a soft ring expands.
    for (let k = flashes.length - 1; k >= 0; k--) {
      const f = flashes[k]!;
      f.age += dt;
      const tr = traces[f.trace];
      if (!tr || f.age > 0.7) {
        flashes.splice(k, 1);
        continue;
      }
      const e = f.age / 0.7;
      ctx!.lineWidth = RING_STROKE;
      ring(ctx!, end(tr), RING, spark, 1 - e);
      ctx!.lineWidth = 2;
      ring(ctx!, end(tr), RING + 6 + e * 18, spark, 0.5 * (1 - e));
    }
    // Heads: a bright core with a soft glow.
    ctx!.fillStyle = spark;
    ctx!.shadowColor = spark;
    ctx!.shadowBlur = 14;
    for (const [x, y] of heads) {
      ctx!.beginPath();
      ctx!.arc(x, y, 4, 0, Math.PI * 2);
      ctx!.fill();
    }
    ctx!.shadowBlur = 0;
    ctx!.fillStyle = "#fff";
    for (const [x, y] of heads) {
      ctx!.beginPath();
      ctx!.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx!.fill();
    }
  }

  const resume = () => {
    cancelAnimationFrame(raf);
    last = performance.now();
    dirty = true;
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const io = new IntersectionObserver(([e]) => {
    visible = Boolean(e?.isIntersecting);
    resume();
  });
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.active =
      pointer.x > -HALO && pointer.y > -HALO && pointer.x < w + HALO && pointer.y < h + HALO;
  };
  const onLeave = () => {
    pointer.active = false;
  };
  const ro = new ResizeObserver(() => layout());

  layout();
  io.observe(canvas);
  ro.observe(canvas);
  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);
  document.addEventListener("visibilitychange", resume);
  canvas.dataset.active = "true";
  const stop = () => {
    if (host.__ubCircuitStop === stop) delete host.__ubCircuitStop;
    cancelAnimationFrame(raf);
    io.disconnect();
    ro.disconnect();
    window.removeEventListener("pointermove", onMove);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    document.removeEventListener("visibilitychange", resume);
  };
  host.__ubCircuitStop = stop;
  return stop;
}
