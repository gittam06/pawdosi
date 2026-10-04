import type { Metadata } from "next";
import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PetSearch } from "@/components/layout/pet-search";
import { PetCard } from "@/components/pets/pet-card";
import { searchPets } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search",
  description: "Find pets on Pawdosi by name or breed.",
};

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (raw ?? "").trim();

  const pets = query.length >= 2 ? await searchPets(query) : [];

  return (
    <div className="mx-auto w-full max-w-page px-4 py-8 sm:px-6">
      <header className="mb-6 space-y-3">
        <h1 className="font-heading text-2xl font-bold">Search pets</h1>
        <PetSearch className="max-w-sm" />
        {query ? (
          <p className="text-sm text-muted-foreground">
            {pets.length === 0
              ? `Nothing found for “${query}”.`
              : `${pets.length} ${pets.length === 1 ? "pet" : "pets"} matching “${query}”.`}
          </p>
        ) : null}
      </header>

      {query.length < 2 ? (
        <EmptyState
          icon={SearchX}
          title="Search by name or breed"
          description="Type at least two characters — “Bruno”, “beagle”, “indie”."
        />
      ) : pets.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matches"
          description="Try a shorter word, or a breed instead of a name."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <li key={pet.id}>
              <PetCard pet={pet} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
