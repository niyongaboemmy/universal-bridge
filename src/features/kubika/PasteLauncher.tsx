"use client";

import { ArrowRight, ClipboardPaste, Link2 } from "lucide-react";
import { useId, useState, useSyncExternalStore } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { KUBIKA_URL, PLATFORM_TINT, PlatformGlyph, platformOf } from "./platforms";

export type PasteCopy = {
  label: string;
  placeholder: string;
  paste: string;
  submit: string;
  unsupported: string;
};

const noop = () => () => {};

/**
 * The hero's paste box: a post link opens straight in Kubika at its share
 * page (/share?url=…, the route the browser extension uses), in a new tab.
 * Empty, it just opens Kubika. The platform is shown as soon as it is known.
 */
export function PasteLauncher({ copy }: { copy: PasteCopy }) {
  const id = useId();
  const [link, setLink] = useState("");
  const [error, setError] = useState(false);
  const platform = link ? platformOf(link) : null;
  const canPaste = useSyncExternalStore(
    noop,
    () => !!navigator.clipboard?.readText,
    () => false,
  );

  function open(event: React.FormEvent) {
    event.preventDefault();
    const url = link.trim();
    if (url && !platformOf(url)) return setError(true);
    window.open(
      url ? `${KUBIKA_URL}/share?url=${encodeURIComponent(url)}` : KUBIKA_URL,
      "_blank",
      "noopener",
    );
  }

  async function paste() {
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (text) {
        setLink(text);
        setError(false);
      }
    } catch {
      // Clipboard refused: the field is still there to paste into.
    }
  }

  return (
    <form onSubmit={open} className="mt-8 max-w-xl" noValidate>
      <label htmlFor={id} className="sr-only">
        {copy.label}
      </label>
      <div
        className={cn(
          "kb-paste flex items-center gap-2 rounded-full border bg-surface p-1.5 pl-2 shadow-3 transition-[border-color,box-shadow] duration-200",
          error ? "border-danger" : "border-[color-mix(in_oklab,#2563eb_55%,var(--border-subtle))]",
        )}
      >
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full bg-sunken",
            platform ? PLATFORM_TINT[platform] : "text-fg-muted",
          )}
        >
          {platform ? (
            <PlatformGlyph key={platform} platform={platform} className="kb-pop size-[18px]" />
          ) : (
            <Link2 aria-hidden className="size-4" />
          )}
        </span>
        <input
          id={id}
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={link}
          onChange={(e) => {
            setLink(e.target.value);
            setError(false);
          }}
          placeholder={copy.placeholder}
          aria-invalid={error || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-w-0 flex-1 bg-transparent py-2 text-body-md text-fg outline-none placeholder:text-fg-muted"
        />
        {canPaste && !link && (
          <button
            type="button"
            onClick={paste}
            className="hidden shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-body-sm font-medium text-fg-secondary transition-colors hover:bg-sunken hover:text-fg sm:flex"
          >
            <ClipboardPaste aria-hidden className="size-4" /> {copy.paste}
          </button>
        )}
        <button
          type="submit"
          className={cn(buttonVariants({ size: "md" }), "vz-cta shrink-0 rounded-full")}
        >
          <span className="max-[420px]:sr-only">{copy.submit}</span>
          <ArrowRight aria-hidden />
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2.5 pl-4 text-body-sm text-danger">
          {copy.unsupported}
        </p>
      )}
    </form>
  );
}
