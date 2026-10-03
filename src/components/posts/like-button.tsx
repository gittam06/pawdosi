"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { toggleLikeAction } from "@/actions/social";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

type LikeState = { liked: boolean; count: number };

type LikeButtonProps = {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  /** Signed-out visitors are sent to sign-in instead of failing a write. */
  canInteract: boolean;
};

/**
 * Optimistic like.
 *
 * `useOptimistic` shows the new state immediately and automatically reverts it
 * when the transition ends unless the real state has caught up — so a failed
 * write un-does itself without any rollback code.
 */
export function LikeButton({
  postId,
  initialCount,
  initialLiked,
  canInteract,
}: LikeButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<LikeState>({
    liked: initialLiked,
    count: initialCount,
  });
  const [optimistic, applyOptimistic] = useOptimistic(
    state,
    (_current: LikeState, next: LikeState) => next,
  );
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (!canInteract) {
      router.push("/sign-in");
      return;
    }

    const next: LikeState = {
      liked: !optimistic.liked,
      count: optimistic.count + (optimistic.liked ? -1 : 1),
    };

    startTransition(async () => {
      applyOptimistic(next);

      const result = await toggleLikeAction(postId, next.liked);

      if (!result.ok) {
        toast.error(result.message ?? "That did not work.");
        return;
      }

      setState(next);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={optimistic.liked}
      aria-label={optimistic.liked ? "Unlike this post" : "Like this post"}
      className={cn(
        "gap-1.5 px-2",
        optimistic.liked && "text-alert hover:text-alert",
      )}
    >
      <Heart
        className={cn("size-4", optimistic.liked && "fill-current")}
        aria-hidden
      />
      <span className="tabular-nums">{optimistic.count}</span>
      <span className="sr-only">
        {optimistic.count === 1 ? "like" : "likes"}
      </span>
    </Button>
  );
}
