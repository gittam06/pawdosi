import { createClient } from "@/lib/supabase/server";
import type { Pet } from "@/lib/types";

export const SEARCH_LIMIT = 24;

/**
 * Escapes the wildcards PostgREST's `ilike` would otherwise honour, so a user
 * typing "%" searches for a literal percent sign rather than matching the
 * whole table.
 */
function escapeLike(value: string): string {
  return value.replace(/[%_]/g, (match) => `\\${match}`);
}

/**
 * Pets by name or breed.
 *
 * `or(...)` with two ilike patterns is enough at this size. The honest next
 * step is a generated tsvector column with a GIN index — worth doing when the
 * table is large enough for the sequential scan to show up, not before.
 */
export async function searchPets(query: string): Promise<Pet[]> {
  const term = query.trim();
  if (term.length < 2) return [];

  const pattern = `%${escapeLike(term)}%`;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .or(`name.ilike."${pattern}",breed.ilike."${pattern}"`)
    .order("created_at", { ascending: false })
    .limit(SEARCH_LIMIT);

  if (error) {
    console.error("Pet search failed", error);
    return [];
  }

  return data ?? [];
}
