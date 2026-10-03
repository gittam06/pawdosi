import { z } from "zod";

const trimmed = z.string().trim();

/**
 * Names that would collide with a route or read as official.
 * Kept in sync with the top-level route segments.
 */
const RESERVED_USERNAMES = new Set([
  "about",
  "admin",
  "api",
  "auth",
  "contact",
  "explore",
  "feed",
  "help",
  "lost-found",
  "me",
  "new",
  "onboarding",
  "pawpals",
  "pets",
  "profile",
  "root",
  "settings",
  "sign-in",
  "sign-up",
  "support",
  "system",
]);

/** Mirrors the `profiles_username_format` check constraint in the database. */
export const usernameSchema = trimmed
  .toLowerCase()
  .min(3, "At least 3 characters.")
  .max(24, "At most 24 characters.")
  .regex(
    /^[a-z0-9_]+$/,
    "Only lowercase letters, numbers and underscores are allowed.",
  )
  .refine((value) => !RESERVED_USERNAMES.has(value), {
    message: "That username is reserved. Try another one.",
  });

export const displayNameSchema = trimmed
  .min(1, "Tell us what to call you.")
  .max(50, "At most 50 characters.");

export const citySchema = trimmed
  .min(2, "At least 2 characters.")
  .max(60, "At most 60 characters.");

export const bioSchema = trimmed
  .max(300, "At most 300 characters.")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const onboardingSchema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  city: citySchema,
});

export const profileUpdateSchema = z.object({
  username: usernameSchema,
  displayName: displayNameSchema,
  city: citySchema,
  bio: bioSchema,
});

/**
 * Payload sent back by the browser once Cloudinary accepts a direct upload.
 * The values are untrusted: the server re-checks the asset with Cloudinary's
 * Admin API before storing it.
 */
export const avatarUploadSchema = z.object({
  publicId: trimmed.min(1).max(200),
  url: z.url(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
