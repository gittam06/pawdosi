"use client";

import { useActionState, useState } from "react";

import { updateProfileAction } from "@/actions/profile";
import { TextAreaField, TextField } from "@/components/forms/fields";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { idleState } from "@/lib/action-state";
import type { OnboardedProfile } from "@/lib/types";

const BIO_LIMIT = 300;

export function ProfileForm({ profile }: { profile: OnboardedProfile }) {
  const [state, formAction] = useActionState(updateProfileAction, idleState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  // Controlled so a rejected save keeps the user's edits on screen — React 19
  // resets an uncontrolled form as soon as the action settles.
  const [username, setUsername] = useState(profile.username);
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [city, setCity] = useState(profile.city);
  const [bio, setBio] = useState(profile.bio ?? "");

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormAlert state={state} />

      <TextField
        name="username"
        label="Username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
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
        autoComplete="name"
        required
        errors={fieldErrors?.displayName}
      />

      <TextField
        name="city"
        label="City"
        value={city}
        onChange={(event) => setCity(event.target.value)}
        autoComplete="address-level2"
        required
        errors={fieldErrors?.city}
      />

      <TextAreaField
        name="bio"
        label="Bio"
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        rows={4}
        maxLength={BIO_LIMIT}
        hint={`${bio.length}/${BIO_LIMIT} characters. Optional.`}
        errors={fieldErrors?.bio}
      />

      <SubmitButton size="lg" className="h-10" pendingLabel="Saving…">
        Save changes
      </SubmitButton>
    </form>
  );
}
