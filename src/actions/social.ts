"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  failure,
  invalidInput,
  success,
  type ActionState,
} from "@/lib/action-state";
import { requireOnboardedProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { commentSchema } from "@/lib/validations/social";

/** Unique violation: the like already existed. Not an error worth showing. */
const UNIQUE_VIOLATION = "23505";

export type ToggleResult = { ok: boolean; active: boolean; message?: string };

/**
 * Likes and follows are toggles, so they return the resulting state rather
 * than an ActionState: the client holds an optimistic value and needs to know
 * what to settle on.
 */

export async function toggleLikeAction(
  postId: string,
  shouldLike: boolean,
): Promise<ToggleResult> {
  if (!z.uuid().safeParse(postId).success) {
    return { ok: false, active: !shouldLike, message: "Unknown post." };
  }

  const profile = await requireOnboardedProfile();
  const supabase = await createClient();

  if (shouldLike) {
    const { error } = await supabase
      .from("likes")
      .insert({ post_id: postId, user_id: profile.id });

    // Double-click, two tabs: already liked is the state we wanted anyway.
    if (error && error.code !== UNIQUE_VIOLATION) {
      console.error("Failed to like post", error);
      return { ok: false, active: false, message: "Could not save that like." };
    }
  } else {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", profile.id);

    if (error) {
      console.error("Failed to unlike post", error);
      return {
        ok: false,
        active: true,
        message: "Could not remove that like.",
      };
    }
  }

  revalidatePath(`/posts/${postId}`);

  return { ok: true, active: shouldLike };
}

export async function toggleFollowAction(
  petId: string,
  shouldFollow: boolean,
): Promise<ToggleResult> {
  if (!z.uuid().safeParse(petId).success) {
    return { ok: false, active: !shouldFollow, message: "Unknown pet." };
  }

  const profile = await requireOnboardedProfile();
  const supabase = await createClient();

  if (shouldFollow) {
    const { error } = await supabase
      .from("follows")
      .insert({ pet_id: petId, follower_id: profile.id });

    if (error && error.code !== UNIQUE_VIOLATION) {
      console.error("Failed to follow pet", error);
      return {
        ok: false,
        active: false,
        message: "Could not follow that pet.",
      };
    }
  } else {
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("pet_id", petId)
      .eq("follower_id", profile.id);

    if (error) {
      console.error("Failed to unfollow pet", error);
      return { ok: false, active: true, message: "Could not unfollow." };
    }
  }

  // The feed is now a different set of posts.
  revalidatePath("/feed");

  return { ok: true, active: shouldFollow };
}

export async function addCommentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await requireOnboardedProfile();

  const parsed = commentSchema.safeParse({
    postId: formData.get("postId"),
    body: formData.get("body"),
  });

  if (!parsed.success) return invalidInput(parsed.error);

  const supabase = await createClient();

  const { error } = await supabase.from("comments").insert({
    post_id: parsed.data.postId,
    user_id: profile.id,
    body: parsed.data.body,
  });

  if (error) {
    console.error("Failed to add comment", error);
    return failure("We could not post that comment. Please try again.");
  }

  revalidatePath(`/posts/${parsed.data.postId}`);

  return success();
}

export async function deleteCommentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireOnboardedProfile();

  const commentId = formData.get("commentId");
  const postId = formData.get("postId");

  if (typeof commentId !== "string" || typeof postId !== "string") {
    return failure("That comment could not be identified.");
  }

  const supabase = await createClient();

  // No ownership filter here: the RLS policy already allows the comment's
  // author *or* the post's author, and duplicating that rule in two places is
  // how the two drift apart.
  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to delete comment", error);
    return failure("We could not delete that comment.");
  }

  if (!data) return failure("That comment is not yours to delete.");

  revalidatePath(`/posts/${postId}`);

  return success();
}
