import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { PostCursor, PostWithRelations } from "@/lib/types";

/**
 * Post reads with keyset ("cursor") pagination.
 *
 * Offset pagination drifts: by page 3 the feed has new posts at the top and
 * rows slide across page boundaries. A keyset cursor on (created_at, id) is
 * stable and lets Postgres seek straight into the index instead of counting
 * past rows. `id` is in the key because timestamps tie.
 */

export const POSTS_PAGE_SIZE = 12;

const POST_SELECT = `
  *,
  pet:pets!posts_pet_id_fkey(id, name, slug, species, avatar_url),
  author:profiles!posts_author_id_fkey(id, username, display_name),
  images:post_images(*)
`;

/**
 * Cursors arrive from the query string, and they are interpolated into a
 * PostgREST filter expression — so they are validated, not trusted.
 */
export const postCursorSchema = z.object({
  createdAt: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "not a timestamp"),
  id: z.uuid(),
});

export type PostPage = {
  posts: PostWithRelations[];
  nextCursor: PostCursor | null;
};

const EMPTY_PAGE: PostPage = { posts: [], nextCursor: null };

function sortImages(post: PostWithRelations): PostWithRelations {
  // PostgREST does not guarantee the order of embedded rows.
  return {
    ...post,
    images: [...post.images].sort((a, b) => a.position - b.position),
  };
}

/**
 * Turns a query result into a page.
 *
 * Each query asks for one row more than a page: if the probe row came back
 * there is a next page, and the last kept row is the cursor. One query, and
 * no `count(*)` over the whole table.
 */
function toPage(data: unknown, error: unknown): PostPage {
  if (error) {
    console.error("Failed to load posts", error);
    return EMPTY_PAGE;
  }

  const rows = (data ?? []) as PostWithRelations[];
  const hasMore = rows.length > POSTS_PAGE_SIZE;
  const posts = (hasMore ? rows.slice(0, POSTS_PAGE_SIZE) : rows).map(
    sortImages,
  );
  const last = posts.at(-1);

  return {
    posts,
    nextCursor:
      hasMore && last ? { createdAt: last.created_at, id: last.id } : null,
  };
}

/** `(created_at, id) < (cursor.created_at, cursor.id)`, in PostgREST syntax. */
function cursorFilter(cursor: PostCursor): string {
  return `created_at.lt."${cursor.createdAt}",and(created_at.eq."${cursor.createdAt}",id.lt."${cursor.id}")`;
}

export async function listExplorePosts(
  cursor: PostCursor | null,
): Promise<PostPage> {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(POSTS_PAGE_SIZE + 1);

  if (cursor) query = query.or(cursorFilter(cursor));

  const { data, error } = await query;
  return toPage(data, error);
}

export async function listPetPosts(
  petId: string,
  cursor: PostCursor | null,
): Promise<PostPage> {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("pet_id", petId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(POSTS_PAGE_SIZE + 1);

  if (cursor) query = query.or(cursorFilter(cursor));

  const { data, error } = await query;
  return toPage(data, error);
}

/** Pets this user follows. Also used to decide whether the feed is empty. */
export async function listFollowedPetIds(
  followerId: string,
): Promise<string[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("follows")
    .select("pet_id")
    .eq("follower_id", followerId);

  if (error) {
    console.error("Failed to load follows", error);
    return [];
  }

  return data.map((row) => row.pet_id);
}

export async function listFeedPosts(
  petIds: string[],
  cursor: PostCursor | null,
): Promise<PostPage> {
  if (petIds.length === 0) return EMPTY_PAGE;

  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .in("pet_id", petIds)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(POSTS_PAGE_SIZE + 1);

  if (cursor) query = query.or(cursorFilter(cursor));

  const { data, error } = await query;
  return toPage(data, error);
}

export async function getPostById(
  id: string,
): Promise<PostWithRelations | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load post", error);
    return null;
  }

  return data ? sortImages(data as unknown as PostWithRelations) : null;
}

export async function countPetPosts(petId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("pet_id", petId);

  if (error) {
    console.error("Failed to count posts", error);
    return 0;
  }

  return count ?? 0;
}

export async function countPetFollowers(petId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("follows")
    .select("follower_id", { count: "exact", head: true })
    .eq("pet_id", petId);

  if (error) {
    console.error("Failed to count followers", error);
    return 0;
  }

  return count ?? 0;
}
