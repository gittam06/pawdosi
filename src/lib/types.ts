import type { Database } from "@/lib/supabase/types";

/**
 * App-facing aliases for the generated database types.
 *
 * Import from here, not from the generated file: `npm run db:types`
 * overwrites that file wholesale, and these names stay stable.
 */

type Tables = Database["public"]["Tables"];

export type Profile = Tables["profiles"]["Row"];
export type ProfileInsert = Tables["profiles"]["Insert"];
export type ProfileUpdate = Tables["profiles"]["Update"];

/** A profile that has been through onboarding — username and city are set. */
export type OnboardedProfile = Profile & { username: string; city: string };

export function isOnboarded(
  profile: Profile | null,
): profile is OnboardedProfile {
  return Boolean(profile?.username && profile.city);
}
