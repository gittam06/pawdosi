import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { PetAvatar } from "@/components/pets/pet-avatar";
import { PostImages } from "@/components/posts/post-images";
import { Card, CardContent } from "@/components/ui/card";
import { absoluteTime, relativeTime } from "@/lib/relative-time";
import type { PostWithRelations } from "@/lib/types";

/**
 * Plain (non-async) component so it can render from a Server Component page
 * and from the client "load more" list without duplication.
 */
export function PostCard({
  post,
  priority = false,
}: {
  post: PostWithRelations;
  priority?: boolean;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-card">
      <CardContent className="space-y-3">
        <header className="flex items-center gap-3">
          <Link
            href={`/pets/${post.pet.slug}`}
            className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <PetAvatar
              name={post.pet.name}
              species={post.pet.species}
              src={post.pet.avatar_url}
              size={40}
            />
          </Link>

          <div className="min-w-0 flex-1 leading-tight">
            <Link
              href={`/pets/${post.pet.slug}`}
              className="rounded-sm font-heading text-sm font-bold outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {post.pet.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              posted by {post.author.display_name}
            </p>
          </div>

          <time
            dateTime={post.created_at}
            title={absoluteTime(post.created_at)}
            className="shrink-0 text-xs text-muted-foreground"
          >
            {relativeTime(post.created_at)}
          </time>
        </header>

        <Link
          href={`/posts/${post.id}`}
          className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label={`Open ${post.pet.name}'s post`}
        >
          <PostImages
            images={post.images}
            petName={post.pet.name}
            priority={priority}
          />
        </Link>

        {post.caption ? (
          <p className="text-sm whitespace-pre-line">{post.caption}</p>
        ) : null}

        <Link
          href={`/posts/${post.id}`}
          className="inline-flex items-center gap-1.5 rounded-sm text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <MessageCircle className="size-3.5" aria-hidden />
          View post
        </Link>
      </CardContent>
    </Card>
  );
}
