import Link from "next/link";

import { PetAvatar } from "@/components/pets/pet-avatar";
import { SpeciesBadge } from "@/components/pets/species-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatAge } from "@/lib/pet-age";
import type { Pet } from "@/lib/types";

/** Grid tile for a pet. The whole card is one link target. */
export function PetCard({ pet }: { pet: Pet }) {
  const age = formatAge(pet.birth_date);
  const detail = [pet.breed, age].filter(Boolean).join(" · ");

  return (
    <Card className="relative rounded-2xl shadow-card transition-shadow focus-within:shadow-lift hover:shadow-lift">
      <CardContent className="flex items-center gap-3">
        <PetAvatar
          name={pet.name}
          species={pet.species}
          src={pet.avatar_url}
          size={56}
        />

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate font-heading text-base font-bold">
            <Link
              href={`/pets/${pet.slug}`}
              // Stretched link: the card is the hit area, the heading keeps
              // the accessible name.
              className="outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
            >
              {pet.name}
            </Link>
          </h3>
          {detail ? (
            <p className="truncate text-xs text-muted-foreground">{detail}</p>
          ) : null}
        </div>

        <SpeciesBadge species={pet.species} />
      </CardContent>
    </Card>
  );
}
