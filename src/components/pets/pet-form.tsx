"use client";

import { useActionState, useState } from "react";

import { createPetAction, updatePetAction } from "@/actions/pet";
import { TextAreaField, TextField } from "@/components/forms/fields";
import { FormAlert } from "@/components/forms/form-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { GENDERS, SPECIES } from "@/config/pets";
import { idleState } from "@/lib/action-state";
import type { Pet } from "@/lib/types";

const BIO_LIMIT = 300;

const speciesOptions = SPECIES.map(({ value, label }) => ({ value, label }));
const genderOptions = GENDERS.map(({ value, label }) => ({ value, label }));

type PetFormProps =
  { mode: "create"; pet?: undefined } | { mode: "edit"; pet: Pet };

/** One form for both creating and editing; only the action differs. */
export function PetForm(props: PetFormProps) {
  const isEdit = props.mode === "edit";

  const [state, formAction] = useActionState(
    isEdit ? updatePetAction : createPetAction,
    idleState,
  );
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  // Controlled: React 19 resets the form once the action settles, which would
  // throw away everything typed when validation rejects one field.
  const [name, setName] = useState(props.pet?.name ?? "");
  const [breed, setBreed] = useState(props.pet?.breed ?? "");
  const [birthDate, setBirthDate] = useState(props.pet?.birth_date ?? "");
  const [bio, setBio] = useState(props.pet?.bio ?? "");

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {isEdit ? (
        <input type="hidden" name="petId" value={props.pet.id} />
      ) : null}

      <FormAlert state={state} />

      <TextField
        name="name"
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Bruno"
        required
        errors={fieldErrors?.name}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="species"
          label="Species"
          options={speciesOptions}
          defaultValue={props.pet?.species}
          placeholder="Pick a species"
          required
          errors={fieldErrors?.species}
        />

        <SelectField
          name="gender"
          label="Gender"
          options={genderOptions}
          defaultValue={props.pet?.gender ?? "unknown"}
          errors={fieldErrors?.gender}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="breed"
          label="Breed"
          value={breed}
          onChange={(event) => setBreed(event.target.value)}
          placeholder="Indie, Labrador, Persian…"
          hint="Optional."
          errors={fieldErrors?.breed}
        />

        <TextField
          name="birthDate"
          label="Birthday"
          type="date"
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
          max={new Date().toISOString().slice(0, 10)}
          hint="Optional. Shows an age on the profile."
          errors={fieldErrors?.birthDate}
        />
      </div>

      <TextAreaField
        name="bio"
        label="About"
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        rows={4}
        maxLength={BIO_LIMIT}
        placeholder="Loves tennis balls, hates the vet."
        hint={`${bio.length}/${BIO_LIMIT} characters. Optional.`}
        errors={fieldErrors?.bio}
      />

      <SubmitButton
        size="lg"
        className="h-10"
        pendingLabel={isEdit ? "Saving…" : "Creating…"}
      >
        {isEdit ? "Save changes" : "Create profile"}
      </SubmitButton>
    </form>
  );
}
