"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";

import { deletePetAction } from "@/actions/pet";
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

type DeletePetDialogProps = {
  petId: string;
  petName: string;
};

/**
 * Deleting a pet removes its photo from Cloudinary and (from Phase 3) its
 * posts, so it gets a typed-free but explicit confirmation step.
 */
export function DeletePetDialog({ petId, petName }: DeletePetDialogProps) {
  const [state, formAction] = useActionState(deletePetAction, idleState);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="lg">
          <Trash2 aria-hidden />
          Delete profile
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">
            Delete {petName}&apos;s profile?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This removes the profile, its photo and everything posted as{" "}
            {petName}. It cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <FormAlert state={state} />

        <AlertDialogFooter>
          <AlertDialogCancel>Keep profile</AlertDialogCancel>
          <form action={formAction}>
            <input type="hidden" name="petId" value={petId} />
            <SubmitButton variant="destructive" pendingLabel="Deleting…">
              Delete
            </SubmitButton>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
