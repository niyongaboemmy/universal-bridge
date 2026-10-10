"use client";

import { Camera, X } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";
import { buttonVariants } from "@/components/ui/button-variants";

type Detector = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> };
const supported = () =>
  typeof window !== "undefined" && "BarcodeDetector" in window && !!navigator.mediaDevices;

/**
 * FR-CERT-01 "scan the QR code": uses the browser's BarcodeDetector (Chrome,
 * Android). Hidden where unsupported — iOS users scan with the camera app,
 * which opens the same verify URL.
 */
export function QrScanner({
  copy,
}: {
  copy: { scan: string; scanning: string; stop: string; denied: string };
}) {
  const available = useSyncExternalStore(
    () => () => {},
    supported,
    () => false,
  );
  const video = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stream = useRef<MediaStream | null>(null);

  function stop() {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setActive(false);
  }

  async function start() {
    setError(null);
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setActive(true);
      requestAnimationFrame(async () => {
        if (!video.current || !stream.current) return;
        video.current.srcObject = stream.current;
        await video.current.play();
        const detector = new (
          window as unknown as { BarcodeDetector: new (o: object) => Detector }
        ).BarcodeDetector({ formats: ["qr_code"] });
        const tick = async () => {
          if (!stream.current || !video.current) return;
          const [hit] = await detector.detect(video.current).catch(() => []);
          if (hit?.rawValue && /\/academy\/verify\//.test(hit.rawValue)) {
            stop();
            window.location.assign(hit.rawValue);
            return;
          }
          setTimeout(tick, 250);
        };
        tick();
      });
    } catch {
      setError(copy.denied);
      stop();
    }
  }

  if (!available) return null;
  return (
    <div className="mt-4">
      {!active ? (
        <button type="button" onClick={start} className={buttonVariants({ variant: "secondary" })}>
          <Camera aria-hidden className="size-5" />
          {copy.scan}
        </button>
      ) : (
        <div className="space-y-3">
          <p role="status" className="text-body-sm text-fg-secondary">
            {copy.scanning}
          </p>
          <video
            ref={video}
            muted
            playsInline
            className="aspect-square w-full max-w-sm rounded-lg bg-black object-cover"
          />
          <button type="button" onClick={stop} className={buttonVariants({ variant: "ghost" })}>
            <X aria-hidden className="size-4" />
            {copy.stop}
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-body-sm text-danger">{error}</p>}
    </div>
  );
}
