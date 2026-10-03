"use server";

import { getCurrentUser } from "@/lib/auth";
import {
  listExplorePosts,
  listFeedPosts,
  listFollowedPetIds,
  listPetPosts,
  postCursorSchema,
  type PostPage,
} from "@/lib/posts";
import { feedScopeSchema } from "@/lib/validations/feed";

/**
 * "Load more" for the three post lists.
 *
 * A Server Action rather than a route handler: it keeps the query logic on
 * the server with no public endpoint to document or secure separately, and
 * Phase 6 can swap the button for an observer without touching this.
 */

const EMPTY: PostPage = { posts: [], nextCursor: null };

export async function loadMorePostsAction(
  rawScope: unknown,
  rawCursor: unknown,
): Promise<PostPage> {
  const scope = feedScopeSchema.safeParse(rawScope);
  const cursor = postCursorSchema.safeParse(rawCursor);

  if (!scope.success || !cursor.success) return EMPTY;

  switch (scope.data.type) {
    case "explore":
      return listExplorePosts(cursor.data);

    case "pet":
      return listPetPosts(scope.data.petId, cursor.data);

    case "feed": {
      // Never take the follow list from the client.
      const user = await getCurrentUser();
      if (!user) return EMPTY;

      const petIds = await listFollowedPetIds(user.id);
      return listFeedPosts(petIds, cursor.data);
    }
  }
}
