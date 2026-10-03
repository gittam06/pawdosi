"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Root error boundary. Shows a recoverable message instead of a blank page and
 * logs the digest so the failure can be matched against server logs.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <span
        className="flex size-14 items-center justify-center rounded-2xl bg-alert-muted text-alert-muted-foreground"
        aria-hidden
      >
        <TriangleAlert className="size-7" />
      </span>
      <h1 className="font-heading text-2xl font-bold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        We could not load this page. Try again — if it keeps happening, the
        problem is on our side.
      </p>
      {error.digest ? (
        <p className="font-mono text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      ) : null}
      <Button onClick={reset} className="mt-2">
        Try again
      </Button>
    </div>
  );
}
