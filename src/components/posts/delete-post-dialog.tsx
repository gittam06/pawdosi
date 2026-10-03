"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";

import { deletePostAction } from "@/actions/post";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { idleState } from "@/lib/action-state";

export function DeletePostDialog({ postId }: { postId: string }) {
  const [state, formAction] = useActionState(deletePostAction, idleState);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash2 aria-hidden />
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">
            Delete this post?
          </AlertDialogTitle>
          <AlertDialogDescription>
            The post and its photos are removed for good. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <FormAlert state={state} />

        <AlertDialogFooter>
          <AlertDialogCancel>Keep post</AlertDialogCancel>
          <form action={formAction}>
            <input type="hidden" name="postId" value={postId} />
            <SubmitButton variant="destructive" pendingLabel="Deleting…">
              Delete
            </SubmitButton>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
