"use client";

import { useActionState, useState } from "react";

import { signInAction } from "@/actions/auth";
import { TextField } from "@/components/forms/fields";
import { FormAlert } from "@/components/forms/form-alert";
import { PasswordField } from "@/components/forms/password-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { idleState } from "@/lib/action-state";

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signInAction, idleState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  // React 19 resets an uncontrolled form once its action settles. Holding the
  // email in state means a failed sign-in does not wipe what was typed.
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <FormAlert state={state} />

      <TextField
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        errors={fieldErrors?.email}
      />

      <PasswordField errors={fieldErrors?.password} />

      <SubmitButton
        size="lg"
        className="h-10 w-full"
        pendingLabel="Signing in…"
      >
        Sign in
      </SubmitButton>
    </form>
  );
}
