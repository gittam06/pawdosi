import { createClient } from "@/lib/supabase/server";
import type { Pet, PetWithOwner } from "@/lib/types";

/**
 * Pet reads. Every query here runs under RLS as the requesting user, so a
 * "public" select really is only what the public may see.
 */

const OWNER_COLUMNS = "id, username, display_name, avatar_url";

export async function getPetBySlug(slug: string): Promise<PetWithOwner | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pets")
    .select(`*, owner:profiles!pets_owner_id_fkey(${OWNER_COLUMNS})`)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to load pet", error);
    return null;
  }

  return data as PetWithOwner | null;
}

export async function listPetsByOwner(ownerId: string): Promise<Pet[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load pets", error);
    return [];
  }

  return data ?? [];
}

export async function countPetsByOwner(ownerId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("pets")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId);

  if (error) {
    console.error("Failed to count pets", error);
    return 0;
  }

  return count ?? 0;
}
