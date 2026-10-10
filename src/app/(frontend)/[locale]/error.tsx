"use client";

import { lazy, Suspense } from "react";

// FR-GL-09: the error boundary ships on every page, so it is only a shell; the
// branded 500 content (three languages) loads when an error actually happens.
const ErrorContent = lazy(() => import("@/features/errors/ErrorContent"));

export default function ErrorPage(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Suspense fallback={<div className="section min-h-[50vh]" />}>
      <ErrorContent {...props} />
    </Suspense>
  );
}
