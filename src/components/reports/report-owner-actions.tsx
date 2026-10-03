"use client";

import { useActionState, useEffect } from "react";
import { HeartHandshake, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteReportAction,
  markReunitedAction,
  reopenReportAction,
} from "@/actions/report";
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
import { idleState, type ActionState } from "@/lib/action-state";
import type { ReportStatus } from "@/lib/types";

/** Surfaces an action's failure without burying it in the page. */
function useToastOnError(state: ActionState) {
  useEffect(() => {
    if (state.status === "error") toast.error(state.message);
  }, [state]);
}

export function ReportOwnerActions({
  reportId,
  status,
}: {
  reportId: string;
  status: ReportStatus;
}) {
  const [reunitedState, markReunited] = useActionState(
    markReunitedAction,
    idleState,
  );
  const [reopenState, reopen] = useActionState(reopenReportAction, idleState);
  const [deleteState, remove] = useActionState(deleteReportAction, idleState);

  useToastOnError(reunitedState);
  useToastOnError(reopenState);
  useToastOnError(deleteState);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "open" ? (
        <form action={markReunited}>
          <input type="hidden" name="reportId" value={reportId} />
          <SubmitButton size="lg" pendingLabel="Updating…">
            <HeartHandshake aria-hidden />
            Mark as reunited
          </SubmitButton>
        </form>
      ) : (
        <form action={reopen}>
          <input type="hidden" name="reportId" value={reportId} />
          <SubmitButton variant="outline" size="lg" pendingLabel="Updating…">
            <RotateCcw aria-hidden />
            Reopen report
          </SubmitButton>
        </form>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="lg">
            <Trash2 aria-hidden />
            Delete
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">
              Delete this report?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Anyone holding the link will lose it, and the photo is removed. If
              the pet is home, marking it reunited is usually better — it leaves
              the happy ending visible.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Keep report</AlertDialogCancel>
            <form action={remove}>
              <input type="hidden" name="reportId" value={reportId} />
              <SubmitButton variant="destructive" pendingLabel="Deleting…">
                Delete
              </SubmitButton>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
