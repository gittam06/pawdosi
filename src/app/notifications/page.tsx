import type { Metadata } from "next";
import { Bell, TriangleAlert } from "lucide-react";

import { markAllNotificationsReadAction } from "@/actions/notification";
import { EmptyState } from "@/components/empty-state";
import { SubmitButton } from "@/components/forms/submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { NotificationItem } from "@/components/notifications/notification-item";
import { requireOnboardedProfile } from "@/lib/auth";
import { listNotifications } from "@/lib/notifications";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const profile = await requireOnboardedProfile();
  const [notifications, { error }] = await Promise.all([
    listNotifications(profile.id),
    searchParams,
  ]);

  const unread = notifications.filter((item) => item.read_at === null).length;

  return (
    <div className="mx-auto w-full max-w-feed px-4 py-8 sm:px-6">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unread === 0 ? "You are all caught up." : `${unread} unread.`}
          </p>
        </div>

        {unread > 0 ? (
          /* A plain form post, so this works without client JS. */
          <form action={markAllNotificationsReadAction}>
            <SubmitButton
              variant="outline"
              size="lg"
              className="h-10"
              pendingLabel="Marking…"
            >
              Mark all read
            </SubmitButton>
          </form>
        ) : null}
      </header>

      {error ? (
        <Alert
          role="alert"
          className="mb-4 border-destructive/30 bg-destructive/10 text-destructive"
        >
          <TriangleAlert className="size-4" aria-hidden />
          <AlertDescription className="text-current">
            We could not update your notifications. Please try again.
          </AlertDescription>
        </Alert>
      ) : null}

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nothing yet"
          description="Likes, comments and new followers on your pets will show up here."
        />
      ) : (
        <ul className="space-y-1">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
