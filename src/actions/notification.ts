"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireOnboardedProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/**
 * Marks everything unread as read.
 *
 * Takes only FormData so it can be a plain `<form action>` on a Server
 * Component — this works with JavaScript disabled, which `useActionState`
 * would not. Failure is reported by redirecting back with a flag rather than
 * by returning state, which a single-argument action cannot do.
 *
 * RLS already scopes the update to the caller; the explicit `user_id` filter
 * keeps the index in play and the intent legible.
 */
export async function markAllNotificationsReadAction(
  _formData: FormData,
): Promise<void> {
  const profile = await requireOnboardedProfile();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", profile.id)
    .is("read_at", null);

  if (error) {
    console.error("Failed to mark notifications read", error);
    redirect("/notifications?error=mark-read");
  }

  revalidatePath("/", "layout");
  redirect("/notifications");
}
