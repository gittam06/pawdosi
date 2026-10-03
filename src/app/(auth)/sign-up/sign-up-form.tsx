"use client";

import { useActionState, useState } from "react";

import { signUpAction } from "@/actions/auth";
import { TextField } from "@/components/forms/fields";
import { FormAlert } from "@/components/forms/form-alert";
import { PasswordField } from "@/components/forms/password-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { idleState } from "@/lib/action-state";

export function SignUpForm() {
  const [state, formAction] = useActionState(signUpAction, idleState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  // React 19 resets an uncontrolled form once its action settles. Holding the
  // email in state means a rejected submission does not wipe what was typed.
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="space-y-4" noValidate>
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

      <PasswordField
        autoComplete="new-password"
        hint="At least 8 characters."
        errors={fieldErrors?.password}
      />

      <SubmitButton
        size="lg"
        className="h-10 w-full"
        pendingLabel="Creating account…"
      >
        Create account
      </SubmitButton>
    </form>
  );
}
