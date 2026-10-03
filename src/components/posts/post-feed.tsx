"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { loadMorePostsAction } from "@/actions/feed";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import type { PostCursor, PostWithRelations } from "@/lib/types";
import type { FeedScope } from "@/lib/validations/feed";

type PostFeedProps = {
  scope: FeedScope;
  initialPosts: PostWithRelations[];
  initialCursor: PostCursor | null;
  viewerSignedIn: boolean;
};

/**
 * Renders the first page from the server and appends later pages in place.
 *
 * Pagination is keyset, so appending cannot duplicate or skip a post the way
 * an offset would once new posts land at the top mid-scroll. Phase 6 replaces
 * the button with an IntersectionObserver; nothing else here changes.
 */
export function PostFeed({
  scope,
  initialPosts,
  initialCursor,
  viewerSignedIn,
}: PostFeedProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();

  function loadMore() {
    if (!cursor) return;

    startTransition(async () => {
      const page = await loadMorePostsAction(scope, cursor);

      if (page.posts.length === 0 && page.nextCursor === null) {
        setCursor(null);
        return;
      }

      setPosts((current) => [...current, ...page.posts]);
      setCursor(page.nextCursor);

      if (page.posts.length === 0) toast.error("Could not load more posts.");
    });
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-4">
        {posts.map((post, index) => (
          <li key={post.id}>
            <PostCard
              post={post}
              viewerSignedIn={viewerSignedIn}
              priority={index === 0}
            />
          </li>
        ))}
      </ul>

      {cursor ? (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden />
                Loading…
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
