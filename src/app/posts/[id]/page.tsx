import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DeletePostDialog } from "@/components/posts/delete-post-dialog";
import { PostImages } from "@/components/posts/post-images";
import { PetAvatar } from "@/components/pets/pet-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { cloudinaryTransform } from "@/lib/cloudinary-url";
import { getPostById } from "@/lib/posts";
import { absoluteTime, relativeTime } from "@/lib/relative-time";

type PostPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) return { title: "Post not found" };

  const title = `${post.pet.name} on PawPals`;
  const description = post.caption ?? `A moment shared by ${post.pet.name}.`;
  const [first] = post.images;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.created_at,
      images: first
        ? [
            {
              url: cloudinaryTransform(
                first.url,
                "f_auto,q_auto,c_fill,g_auto,w_1200,h_630",
              ),
              width: 1200,
              height: 630,
            },
          ]
        : undefined,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) notFound();

  const user = await getCurrentUser();
  const isAuthor = user?.id === post.author_id;

  return (
    <div className="mx-auto w-full max-w-feed px-4 py-8 sm:px-6">
      <Card className="overflow-hidden rounded-2xl shadow-card">
        <CardContent className="space-y-4">
          <header className="flex items-center gap-3">
            <Link
              href={`/pets/${post.pet.slug}`}
              className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <PetAvatar
                name={post.pet.name}
                species={post.pet.species}
                src={post.pet.avatar_url}
                size={44}
              />
            </Link>

            <div className="min-w-0 flex-1 leading-tight">
              <h1 className="font-heading text-base font-bold">
                <Link
                  href={`/pets/${post.pet.slug}`}
                  className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {post.pet.name}
                </Link>
              </h1>
              <p className="truncate text-xs text-muted-foreground">
                posted by {post.author.display_name}
                {post.author.username ? ` · @${post.author.username}` : ""}
              </p>
            </div>

            {isAuthor ? <DeletePostDialog postId={post.id} /> : null}
          </header>

          <PostImages images={post.images} petName={post.pet.name} priority />

          {post.caption ? (
            <p className="text-sm whitespace-pre-line">{post.caption}</p>
          ) : null}

          <time
            dateTime={post.created_at}
            className="block text-xs text-muted-foreground"
          >
            {absoluteTime(post.created_at)} ({relativeTime(post.created_at)})
          </time>
        </CardContent>
      </Card>
    </div>
  );
}
