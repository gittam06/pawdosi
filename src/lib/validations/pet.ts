import { z } from "zod";

import { GENDER_VALUES, SPECIES_VALUES } from "@/config/pets";

const trimmed = z.string().trim();

/** Earliest plausible birth date; mirrors `pets_birth_date_floor` in the DB. */
const EARLIEST_BIRTH_DATE = "1980-01-01";

const optionalText = (max: number, message: string) =>
  trimmed
    .max(max, message)
    .optional()
    .or(z.literal("").transform(() => undefined));

export const petNameSchema = trimmed
  .min(1, "Your pet needs a name.")
  .max(40, "At most 40 characters.");

export const petSpeciesSchema = z.enum(SPECIES_VALUES, {
  message: "Pick a species.",
});

export const petGenderSchema = z.enum(GENDER_VALUES, {
  message: "Pick an option.",
});

/**
 * A date input posts "" when empty and "YYYY-MM-DD" otherwise.
 * "Not in the future" cannot live in a CHECK constraint (it would not be
 * immutable), so it is enforced here.
 */
export const petBirthDateSchema = trimmed
  .optional()
  .or(z.literal("").transform(() => undefined))
  .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
    message: "Use the date picker.",
  })
  .refine((value) => !value || !Number.isNaN(Date.parse(value)), {
    message: "That is not a real date.",
  })
  .refine((value) => !value || value <= new Date().toISOString().slice(0, 10), {
    message: "Birthdays cannot be in the future.",
  })
  .refine((value) => !value || value >= EARLIEST_BIRTH_DATE, {
    message: "That is too far back.",
  });

export const petSchema = z.object({
  name: petNameSchema,
  species: petSpeciesSchema,
  gender: petGenderSchema,
  breed: optionalText(60, "At most 60 characters."),
  birthDate: petBirthDateSchema,
  bio: optionalText(300, "At most 300 characters."),
});

export type PetInput = z.infer<typeof petSchema>;
