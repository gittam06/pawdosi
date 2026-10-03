import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Plus, Users } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PostFeed } from "@/components/posts/post-feed";
import { Button } from "@/components/ui/button";
import { requireOnboardedProfile } from "@/lib/auth";
import { listFeedPosts, listFollowedPetIds } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Your feed",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const profile = await requireOnboardedProfile();

  const petIds = await listFollowedPetIds(profile.id);
  const { posts, nextCursor } = await listFeedPosts(petIds, null);

  return (
    <div className="mx-auto w-full max-w-feed px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold">Your feed</h1>
          <p className="text-sm text-muted-foreground">
            Moments from the pets you follow.
          </p>
        </div>

        <Button asChild className="h-10">
          <Link href="/posts/new">
            <Plus aria-hidden />
            Post
          </Link>
        </Button>
      </header>

      {posts.length === 0 ? (
        /* Two distinct empty states: following nobody is a different problem
           from following pets that have not posted. */
        <EmptyState
          icon={petIds.length === 0 ? Users : Compass}
          title={
            petIds.length === 0
              ? "You are not following any pets yet"
              : "Nothing new here"
          }
          description={
            petIds.length === 0
              ? "Find pets on Explore and follow the ones you want in your feed."
              : "The pets you follow have not posted anything yet. Explore has the rest of PawPals."
          }
          action={
            <Button variant="outline" asChild className="mt-1 h-10">
              <Link href="/explore">
                <Compass aria-hidden />
                Go to Explore
              </Link>
            </Button>
          }
        />
      ) : (
        <PostFeed
          scope={{ type: "feed" }}
          initialPosts={posts}
          initialCursor={nextCursor}
          viewerSignedIn
        />
      )}
    </div>
  );
}
