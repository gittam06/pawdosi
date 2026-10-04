import type { Metadata } from "next";
import Link from "next/link";
import { PawPrint, Plus } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PetCard } from "@/components/pets/pet-card";
import { Button } from "@/components/ui/button";
import { MAX_PETS_PER_OWNER } from "@/config/pets";
import { requireOnboardedProfile } from "@/lib/auth";
import { listPetsByOwner } from "@/lib/pets";

export const metadata: Metadata = {
  title: "My pets",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function MyPetsPage() {
  const profile = await requireOnboardedProfile();
  const pets = await listPetsByOwner(profile.id);

  const atLimit = pets.length >= MAX_PETS_PER_OWNER;

  return (
    <div className="mx-auto w-full max-w-page px-4 py-10 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold">My pets</h1>
          <p className="text-sm text-muted-foreground">
            {pets.length === 0
              ? "Your own pets, or the street animals you look after — each gets a profile and its own followers."
              : `${pets.length} of ${MAX_PETS_PER_OWNER} profiles used.`}
          </p>
        </div>

        {pets.length > 0 && !atLimit ? (
          <Button asChild className="h-10">
            <Link href="/pets/new">
              <Plus aria-hidden />
              Add a pet
            </Link>
          </Button>
        ) : null}
      </header>

      {pets.length === 0 ? (
        <EmptyState
          icon={PawPrint}
          title="No profiles yet"
          description="Add your own pet — or the street dog on your road who already has a name and four people feeding her. Both get a profile people can follow."
          action={
            <Button asChild className="mt-1 h-10">
              <Link href="/pets/new">
                <Plus aria-hidden />
                Add an animal
              </Link>
            </Button>
          }
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
