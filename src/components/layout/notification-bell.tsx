import Link from "next/link";
import { Bell } from "lucide-react";

import { countUnreadNotifications } from "@/lib/notifications";

/**
 * Server component, so the badge is correct on first paint rather than
 * appearing a moment later.
 */
export async function NotificationBell() {
  const unread = await countUnreadNotifications();
  const label =
    unread === 0 ? "Notifications" : `Notifications, ${unread} unread`;

  return (
    <Link
      href="/notifications"
      aria-label={label}
      className="relative inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Bell className="size-5" aria-hidden />
      {unread > 0 ? (
        <span
          aria-hidden
          className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-alert px-1 text-[0.625rem] leading-4 font-bold text-alert-foreground"
        >
          {unread > 9 ? "9+" : unread}
        </span>
      ) : null}
    </Link>
  );
}
