import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PostFeed } from "@/components/posts/post-feed";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { listExplorePosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Explore",
  description: "Recent moments from pets across Pawdosi.",
};

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const [{ posts, nextCursor }, user] = await Promise.all([
    listExplorePosts(null),
    getCurrentUser(),
  ]);

  return (
    <div className="mx-auto w-full max-w-feed px-4 py-8 sm:px-6">
      <header className="mb-6 space-y-1">
        <h1 className="font-heading text-2xl font-bold">Explore</h1>
        <p className="text-sm text-muted-foreground">
          The newest moments from every pet on Pawdosi.
        </p>
      </header>

      {posts.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Nothing posted yet"
          description="Pawdosi is brand new. Be the first to share a moment."
          action={
            user ? (
              <Button asChild className="mt-1 h-10">
                <Link href="/posts/new">
                  <Plus aria-hidden />
                  Create a post
                </Link>
              </Button>
            ) : (
              <Button asChild className="mt-1 h-10">
                <Link href="/sign-up">Join Pawdosi</Link>
              </Button>
            )
          }
        />
      ) : (
        <PostFeed
          scope={{ type: "explore" }}
          initialPosts={posts}
          initialCursor={nextCursor}
          viewerSignedIn={user !== null}
        />
      )}
    </div>
  );
}
