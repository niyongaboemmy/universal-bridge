"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import { SocialIcon } from "@/components/layout/SocialIcon";

/** Share links (FR-BLOG-02): plain URLs, no third-party scripts. */
export function ShareLinks({
  url,
  title,
  copy,
}: {
  url: string;
  title: string;
  copy: { share: string; copyLink: string };
}) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    {
      network: "linkedin",
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    },
    {
      network: "x",
      name: "X",
      href: `https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}`,
    },
    {
      network: "facebook",
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
  ];
  return (
    <div>
      <p className="eyebrow">{copy.share}</p>
      <ul className="mt-3 flex gap-1">
        {links.map((l) => (
          <li key={l.network}>
            <a
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${copy.share}: ${l.name}`}
              className="inline-flex size-11 items-center justify-center rounded-md border border-subtle hover:border-accent hover:text-accent"
            >
              <SocialIcon network={l.network} />
            </a>
          </li>
        ))}
        <li>
          <button
            type="button"
            aria-label={copy.copyLink}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              } catch {}
            }}
            className="inline-flex size-11 items-center justify-center rounded-md border border-subtle hover:border-accent hover:text-accent"
          >
            {copied ? (
              <Check aria-hidden className="size-5 text-success" />
            ) : (
              <Link2 aria-hidden className="size-5" />
            )}
          </button>
        </li>
      </ul>
    </div>
  );
}
