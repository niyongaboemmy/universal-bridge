"use client";

import {
  ArrowDown,
  ArrowRight,
  Check,
  Copy,
  Download,
  Info,
  Laptop,
  Monitor,
  Terminal,
} from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import type { OsFamily, PlatformId } from "./platforms";
import { useDetection } from "./use-detection";

export type DownloadCopy = {
  detecting: string;
  choose: string;
  recommended: string;
  others: string;
  macIntel: string;
  macArm: string;
  macUnsure: string;
  linuxDeb: string;
  mobileTitle: string;
  mobileBody: string;
  copyLink: string;
  copied: string;
  unavailableTitle: string;
  unavailableBody: string;
  contact: string;
  started: string;
  os: Record<OsFamily, string>;
  button: Record<OsFamily, string>;
  platform: Record<PlatformId, string>;
  /** "Version 0.3.2 · 139 MB", per installer that exists. */
  details: Partial<Record<PlatformId, string>>;
  notice: Record<"unavailable" | "busy" | "unknown", string>;
};

const OS_ICON = { mac: Laptop, windows: Monitor, linux: Terminal } as const;
const OS_ORDER: OsFamily[] = ["mac", "windows", "linux"];

const noSubscribe = () => () => {};
/** ?download=… set by /api/vizulla/download when it had to send the visitor back. */
function readNotice(): keyof DownloadCopy["notice"] | null {
  const reason = new URLSearchParams(window.location.search).get("download");
  return reason === "unavailable" || reason === "busy" || reason === "unknown" ? reason : null;
}

/** Lets the install guide follow the system picked here. */
export const OS_EVENT = "vizulla:os";

/**
 * The hero's download area: detects the visitor's system, recommends one
 * installer and keeps the others one click away. Links go through
 * /api/vizulla/download, which hands out a fresh signed link per click.
 */
export function DownloadPanel({
  locale,
  available,
  contactHref,
  copy,
}: {
  locale: string;
  available: PlatformId[];
  contactHref: string;
  copy: DownloadCopy;
}) {
  const detected = useDetection();
  const [picked, setPicked] = useState<OsFamily | null>(null);
  const [started, setStarted] = useState(false);
  const notice = useSyncExternalStore(noSubscribe, readNotice, () => null);
  const [copied, setCopied] = useState(false);

  const detectedOs = detected?.os && detected.os !== "mobile" ? detected.os : null;
  // Phones and unknown systems get no default: the visitor picks one.
  const os = picked ?? detectedOs;
  const has = (p: PlatformId) => available.includes(p);
  const href = (p: PlatformId) => `/api/vizulla/download/${p}?locale=${locale}`;

  const choose = (next: OsFamily) => {
    setPicked(next);
    setStarted(false);
    window.dispatchEvent(new CustomEvent(OS_EVENT, { detail: next }));
  };
  useEffect(() => {
    if (detectedOs) window.dispatchEvent(new CustomEvent(OS_EVENT, { detail: detectedOs }));
  }, [detectedOs]);

  if (!available.length) {
    return (
      <div className="mt-8 max-w-xl rounded-2xl border border-subtle bg-surface p-6">
        <p className="font-display text-heading-md">{copy.unavailableTitle}</p>
        <p className="mt-2 text-body-sm text-fg-secondary">{copy.unavailableBody}</p>
        <a href={contactHref} className={cn(buttonVariants({ variant: "secondary" }), "mt-5")}>
          {copy.contact} <ArrowRight data-arrow aria-hidden />
        </a>
      </div>
    );
  }

  // macOS: the chip decides; on an unknown chip Apple silicon is the safer bet.
  const main: PlatformId | null =
    os === "mac"
      ? detected?.platform === "mac-x64" && !picked
        ? "mac-x64"
        : "mac-arm64"
      : os === "windows"
        ? "win-x64"
        : os === "linux"
          ? "linux-appimage"
          : null;
  const alt: { platform: PlatformId; label: string } | null =
    main === "mac-arm64"
      ? { platform: "mac-x64", label: copy.macIntel }
      : main === "mac-x64"
        ? { platform: "mac-arm64", label: copy.macArm }
        : main === "linux-appimage"
          ? { platform: "linux-deb", label: copy.linuxDeb }
          : null;

  return (
    <div className="mt-8 max-w-xl">
      {notice && (
        <p
          role="status"
          className="mb-5 flex items-start gap-2 rounded-xl border border-subtle bg-surface px-4 py-3 text-body-sm"
        >
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
          {copy.notice[notice]}
        </p>
      )}

      {detected?.os === "mobile" && (
        <div className="mb-5 rounded-2xl border border-subtle bg-surface p-5">
          <p className="font-semibold text-fg">{copy.mobileTitle}</p>
          <p className="mt-1 text-body-sm text-fg-secondary">{copy.mobileBody}</p>
          <button
            type="button"
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-4")}
            onClick={() =>
              void navigator.clipboard?.writeText(window.location.href).then(() => setCopied(true))
            }
          >
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            <span aria-live="polite">{copied ? copy.copied : copy.copyLink}</span>
          </button>
        </div>
      )}

      <div
        role="radiogroup"
        aria-label={copy.choose}
        className="inline-flex rounded-full border border-subtle bg-[color-mix(in_oklab,var(--bg-surface)_70%,transparent)] p-1"
      >
        {OS_ORDER.map((o) => {
          const Icon = OS_ICON[o];
          const on = o === os;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => choose(o)}
              className={cn(
                "inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-body-sm font-medium transition-[background-color,color] duration-[var(--dur-fast)]",
                on ? "bg-accent text-on-accent" : "text-fg-secondary hover:text-fg",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {copy.os[o]}
            </button>
          );
        })}
      </div>

      <div className="mt-5 min-h-[7.5rem]">
        {!main && detected ? (
          <p className="flex min-h-13 items-center text-fg-secondary">{copy.choose}</p>
        ) : !main ? (
          <p className="flex min-h-13 items-center gap-3 text-fg-secondary" aria-live="polite">
            <span
              className="size-4 animate-spin rounded-full border-2 border-accent border-r-transparent"
              aria-hidden
            />
            {copy.detecting}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              {has(main) ? (
                <a
                  href={href(main)}
                  className={cn(buttonVariants({ size: "lg" }), "vz-cta")}
                  onClick={() => setStarted(true)}
                  data-platform={main}
                >
                  <Download aria-hidden />
                  {copy.button[os!]}
                </a>
              ) : (
                <a
                  href="#downloads"
                  className={buttonVariants({ size: "lg", variant: "secondary" })}
                >
                  {copy.others} <ArrowDown aria-hidden />
                </a>
              )}
              {os === detectedOs && !picked && (
                <span className="inline-flex items-center gap-1.5 text-body-sm font-medium text-fg-secondary">
                  <Check aria-hidden className="size-4 text-success" />
                  {copy.recommended}
                </span>
              )}
            </div>
            <p className="mt-3 text-body-sm text-fg-secondary">
              {copy.platform[main]}
              {copy.details[main] && <> · {copy.details[main]}</>}
            </p>
            {main === "mac-arm64" && detected?.os === "mac" && !detected.certain && !picked && (
              <p className="mt-1 text-body-sm text-fg-muted">{copy.macUnsure}</p>
            )}
            {alt && has(alt.platform) && (
              <a
                href={href(alt.platform)}
                onClick={() => setStarted(true)}
                className="mt-2 inline-flex items-center gap-1.5 text-body-sm font-medium text-accent underline-offset-4 hover:underline"
              >
                {alt.label} <ArrowRight aria-hidden className="size-3.5" />
              </a>
            )}
          </>
        )}
      </div>

      {started ? (
        <p role="status" className="mt-2 flex items-start gap-2 text-body-sm text-fg">
          <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
          <a href="#install" className="underline-offset-4 hover:underline">
            {copy.started}
          </a>
        </p>
      ) : (
        <a
          href="#downloads"
          className="mt-2 inline-flex items-center gap-1.5 text-body-sm text-fg-secondary underline-offset-4 hover:text-fg hover:underline"
        >
          {copy.others} <ArrowDown aria-hidden className="size-3.5" />
        </a>
      )}
    </div>
  );
}
