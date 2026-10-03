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
import { requireOnboardedProfile } from "@/lib/auth";
import { deleteAsset, verifyUploadedImage } from "@/lib/cloudinary";
import { countPetsByOwner } from "@/lib/pets";
import { buildSlug } from "@/lib/slug";
import { createClient } from "@/lib/supabase/server";
import { MAX_PETS_PER_OWNER } from "@/config/pets";
import { avatarUploadSchema } from "@/lib/validations/profile";
import { petSchema } from "@/lib/validations/pet";

const UNIQUE_VIOLATION = "23505";

function writeFailed(error: PostgrestError, what: string): ActionState {
  console.error(`Failed to ${what}`, error);

  return failure("We could not save that. Please try again.");
}

function readPetForm(formData: FormData) {
  return {
    name: formData.get("name"),
    species: formData.get("species"),
    gender: formData.get("gender"),
    breed: formData.get("breed"),
    birthDate: formData.get("birthDate"),
    bio: formData.get("bio"),
  };
}

export async function createPetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireOnboardedProfile();

  const parsed = petSchema.safeParse(readPetForm(formData));
  if (!parsed.success) return invalidInput(parsed.error);

  if ((await countPetsByOwner(profile.id)) >= MAX_PETS_PER_OWNER) {
    return failure(
      `You can have up to ${MAX_PETS_PER_OWNER} pets. Remove one to add another.`,
    );
  }

  const supabase = await createClient();
  const values = {
    owner_id: profile.id,
    name: parsed.data.name,
    species: parsed.data.species,
    gender: parsed.data.gender,
    breed: parsed.data.breed ?? null,
    birth_date: parsed.data.birthDate ?? null,
    bio: parsed.data.bio ?? null,
  };

  // Slugs carry a random suffix, so a collision is rare — but "rare" is not
  // "never", and a retry is cheaper than a pre-flight uniqueness query.
  let slug = buildSlug(parsed.data.name);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { error } = await supabase.from("pets").insert({ ...values, slug });

    if (!error) {
      revalidatePath("/pets");
      redirect(`/pets/${slug}`);
    }

    if (error.code !== UNIQUE_VIOLATION) {
      return writeFailed(error, "create pet");
    }

    slug = buildSlug(parsed.data.name);
  }

  return failure("We could not find a free profile link. Please try again.");
}

export async function updatePetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireOnboardedProfile();

  const petId = formData.get("petId");
  if (typeof petId !== "string" || !petId) {
    return failure("That pet could not be identified.");
  }

  const parsed = petSchema.safeParse(readPetForm(formData));
  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();

  // RLS already restricts this to the owner; the owner_id filter makes the
  // intent explicit and turns a forged id into "no rows" rather than a 403.
  const { data, error } = await supabase
    .from("pets")
    .update({
      name: parsed.data.name,
      species: parsed.data.species,
      gender: parsed.data.gender,
      breed: parsed.data.breed ?? null,
      birth_date: parsed.data.birthDate ?? null,
      bio: parsed.data.bio ?? null,
    })
    .eq("id", petId)
    .eq("owner_id", profile.id)
    .select("slug")
    .maybeSingle();

  if (error) return writeFailed(error, "update pet");
  if (!data) return failure("That pet no longer exists.");

  revalidatePath("/pets");
  revalidatePath(`/pets/${data.slug}`);

  return success("Changes saved.");
}

export async function deletePetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireOnboardedProfile();

  const petId = formData.get("petId");
  if (typeof petId !== "string" || !petId) {
    return failure("That pet could not be identified.");
  }

  const supabase = await createClient();

  // Delete and return the row so we know which Cloudinary asset to clean up.
  const { data, error } = await supabase
    .from("pets")
    .delete()
    .eq("id", petId)
    .eq("owner_id", profile.id)
    .select("slug, avatar_public_id")
    .maybeSingle();

  if (error) return writeFailed(error, "delete pet");
  if (!data) return failure("That pet no longer exists.");

  await deleteAsset(data.avatar_public_id);

  revalidatePath("/pets");
  revalidatePath(`/pets/${data.slug}`);
  redirect("/pets");
}

export async function updatePetAvatarAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireOnboardedProfile();

  const petId = formData.get("petId");
  if (typeof petId !== "string" || !petId) {
    return failure("That pet could not be identified.");
  }

  const parsed = avatarUploadSchema.safeParse({
    publicId: formData.get("publicId"),
    url: formData.get("url"),
  });

  if (!parsed.success) return failure("That upload could not be read.");

  const asset = await verifyUploadedImage(parsed.data.publicId, "pet");

  if (!asset.ok) {
    await deleteAsset(parsed.data.publicId);
    return failure(asset.reason);
  }

  const supabase = await createClient();

  // Read the asset being replaced from the database, never from the form:
  // a client-supplied public_id would let anyone delete anyone's image.
  const { data: current } = await supabase
    .from("pets")
    .select("avatar_public_id")
    .eq("id", petId)
    .eq("owner_id", profile.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("pets")
    .update({
      avatar_url: asset.url,
      avatar_public_id: parsed.data.publicId,
    })
    .eq("id", petId)
    .eq("owner_id", profile.id)
    .select("slug")
    .maybeSingle();

  if (error || !data) {
    // Never leave behind an asset we accepted but could not record.
    await deleteAsset(parsed.data.publicId);
    return error
      ? writeFailed(error, "save pet photo")
      : failure("That pet no longer exists.");
  }

  await deleteAsset(current?.avatar_public_id ?? null);

  revalidatePath("/pets");
  revalidatePath(`/pets/${data.slug}`);

  return success("Photo updated.");
}

export async function removePetAvatarAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireOnboardedProfile();

  const petId = formData.get("petId");
  if (typeof petId !== "string" || !petId) {
    return failure("That pet could not be identified.");
  }

  const supabase = await createClient();

  // Read before clearing: the UPDATE would return the nulls we just wrote.
  const { data: current } = await supabase
    .from("pets")
    .select("avatar_public_id")
    .eq("id", petId)
    .eq("owner_id", profile.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from("pets")
    .update({ avatar_url: null, avatar_public_id: null })
    .eq("id", petId)
    .eq("owner_id", profile.id)
    .select("slug")
    .maybeSingle();

  if (error) return writeFailed(error, "remove pet photo");
  if (!data) return failure("That pet no longer exists.");

  await deleteAsset(current?.avatar_public_id ?? null);

  revalidatePath("/pets");
  revalidatePath(`/pets/${data.slug}`);

  return success("Photo removed.");
}
