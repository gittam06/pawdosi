import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { DeleteCommentButton } from "@/components/posts/delete-comment-button";
import { UserAvatar } from "@/components/user-avatar";
import { absoluteTime, relativeTime } from "@/lib/relative-time";
import type { CommentWithAuthor } from "@/lib/types";

type CommentListProps = {
  comments: CommentWithAuthor[];
  postId: string;
  /** Comment author or post author — matches the RLS delete policy. */
  viewerId: string | null;
  postAuthorId: string;
};

export function CommentList({
  comments,
  postId,
  viewerId,
  postAuthorId,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <MessageCircle className="size-4" aria-hidden />
        No comments yet. Be the first.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {comments.map((comment) => {
        const canDelete =
          viewerId !== null &&
          (viewerId === comment.user_id || viewerId === postAuthorId);

        return (
          <li key={comment.id} className="flex gap-3 py-3">
            <UserAvatar
              name={comment.author.display_name}
              src={comment.author.avatar_url}
              size={32}
            />

            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="flex flex-wrap items-baseline gap-x-2 text-sm leading-tight">
                <span className="font-heading font-bold">
                  {comment.author.display_name}
                </span>
                {comment.author.username ? (
                  <span className="text-xs text-muted-foreground">
                    @{comment.author.username}
                  </span>
                ) : null}
                <time
                  dateTime={comment.created_at}
                  title={absoluteTime(comment.created_at)}
                  className="text-xs text-muted-foreground"
                >
                  {relativeTime(comment.created_at)}
                </time>
              </p>
              <p className="text-sm whitespace-pre-line">{comment.body}</p>
            </div>

            {canDelete ? (
              <DeleteCommentButton commentId={comment.id} postId={postId} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** Shown to signed-out visitors in place of the comment form. */
export function CommentSignInPrompt() {
  return (
    <p className="text-sm text-muted-foreground">
      <Link
        href="/sign-in"
        className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Sign in
      </Link>{" "}
      to join the conversation.
    </p>
  );
}
