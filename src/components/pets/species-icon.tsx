import type { ComponentProps } from "react";
import { Bird, Cat, Dog, PawPrint, Rabbit } from "lucide-react";

import type { PetSpecies } from "@/lib/types";

type SpeciesIconProps = ComponentProps<"svg"> & { species: PetSpecies };

/**
 * Switches on the species rather than looking the component up in a map.
 *
 * A map lookup would return a component *created during render*, which React's
 * lint rules reject: a changing component identity remounts the subtree.
 */
export function SpeciesIcon({ species, ...props }: SpeciesIconProps) {
  switch (species) {
    case "dog":
      return <Dog {...props} />;
    case "cat":
      return <Cat {...props} />;
    case "bird":
      return <Bird {...props} />;
    case "rabbit":
      return <Rabbit {...props} />;
    default:
      return <PawPrint {...props} />;
  }
}
