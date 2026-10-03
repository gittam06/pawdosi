"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { PostgrestError } from "@supabase/supabase-js";

import {
  failure,
  invalidInput,
  success,
  type ActionState,
} from "@/lib/action-state";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import { deleteAsset, verifyUploadedImage } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";
import {
  avatarUploadSchema,
  onboardingSchema,
  profileUpdateSchema,
} from "@/lib/validations/profile";

/** Postgres unique-violation. The only one we can hit here is the username. */
const UNIQUE_VIOLATION = "23505";

function usernameTaken(): ActionState {
  return {
    status: "error",
    message: "Please fix the highlighted fields.",
    fieldErrors: { username: ["That username is already taken."] },
  };
}

function writeFailed(error: PostgrestError, what: string): ActionState {
  console.error(`Failed to ${what}`, error);

  return failure("We could not save your changes. Please try again.");
}

export async function completeOnboardingAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = onboardingSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    city: formData.get("city"),
  });

  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();

  // RLS restricts this to the caller's own row; the .eq() keeps the intent
  // explicit and makes the query planner's job obvious.
  const { error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      display_name: parsed.data.displayName,
      city: parsed.data.city,
    })
    .eq("id", user.id);

  if (error) {
    return error.code === UNIQUE_VIOLATION
      ? usernameTaken()
      : writeFailed(error, "complete onboarding");
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = profileUpdateSchema.safeParse({
    username: formData.get("username"),
    displayName: formData.get("displayName"),
    city: formData.get("city"),
    bio: formData.get("bio"),
  });

  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      username: parsed.data.username,
      display_name: parsed.data.displayName,
      city: parsed.data.city,
      bio: parsed.data.bio ?? null,
    })
    .eq("id", user.id);

  if (error) {
    return error.code === UNIQUE_VIOLATION
      ? usernameTaken()
      : writeFailed(error, "update profile");
  }

  revalidatePath("/", "layout");
  return success("Profile saved.");
}

export async function updateAvatarAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = avatarUploadSchema.safeParse({
    publicId: formData.get("publicId"),
    url: formData.get("url"),
  });

  if (!parsed.success) return failure("That upload could not be read.");

  // The browser uploaded straight to Cloudinary, so ask Cloudinary what
  // actually arrived rather than believing the client.
  const asset = await verifyUploadedImage(parsed.data.publicId, "avatar");

  if (!asset.ok) {
    await deleteAsset(parsed.data.publicId);
    return failure(asset.reason);
  }

  const previous = await getCurrentProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      avatar_url: asset.url,
      avatar_public_id: parsed.data.publicId,
    })
    .eq("id", user.id);

  if (error) {
    // Do not orphan the asset we just accepted but could not record.
    await deleteAsset(parsed.data.publicId);
    return writeFailed(error, "save avatar");
  }

  if (previous?.avatar_public_id) {
    await deleteAsset(previous.avatar_public_id);
  }

  revalidatePath("/", "layout");
  return success("Photo updated.");
}

export async function removeAvatarAction(
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const profile = await getCurrentProfile();

  if (!profile?.avatar_public_id) return success();

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null, avatar_public_id: null })
    .eq("id", user.id);

  if (error) return writeFailed(error, "remove avatar");

  await deleteAsset(profile.avatar_public_id);

  revalidatePath("/", "layout");
  return success("Photo removed.");
}
