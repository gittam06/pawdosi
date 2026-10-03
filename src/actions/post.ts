"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { failure, invalidInput, type ActionState } from "@/lib/action-state";
import { requireOnboardedProfile } from "@/lib/auth";
import { deleteAsset, verifyUploadedImage } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";
import { parseImagesField, postSchema } from "@/lib/validations/post";

export async function createPostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireOnboardedProfile();

  const images = parseImagesField(formData.get("images"));
  if (images === null) return failure("That upload could not be read.");

  const parsed = postSchema.safeParse({
    petId: formData.get("petId"),
    caption: formData.get("caption"),
    images,
  });

  if (!parsed.success) return invalidInput(parsed.error);

  // Ask Cloudinary what actually landed, in parallel. The browser's report of
  // its own upload is not evidence.
  const verified = await Promise.all(
    parsed.data.images.map((image) =>
      verifyUploadedImage(image.publicId, "post"),
    ),
  );

  const allPublicIds = parsed.data.images.map((image) => image.publicId);
  const rejected = verified.find((asset) => !asset.ok);

  if (rejected && !rejected.ok) {
    await Promise.all(allPublicIds.map(deleteAsset));
    return failure(rejected.reason);
  }

  const supabase = await createClient();

  // The insert policy checks that this profile owns the pet, so a forged
  // petId is rejected by the database rather than by a check here.
  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      pet_id: parsed.data.petId,
      author_id: profile.id,
      caption: parsed.data.caption ?? null,
    })
    .select("id, pet:pets!posts_pet_id_fkey(slug)")
    .single();

  if (postError || !post) {
    await Promise.all(allPublicIds.map(deleteAsset));
    console.error("Failed to create post", postError);
    return failure("We could not publish that post. Please try again.");
  }

  const { error: imagesError } = await supabase.from("post_images").insert(
    parsed.data.images.map((image, index) => {
      const asset = verified[index];

      return {
        post_id: post.id,
        url: asset.ok ? asset.url : image.url,
        public_id: image.publicId,
        width: asset.ok ? asset.width : 0,
        height: asset.ok ? asset.height : 0,
        position: index,
      };
    }),
  );

  if (imagesError) {
    // A post with no images is not a post. Undo the whole thing.
    await supabase.from("posts").delete().eq("id", post.id);
    await Promise.all(allPublicIds.map(deleteAsset));
    console.error("Failed to attach post images", imagesError);
    return failure("We could not publish that post. Please try again.");
  }

  const petSlug = Array.isArray(post.pet) ? post.pet[0]?.slug : post.pet?.slug;

  revalidatePath("/explore");
  revalidatePath("/feed");
  if (petSlug) revalidatePath(`/pets/${petSlug}`);

  redirect(`/posts/${post.id}`);
}

export async function deletePostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireOnboardedProfile();

  const postId = formData.get("postId");
  if (typeof postId !== "string" || !postId) {
    return failure("That post could not be identified.");
  }

  const supabase = await createClient();

  // Read the asset ids before the cascade removes the image rows. They come
  // from the database under this user's RLS, never from the form.
  const { data: images } = await supabase
    .from("post_images")
    .select("public_id")
    .eq("post_id", postId);

  const { data: deleted, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("author_id", profile.id)
    .select("id, pet:pets!posts_pet_id_fkey(slug)")
    .maybeSingle();

  if (error) {
    console.error("Failed to delete post", error);
    return failure("We could not delete that post. Please try again.");
  }

  if (!deleted) return failure("That post no longer exists.");

  await Promise.all((images ?? []).map((row) => deleteAsset(row.public_id)));

  const petSlug = Array.isArray(deleted.pet)
    ? deleted.pet[0]?.slug
    : deleted.pet?.slug;

  revalidatePath("/explore");
  revalidatePath("/feed");
  if (petSlug) revalidatePath(`/pets/${petSlug}`);

  redirect(petSlug ? `/pets/${petSlug}` : "/explore");
}
