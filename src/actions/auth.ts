"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { failure, invalidInput, type ActionState } from "@/lib/action-state";
import { authErrorMessage } from "@/lib/auth-errors";
import { getOrigin } from "@/lib/site-url";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validations/auth";

/**
 * Only same-origin, absolute-path redirects are honoured, so `?next=` cannot
 * be used to bounce a freshly signed-in user to another site.
 *
 * Resolved against a throwaway origin rather than pattern-matched: anything
 * that lands on a different host is not a local path, however it was spelled.
 * The character-by-character version of this check (`startsWith("//")`) missed
 * `/\evil.com` — every browser treats a backslash as a slash in the authority
 * position, so `?next=/\evil.com` sent a user who had just typed their
 * password straight to another site.
 */
const LOCAL_BASE = "http://redirect.invalid";

function safeNext(value: FormDataEntryValue | null, fallback: string): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;

  let resolved: URL;

  try {
    resolved = new URL(value, LOCAL_BASE);
  } catch {
    return fallback;
  }

  if (resolved.origin !== LOCAL_BASE) return fallback;

  return `${resolved.pathname}${resolved.search}${resolved.hash}`;
}

/**
 * Does the OAuth provider actually answer?
 *
 * A configured provider replies with a redirect to Google; an unconfigured one
 * replies 400. Network trouble is treated as "enabled" so a blip cannot block
 * a sign-in that would otherwise work.
 */
async function providerIsEnabled(authorizeUrl: string): Promise<boolean> {
  try {
    const response = await fetch(authorizeUrl, { redirect: "manual" });
    return response.status !== 400;
  } catch (error) {
    console.error("Could not pre-flight the OAuth provider", error);
    return true;
  }
}

export async function signUpAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // Supabase appends its verification code to this URL.
      emailRedirectTo: `${origin}/auth/callback?next=/onboarding`,
    },
  });

  if (error) return failure(authErrorMessage(error));

  // Projects with email confirmation switched off sign the user straight in.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/onboarding");
  }

  redirect("/check-email");
}

export async function signInAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return failure(authErrorMessage(error));

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next"), "/"));
}

export async function signInWithGoogleAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const origin = await getOrigin();
  const next = safeNext(formData.get("next"), "/onboarding");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) return failure(authErrorMessage(error));
  if (!data.url) return failure("Could not start Google sign-in.");

  // signInWithOAuth builds the authorize URL locally — it never contacts
  // Supabase — so a disabled provider is only discovered by following the
  // link, which dumps the user on a raw 400 JSON page. One pre-flight request
  // turns that dead end into a sentence they can act on.
  if (!(await providerIsEnabled(data.url))) {
    return failure(
      "Google sign-in is not set up yet. Enable the Google provider in your Supabase project first.",
    );
  }

  redirect(data.url);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
