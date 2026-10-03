import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { supabaseConfiguredOrWarn } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { isOnboarded, type OnboardedProfile, type Profile } from "@/lib/types";

/**
 * Request-scoped auth helpers.
 *
 * `cache()` dedupes within a single render pass, so a layout, a page and a
 * component can each ask for the current user without three round trips.
 */

export const getCurrentUser = cache(async (): Promise<User | null> => {
  // An unconfigured environment reads as "signed out" so that builds and
  // fresh clones still render. Auth attempts still fail loudly.
  if (!supabaseConfiguredOrWarn()) return null;

  const supabase = await createClient();

  // getUser() revalidates the JWT with the auth server. getSession() only
  // decodes a cookie the client could have forged — never use it for authz.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile", error);
    return null;
  }

  return data;
});

/** Signed-in users only. Sends everyone else to sign-in. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  return user;
}

/**
 * Signed in *and* through onboarding. Use this for anything that needs a
 * username — posting, following, filing a report.
 */
export async function requireOnboardedProfile(): Promise<OnboardedProfile> {
  await requireUser();
  const profile = await getCurrentProfile();

  if (!isOnboarded(profile)) redirect("/onboarding");

  return profile;
}
