import type { PetGender, PetSpecies } from "@/lib/types";

/**
 * Species and gender presentation. The values must stay in step with the
 * `pet_species` / `pet_gender` enums in the database.
 *
 * Icons live in `components/pets/species-icon.tsx`, not here: a component
 * picked out of a map at render time is a component created during render.
 */

export const SPECIES: ReadonlyArray<{ value: PetSpecies; label: string }> = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "rabbit", label: "Rabbit" },
  { value: "other", label: "Other" },
];

export const SPECIES_VALUES = SPECIES.map((s) => s.value) as [
  PetSpecies,
  ...PetSpecies[],
];

export function speciesLabel(species: PetSpecies): string {
  return SPECIES.find((s) => s.value === species)?.label ?? "Pet";
}

export const GENDERS: ReadonlyArray<{ value: PetGender; label: string }> = [
  { value: "unknown", label: "Prefer not to say" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
];

export const GENDER_VALUES = GENDERS.map((g) => g.value) as [
  PetGender,
  ...PetGender[],
];

export function genderLabel(gender: PetGender): string | null {
  if (gender === "unknown") return null;

  return GENDERS.find((g) => g.value === gender)?.label ?? null;
}

/** Keeps one person from turning the app into a kennel directory. */
export const MAX_PETS_PER_OWNER = 20;
