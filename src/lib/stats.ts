import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import type { Pet } from "@/lib/types";

/**
 * Numbers for the landing page.
 *
 * Deliberately cheap: three head-only counts and one small select. Every one
 * degrades to zero rather than throwing, because a database hiccup should
 * cost the marketing page a strip, not the whole render.
 */

export type CommunityStats = {
  pets: number;
  posts: number;
  openReports: number;
  reunited: number;
  recentPets: Pet[];
};

const EMPTY: CommunityStats = {
  pets: 0,
  posts: 0,
  openReports: 0,
  reunited: 0,
  recentPets: [],
};

export async function getCommunityStats(): Promise<CommunityStats> {
  if (!supabaseConfigured()) return EMPTY;

  const supabase = await createClient();

  const [pets, posts, openReports, reunited, recent] = await Promise.all([
    supabase.from("pets").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase
      .from("lost_found_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("lost_found_reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "reunited"),
    supabase
      .from("pets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  return {
    pets: pets.count ?? 0,
    posts: posts.count ?? 0,
    openReports: openReports.count ?? 0,
    reunited: reunited.count ?? 0,
    recentPets: recent.data ?? [],
  };
}
