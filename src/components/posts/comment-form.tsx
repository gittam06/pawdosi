"use client";

import { useActionState, useState } from "react";

import type { ActionState } from "@/lib/action-state";

import { addCommentAction } from "@/actions/social";
import { TextAreaField } from "@/components/forms/fields";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { idleState } from "@/lib/action-state";
import { COMMENT_LIMIT } from "@/lib/validations/social";

export function CommentForm({ postId }: { postId: string }) {
  const [state, formAction] = useActionState(addCommentAction, idleState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const [body, setBody] = useState("");
  const [handled, setHandled] = useState<ActionState | null>(null);

  // Clear on success only — a rejected comment keeps what was typed. This is
  // an adjustment during render rather than an effect: React re-runs the
  // component immediately with the new value, before anything is painted, so
  // there is no flash of the stale text and no cascading effect.
  if (state.status === "success" && state !== handled) {
    setHandled(state);
    setBody("");
  }

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <input type="hidden" name="postId" value={postId} />

      <FormAlert state={state} />

      <TextAreaField
        name="body"
        label="Add a comment"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        maxLength={COMMENT_LIMIT}
        placeholder="Say something nice."
        hint={`${body.length}/${COMMENT_LIMIT} characters.`}
        errors={fieldErrors?.body}
      />

      <SubmitButton size="lg" className="h-10" pendingLabel="Posting…">
        Post comment
      </SubmitButton>
    </form>
  );
}
