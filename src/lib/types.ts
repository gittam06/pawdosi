import type { Database } from "@/lib/supabase/types";

/**
 * App-facing aliases for the generated database types.
 *
 * Import from here, not from the generated file: `npm run db:types`
 * overwrites that file wholesale, and these names stay stable.
 */

type Tables = Database["public"]["Tables"];
type Enums = Database["public"]["Enums"];

export type Profile = Tables["profiles"]["Row"];
export type ProfileInsert = Tables["profiles"]["Insert"];
export type ProfileUpdate = Tables["profiles"]["Update"];

export type Pet = Tables["pets"]["Row"];
export type PetInsert = Tables["pets"]["Insert"];
export type PetUpdate = Tables["pets"]["Update"];

export type PetSpecies = Enums["pet_species"];
export type PetGender = Enums["pet_gender"];

export type Post = Tables["posts"]["Row"];
export type PostImage = Tables["post_images"]["Row"];
export type Follow = Tables["follows"]["Row"];

/** The shape every feed, grid and detail view renders. */
export type PostWithRelations = Post & {
  pet: Pick<Pet, "id" | "name" | "slug" | "species" | "avatar_url">;
  author: Pick<Profile, "id" | "username" | "display_name">;
  images: PostImage[];
};

/** Keyset cursor. Ordering by created_at alone is not stable under ties. */
export type PostCursor = { createdAt: string; id: string };

/** A pet joined with the profile that owns it — what the public page renders. */
export type PetWithOwner = Pet & {
  owner: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

/** A profile that has been through onboarding — username and city are set. */
export type OnboardedProfile = Profile & { username: string; city: string };

export function isOnboarded(
  profile: Profile | null,
): profile is OnboardedProfile {
  return Boolean(profile?.username && profile.city);
}
