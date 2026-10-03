"use client";

import { useActionState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteCommentAction } from "@/actions/social";
import { SubmitButton } from "@/components/forms/submit-button";
import { idleState } from "@/lib/action-state";

/**
 * No confirmation dialog: a comment is cheap to retype, and a modal for every
 * one-line delete is friction without protection.
 */
export function DeleteCommentButton({
  commentId,
  postId,
}: {
  commentId: string;
  postId: string;
}) {
  const [state, formAction] = useActionState(deleteCommentAction, idleState);

  useEffect(() => {
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="commentId" value={commentId} />
      <input type="hidden" name="postId" value={postId} />
      <SubmitButton
        variant="ghost"
        size="icon-sm"
        aria-label="Delete this comment"
        pendingLabel=""
      >
        <Trash2 className="size-3.5" aria-hidden />
      </SubmitButton>
    </form>
  );
}
