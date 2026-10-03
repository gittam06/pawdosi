"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type LoadMoreTriggerProps = {
  hasMore: boolean;
  isPending: boolean;
  onLoadMore: () => void;
  label?: string;
};

/**
 * Infinite scroll with the button left in place.
 *
 * The observer fires before the sentinel is on screen (`rootMargin`), so the
 * next page is usually there by the time the reader reaches it. The button is
 * not a fallback nicety — it is the only way to page without JavaScript, and
 * the only operable one for someone navigating by keyboard.
 */
export function LoadMoreTrigger({
  hasMore,
  isPending,
  onLoadMore,
  label = "Load more",
}: LoadMoreTriggerProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Kept in a ref so a new callback identity does not tear down and rebuild
  // the observer on every render. Assigned in an effect, never during render.
  const loadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isPending) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMoreRef.current();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, isPending]);

  if (!hasMore) return null;

  return (
    <div className="flex flex-col items-center gap-2 pt-2">
      <div ref={sentinelRef} aria-hidden className="h-px w-full" />
      <Button
        variant="outline"
        size="lg"
        onClick={onLoadMore}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            Loading…
          </>
        ) : (
          label
        )}
      </Button>
      <span className="sr-only" role="status">
        {isPending ? "Loading more" : ""}
      </span>
    </div>
  );
}
