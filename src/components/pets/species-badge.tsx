import { HeartHandshake } from "lucide-react";

import { SpeciesIcon } from "@/components/pets/species-icon";
import { Badge } from "@/components/ui/badge";
import { speciesLabel } from "@/config/pets";
import type { PetSpecies } from "@/lib/types";

/** Icon plus label — species is never signalled by colour alone. */
export function SpeciesBadge({ species }: { species: PetSpecies }) {
  return (
    <Badge variant="secondary" className="gap-1 rounded-full">
      <SpeciesIcon species={species} className="size-3.5" aria-hidden />
      {speciesLabel(species)}
    </Badge>
  );
}

/**
 * Marks an animal nobody owns. Teal rather than marigold: it is a fact about
 * the animal, not a call to action.
 */
export function CommunityBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-muted px-2.5 py-1 text-xs font-semibold text-teal-muted-foreground">
      <HeartHandshake className="size-3.5" aria-hidden />
      Street animal
    </span>
  );
}
