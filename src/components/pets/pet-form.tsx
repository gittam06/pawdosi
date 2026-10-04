"use client";

import { useActionState, useState } from "react";

import { cn } from "cn";
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
  const [isCommunity, setIsCommunity] = useState(
    props.pet?.is_community ?? false,
  );
  const [name, setName] = useState(props.pet?.name ?? "");
  const [species, setSpecies] = useState<string>(props.pet?.species ?? "");
  const [gender, setGender] = useState<string>(props.pet?.gender ?? "unknown");
  const [breed, setBreed] = useState(props.pet?.breed ?? "");
  const [birthDate, setBirthDate] = useState(props.pet?.birth_date ?? "");
  const [bio, setBio] = useState(props.pet?.bio ?? "");

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {isEdit ? (
        <input type="hidden" name="petId" value={props.pet.id} />
      ) : null}

      <input
        type="hidden"
        name="isCommunity"
        value={isCommunity ? "true" : ""}
      />

      <FormAlert state={state} />

      {/* Asked first: it changes who this profile belongs to, and the
          wording of everything below it. */}
      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 text-sm font-medium">
          Whose animal is this?
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <RelationshipOption
            active={!isCommunity}
            title="My own pet"
            description="Lives with me"
            onSelect={() => setIsCommunity(false)}
          />
          <RelationshipOption
            active={isCommunity}
            title="A street animal"
            description="One I look after, but do not own"
            onSelect={() => setIsCommunity(true)}
          />
        </div>
      </fieldset>

      <TextField
        name="name"
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={isCommunity ? "Kaali, Blackie, Lucky…" : "Bruno"}
        hint={isCommunity ? "Whatever the neighbourhood calls her." : undefined}
        required
        errors={fieldErrors?.name}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="species"
          label="Species"
          options={speciesOptions}
          value={species}
          onValueChange={setSpecies}
          placeholder="Pick a species"
          required
          errors={fieldErrors?.species}
        />

        <SelectField
          name="gender"
          label="Gender"
          options={genderOptions}
          value={gender}
          onValueChange={setGender}
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

function RelationshipOption({
  active,
  title,
  description,
  onSelect,
}: {
  active: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        "rounded-xl border p-3 text-left transition-colors outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-primary bg-primary-muted text-primary-muted-foreground"
          : "border-border hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <span className="block font-heading text-sm font-bold">{title}</span>
      <span className="block text-xs text-muted-foreground">{description}</span>
    </button>
  );
}
