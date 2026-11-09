"use client";

import { useEffect, useState } from "react";
import { detectPlatform, type Detection } from "./platforms";

type UaData = {
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ architecture?: string; platform?: string }>;
};

/** The WebGL renderer names the GPU (Apple M1…, Intel…) where the browser allows it. */
function gpuName(): string | null {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    return gl && ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : null;
  } catch {
    return null;
  }
}

async function detect(): Promise<Detection> {
  const nav = navigator as Navigator & { userAgentData?: UaData };
  const ua = nav.userAgentData;
  let architecture: string | null = null;
  let uaPlatform = ua?.platform ?? null;
  try {
    const hints = await ua?.getHighEntropyValues?.(["architecture", "platform"]);
    architecture = hints?.architecture ?? null;
    uaPlatform = hints?.platform ?? uaPlatform;
  } catch {
    /* hints refused: fall back to the user agent string */
  }
  const base = {
    userAgent: nav.userAgent,
    uaPlatform,
    architecture,
    touchPoints: nav.maxTouchPoints,
  };
  const first = detectPlatform(base);
  // Only a Mac whose chip is still unknown needs the (slower) GPU check.
  return first.os === "mac" && !first.certain ? detectPlatform({ ...base, gpu: gpuName() }) : first;
}

let pending: Promise<Detection> | null = null;

/** This visitor's system, once known (null while detecting and during server render). */
export function useDetection(): Detection | null {
  const [found, setFound] = useState<Detection | null>(null);
  useEffect(() => {
    let live = true;
    pending ??= detect();
    void pending.then((d) => live && setFound(d));
    return () => {
      live = false;
    };
  }, []);
  return found;
}
