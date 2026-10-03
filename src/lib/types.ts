import type { Database } from "@/lib/supabase/types";

/**
 * App-facing aliases for the generated database types.
 *
 * Import from here, not from the generated file: `npm run db:types`
 * overwrites that file wholesale, and these names stay stable.
 */

type Tables = Database["public"]["Tables"];
type Enums = Database["public"]["Enums"];

export type Profile = Tables["profiles"]["Row"];
export type ProfileInsert = Tables["profiles"]["Insert"];
export type ProfileUpdate = Tables["profiles"]["Update"];

export type Pet = Tables["pets"]["Row"];
export type PetInsert = Tables["pets"]["Insert"];
export type PetUpdate = Tables["pets"]["Update"];

export type PetSpecies = Enums["pet_species"];
export type PetGender = Enums["pet_gender"];

export type Post = Tables["posts"]["Row"];
export type PostImage = Tables["post_images"]["Row"];
export type Follow = Tables["follows"]["Row"];
export type Like = Tables["likes"]["Row"];
export type Comment = Tables["comments"]["Row"];

/** The shape every feed, grid and detail view renders. */
export type PostWithRelations = Post & {
  pet: Pick<Pet, "id" | "name" | "slug" | "species" | "avatar_url">;
  author: Pick<Profile, "id" | "username" | "display_name">;
  images: PostImage[];
  likeCount: number;
  commentCount: number;
  /** False for signed-out visitors; they have nothing to un-like. */
  viewerHasLiked: boolean;
};

export type CommentWithAuthor = Comment & {
  author: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

export type Report = Tables["lost_found_reports"]["Row"];
export type ReportType = Enums["report_type"];
export type ReportStatus = Enums["report_status"];

export type ReportWithReporter = Report & {
  reporter: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  pet: Pick<Pet, "id" | "name" | "slug"> | null;
};

/** Keyset cursor, same shape and reasoning as the post feed's. */
export type ReportCursor = { createdAt: string; id: string };

export type Notification = Tables["notifications"]["Row"];
export type NotificationType = Enums["notification_type"];

export type NotificationWithActor = Notification & {
  actor: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
  pet: Pick<Pet, "id" | "name" | "slug"> | null;
};

/** Keyset cursor. Ordering by created_at alone is not stable under ties. */
export type PostCursor = { createdAt: string; id: string };

/** A pet joined with the profile that owns it — what the public page renders. */
export type PetWithOwner = Pet & {
  owner: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

/** A profile that has been through onboarding — username and city are set. */
export type OnboardedProfile = Profile & { username: string; city: string };

export function isOnboarded(
  profile: Profile | null,
): profile is OnboardedProfile {
  return Boolean(profile?.username && profile.city);
}
