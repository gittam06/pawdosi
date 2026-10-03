import { cn } from "cn";
import { SpeciesIcon } from "@/components/pets/species-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarUrl } from "@/lib/cloudinary-url";
import type { PetSpecies } from "@/lib/types";

type PetAvatarProps = {
  name: string;
  species: PetSpecies;
  src: string | null;
  /** Rendered size in CSS pixels; also drives the Cloudinary crop. */
  size?: number;
  className?: string;
};

/**
 * Falls back to the species icon rather than initials — a paw silhouette
 * reads better than "BR" on a pet card.
 */
export function PetAvatar({
  name,
  species,
  src,
  size = 48,
  className,
}: PetAvatarProps) {
  // Request 2x so the crop stays sharp on high-density screens.
  const url = avatarUrl(src, size * 2);

  return (
    <Avatar
      className={cn("shadow-soft", className)}
      style={{ width: size, height: size }}
    >
      {url ? <AvatarImage src={url} alt={name} /> : null}
      <AvatarFallback className="bg-primary-muted text-primary-muted-foreground">
        <SpeciesIcon
          species={species}
          style={{ width: size * 0.5, height: size * 0.5 }}
          aria-hidden
        />
      </AvatarFallback>
    </Avatar>
  );
}
