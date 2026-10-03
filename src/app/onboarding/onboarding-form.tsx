"use client";

import { useActionState, useState } from "react";

import { completeOnboardingAction } from "@/actions/profile";
import { TextField } from "@/components/forms/fields";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { idleState } from "@/lib/action-state";

type OnboardingFormProps = {
  defaultDisplayName: string;
  defaultUsername: string;
};

export function OnboardingForm({
  defaultDisplayName,
  defaultUsername,
}: OnboardingFormProps) {
  const [state, formAction] = useActionState(
    completeOnboardingAction,
    idleState,
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  // Controlled: React 19 resets the form when the action settles, and a
  // rejected username should not cost the user the other two fields.
  const [username, setUsername] = useState(defaultUsername);
  const [displayName, setDisplayName] = useState(defaultDisplayName);
  const [city, setCity] = useState("");

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormAlert state={state} />

      <TextField
        name="username"
        label="Username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="paw_parent"
        hint="Lowercase letters, numbers and underscores. You can change it later in settings."
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        required
        errors={fieldErrors?.username}
      />

      <TextField
        name="displayName"
        label="Your name"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        placeholder="Aarav Sharma"
        autoComplete="name"
        required
        errors={fieldErrors?.displayName}
      />

      <TextField
        name="city"
        label="City"
        value={city}
        onChange={(event) => setCity(event.target.value)}
        placeholder="Bengaluru"
        hint="Used to show you nearby Lost & Found reports."
        autoComplete="address-level2"
        required
        errors={fieldErrors?.city}
      />

      <SubmitButton
        size="lg"
        className="h-10 w-full"
        pendingLabel="Setting things up…"
      >
        Finish setup
      </SubmitButton>
    </form>
  );
}
