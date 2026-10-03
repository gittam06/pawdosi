import type { ZodError } from "zod";

/**
 * Shared shape for every Server Action used with `useActionState`.
 *
 * Actions never throw at the user: they return a state the form renders.
 * `fieldErrors` is keyed by the form field name so errors land next to the
 * input that caused them.
 */

export type FieldErrors = Record<string, string[]>;

export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: FieldErrors }
  | { status: "success"; message?: string };

export const idleState: ActionState = { status: "idle" };

export function fieldErrorsFrom(error: ZodError): FieldErrors {
  const result: FieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "form";
    (result[key] ??= []).push(issue.message);
  }

  return result;
}

export function invalidInput(error: ZodError): ActionState {
  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors: fieldErrorsFrom(error),
  };
}

export function failure(message: string): ActionState {
  return { status: "error", message };
}

export function success(message?: string): ActionState {
  return { status: "success", message };
}
