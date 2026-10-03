import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { NotificationWithActor } from "@/lib/types";

export const NOTIFICATIONS_PAGE_SIZE = 30;

const NOTIFICATION_SELECT = `
  *,
  actor:profiles!notifications_actor_id_fkey(id, username, display_name, avatar_url),
  pet:pets!notifications_pet_id_fkey(id, name, slug)
`;

/**
 * RLS restricts these to the recipient, so no user filter is needed here —
 * but one is added anyway so the index is used and the intent is readable.
 */
export async function listNotifications(
  userId: string,
): Promise<NotificationWithActor[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(NOTIFICATIONS_PAGE_SIZE);

  if (error) {
    console.error("Failed to load notifications", error);
    return [];
  }

  return data as unknown as NotificationWithActor[];
}

/**
 * Unread count for the header badge. `head: true` fetches no rows, and the
 * partial index on (user_id) where read_at is null answers it directly.
 */
export async function countUnreadNotifications(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;

  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  if (error) {
    console.error("Failed to count notifications", error);
    return 0;
  }

  return count ?? 0;
}
