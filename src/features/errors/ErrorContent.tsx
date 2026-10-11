"use client";

import { RotateCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/button-variants";

// FR-GL-09: branded 500 content. Loaded only when an error happens (see app/[locale]/error.tsx).
const COPY = {
  en: {
    title: "Something went wrong on our side.",
    body: "The page couldn't load. Try again, or come back in a few minutes.",
    retry: "Try again",
    home: "Go to the home page",
    contact: "Contact us",
    ref: "Reference",
  },
  fr: {
    title: "Un problème est survenu de notre côté.",
    body: "La page n'a pas pu se charger. Réessayez, ou revenez dans quelques minutes.",
    retry: "Réessayer",
    home: "Aller à l'accueil",
    contact: "Nous contacter",
    ref: "Référence",
  },
  rw: {
    title: "Habaye ikibazo ku ruhande rwacu.",
    body: "Iyi paji ntiyashoboye gufunguka. Ongera ugerageze, cyangwa ugaruke nyuma y'iminota mike.",
    retry: "Ongera ugerageze",
    home: "Jya ku ipaji y'ibanze",
    contact: "Twandikire",
    ref: "Indangamuntu",
  },
} as const;

export default function ErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === "fr" || params?.locale === "rw" ? params.locale : "en";
  const t = COPY[locale];
  const prefix = locale === "en" ? "" : `/${locale}`;
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="section">
      <div className="container-reading text-center">
        <p className="eyebrow">500</p>
        <h1 className="mt-4 text-display-lg">{t.title}</h1>
        <p className="mt-4 text-body-lg text-fg-secondary">{t.body}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className={buttonVariants({ size: "lg" })}>
            <RotateCcw aria-hidden className="size-4" />
            {t.retry}
          </button>
          <a href={prefix || "/"} className={buttonVariants({ variant: "secondary", size: "lg" })}>
            {t.home}
          </a>
          <a
            href={`${prefix}/contact`}
            className={buttonVariants({ variant: "ghost", size: "lg" })}
          >
            {t.contact}
          </a>
        </div>
        {error.digest && (
          <p className="mt-8 font-mono text-body-sm text-fg-muted">
            {t.ref}: {error.digest}
          </p>
        )}
      </div>
    </section>
  );
}
