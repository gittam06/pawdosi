"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { toggleFollowAction } from "@/actions/social";
import { Button } from "@/components/ui/button";

type FollowState = { following: boolean; followers: number };

type FollowButtonProps = {
  petId: string;
  petName: string;
  initialFollowing: boolean;
  initialFollowers: number;
  canInteract: boolean;
};

export function FollowButton({
  petId,
  petName,
  initialFollowing,
  initialFollowers,
  canInteract,
}: FollowButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<FollowState>({
    following: initialFollowing,
    followers: initialFollowers,
  });
  const [optimistic, applyOptimistic] = useOptimistic(
    state,
    (_current: FollowState, next: FollowState) => next,
  );
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (!canInteract) {
      router.push("/sign-in");
      return;
    }

    const next: FollowState = {
      following: !optimistic.following,
      followers: optimistic.followers + (optimistic.following ? -1 : 1),
    };

    startTransition(async () => {
      applyOptimistic(next);

      const result = await toggleFollowAction(petId, next.following);

      if (!result.ok) {
        toast.error(result.message ?? "That did not work.");
        return;
      }

      setState(next);
      // The count elsewhere on the page comes from the server render.
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant={optimistic.following ? "outline" : "default"}
      size="lg"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={optimistic.following}
    >
      {optimistic.following ? (
        <>
          <Check aria-hidden />
          Following
        </>
      ) : (
        <>
          <UserPlus aria-hidden />
          Follow
        </>
      )}
      <span className="sr-only">
        {optimistic.following ? `Unfollow ${petName}` : `Follow ${petName}`}
      </span>
    </Button>
  );
}
