import { CheckCircle2, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ActionState } from "@/lib/action-state";

/**
 * Renders the form-level outcome of a Server Action.
 *
 * Field-level problems are shown next to their input, so this only surfaces
 * the summary line — and stays silent while the form is untouched.
 */
export function FormAlert({ state }: { state: ActionState }) {
  if (state.status === "idle") return null;
  if (state.status === "success" && !state.message) return null;

  const isError = state.status === "error";

  return (
    <Alert
      role={isError ? "alert" : "status"}
      className={
        isError
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-success/30 bg-success-muted text-success-muted-foreground"
      }
    >
      {isError ? (
        <TriangleAlert className="size-4" aria-hidden />
      ) : (
        <CheckCircle2 className="size-4" aria-hidden />
      )}
      <AlertDescription className="text-current">
        {state.message}
      </AlertDescription>
    </Alert>
  );
}
