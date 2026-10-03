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
