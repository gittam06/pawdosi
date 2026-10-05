import { createClient } from "@/lib/supabase/server";
import type { Pet } from "@/lib/types";

export const SEARCH_LIMIT = 24;

/**
 * Characters that mean something to PostgREST or to `LIKE`, rather than to the
 * person typing.
 *
 * `%`, `_` and `*` are wildcards (PostgREST rewrites `*` to `%`). `"`, `,`,
 * `(`, `)` and `\` are the syntax of a filter *expression*. None of them is
 * plausible in a pet's name or breed, so they are replaced rather than escaped:
 * escaping has to be exactly right every time to be safe, and a space is right
 * by construction.
 *
 * This matters because the previous version built the filter by hand —
 * `or(name.ilike."%<term>%",…)` — and escaped only `%` and `_`. A term
 * containing a double quote closed the value and appended filters of the
 * attacker's choosing, and the wildcard escape did not even work inside a
 * quoted value: searching for `%%` matched every pet in the table.
 */
export function sanitiseSearchTerm(value: string): string {
  return value
    .replace(/[%_*\\"(),]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Pets by name or breed.
 *
 * Two `ilike` queries rather than one `or(...)` string: the column and the
 * pattern go through the query builder as separate, encoded values, so there
 * is no expression for a search term to break out of. Two round trips at this
 * size is a fair price for a query shape that cannot be injected into.
 *
 * The honest next step is a generated tsvector column with a GIN index — worth
 * doing when the table is large enough for the sequential scans to show up,
 * not before.
 */
export async function searchPets(query: string): Promise<Pet[]> {
  const term = sanitiseSearchTerm(query);
  if (term.length < 2) return [];

  const pattern = `%${term}%`;
  const supabase = await createClient();

  const byColumn = (column: "name" | "breed") =>
    supabase
      .from("pets")
      .select("*")
      .ilike(column, pattern)
      .order("created_at", { ascending: false })
      .limit(SEARCH_LIMIT);

  const [byName, byBreed] = await Promise.all([
    byColumn("name"),
    byColumn("breed"),
  ]);

  if (byName.error || byBreed.error) {
    console.error("Pet search failed", byName.error ?? byBreed.error);
    return [];
  }

  // A pet matching on both columns must appear once.
  const unique = new Map<string, Pet>();
  for (const pet of [...(byName.data ?? []), ...(byBreed.data ?? [])]) {
    unique.set(pet.id, pet);
  }

  return [...unique.values()]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, SEARCH_LIMIT);
}
