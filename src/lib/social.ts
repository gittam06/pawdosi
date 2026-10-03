import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { CommentWithAuthor } from "@/lib/types";

/** Reads for the social layer: comments, and the viewer's follow state. */

export async function listComments(
  postId: string,
): Promise<CommentWithAuthor[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("comments")
    .select(
      "*, author:profiles!comments_user_id_fkey(id, username, display_name, avatar_url)",
    )
    .eq("post_id", postId)
    // Oldest first: a comment thread reads as a conversation, not a feed.
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load comments", error);
    return [];
  }

  return data as unknown as CommentWithAuthor[];
}

/** Is the signed-in user following this pet? False when signed out. */
export async function isFollowingPet(petId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("follows")
    .select("pet_id")
    .eq("follower_id", user.id)
    .eq("pet_id", petId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load follow state", error);
    return false;
  }

  return data !== null;
}
