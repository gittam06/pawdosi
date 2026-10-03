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
 */
function safeNext(value: FormDataEntryValue | null, fallback: string): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;

  return value;
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

  redirect(data.url);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}
