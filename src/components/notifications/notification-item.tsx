import Link from "next/link";
import { Heart, MessageCircle, UserPlus } from "lucide-react";

import { cn } from "cn";
import { UserAvatar } from "@/components/user-avatar";
import { absoluteTime, relativeTime } from "@/lib/relative-time";
import type { NotificationWithActor } from "@/lib/types";

/**
 * Switch, not a map lookup: a component chosen out of an object at render time
 * is a component created during render.
 */
function NotificationIcon({ type }: { type: NotificationWithActor["type"] }) {
  switch (type) {
    case "like":
      return <Heart className="size-3.5 fill-current" aria-hidden />;
    case "comment":
      return <MessageCircle className="size-3.5" aria-hidden />;
    default:
      return <UserPlus className="size-3.5" aria-hidden />;
  }
}

function describe(notification: NotificationWithActor): string {
  switch (notification.type) {
    case "like":
      return "liked your post";
    case "comment":
      return "commented on your post";
    default:
      return notification.pet
        ? `started following ${notification.pet.name}`
        : "followed one of your pets";
  }
}

function linkFor(notification: NotificationWithActor): string {
  if (notification.post_id) return `/posts/${notification.post_id}`;
  if (notification.pet) return `/pets/${notification.pet.slug}`;

  return "/notifications";
}

export function NotificationItem({
  notification,
}: {
  notification: NotificationWithActor;
}) {
  const isUnread = notification.read_at === null;

  return (
    <li
      className={cn(
        "relative flex items-start gap-3 rounded-xl px-3 py-3 transition-colors",
        isUnread ? "bg-primary-muted/40" : "hover:bg-muted/60",
      )}
    >
      <div className="relative shrink-0">
        <UserAvatar
          name={notification.actor.display_name}
          src={notification.actor.avatar_url}
          size={36}
        />
        <span
          className={cn(
            "absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full ring-2 ring-background",
            notification.type === "like"
              ? "bg-alert-muted text-alert-muted-foreground"
              : notification.type === "comment"
                ? "bg-teal-muted text-teal-muted-foreground"
                : "bg-primary-muted text-primary-muted-foreground",
          )}
        >
          <NotificationIcon type={notification.type} />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">
          <span className="font-heading font-bold">
            {notification.actor.display_name}
          </span>{" "}
          {describe(notification)}
        </p>
        <time
          dateTime={notification.created_at}
          title={absoluteTime(notification.created_at)}
          className="text-xs text-muted-foreground"
        >
          {relativeTime(notification.created_at)}
        </time>
      </div>

      {isUnread ? (
        <span
          className="mt-2 size-2 shrink-0 rounded-full bg-primary"
          aria-label="Unread"
        />
      ) : null}

      <Link
        href={linkFor(notification)}
        className="absolute inset-0 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="sr-only">
          {notification.actor.display_name} {describe(notification)}
        </span>
      </Link>
    </li>
  );
}
