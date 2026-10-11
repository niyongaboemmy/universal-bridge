"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Browser-only values read without setState-in-effect. The server snapshot is
 * null, so the first client render matches the static HTML and no hydration
 * mismatch occurs.
 */

// A clock that ticks every `intervalMs`; snapshot cached per tick.
const clocks = new Map<
  number,
  { now: number; listeners: Set<() => void>; id?: ReturnType<typeof setInterval> }
>();

/**
 * The shared clock for an interval, created on first use. getSnapshot must return the
 * same value until the clock ticks: returning Date.now() before subscribing made React
 * see a "changed" snapshot on every read and re-render forever on slower devices
 * (React error #185 on the contact page).
 */
function clockFor(intervalMs: number) {
  let clock = clocks.get(intervalMs);
  if (!clock) clocks.set(intervalMs, (clock = { now: Date.now(), listeners: new Set() }));
  return clock;
}

export function useNow(intervalMs = 30_000): Date | null {
  const ms = useSyncExternalStore(
    (notify) => {
      const clock = clockFor(intervalMs);
      clock.listeners.add(notify);
      clock.id ??= setInterval(() => {
        clock.now = Date.now();
        clock.listeners.forEach((l) => l());
      }, intervalMs);
      return () => {
        clock.listeners.delete(notify);
        if (!clock.listeners.size) {
          clearInterval(clock.id);
          clocks.delete(intervalMs);
        }
      };
    },
    () => clockFor(intervalMs).now,
    () => null,
  );
  return ms === null ? null : new Date(ms);
}

const noop = () => () => {};

/** The visitor's IANA time zone (e.g. "Europe/Berlin"), null during SSR. */
export function useTimeZone(): string | null {
  return useSyncExternalStore(
    noop,
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    () => null,
  );
}

/** A localStorage key as an external store; writes notify all subscribers. */
const storageListeners = new Map<string, Set<() => void>>();

export function useLocalStorage(key: string): [string | null | undefined, (value: string) => void] {
  const value = useSyncExternalStore(
    (notify) => {
      const set = storageListeners.get(key) ?? new Set();
      set.add(notify);
      storageListeners.set(key, set);
      const onStorage = (e: StorageEvent) => e.key === key && notify();
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(notify);
        window.removeEventListener("storage", onStorage);
      };
    },
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => undefined, // undefined = "not known yet" (server / before hydration)
  );
  // Stable identity: effects that depend on `write` must not re-run every render.
  const write = useCallback(
    (next: string) => {
      try {
        if (next) localStorage.setItem(key, next);
        else localStorage.removeItem(key);
      } catch {}
      storageListeners.get(key)?.forEach((l) => l());
    },
    [key],
  );
  return [value, write];
}
