import { cn } from "cn";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarUrl } from "@/lib/cloudinary-url";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((part) => part[0] ?? "").join("");

  return letters.toUpperCase() || "?";
}

type UserAvatarProps = {
  name: string;
  src: string | null;
  /** Rendered size in CSS pixels; also drives the Cloudinary crop. */
  size?: number;
  className?: string;
};

export function UserAvatar({
  name,
  src,
  size = 40,
  className,
}: UserAvatarProps) {
  // Request 2× so the crop stays sharp on high-density screens.
  const url = avatarUrl(src, size * 2);

  return (
    <Avatar
      className={cn("shadow-soft", className)}
      style={{ width: size, height: size }}
    >
      {url ? <AvatarImage src={url} alt={name} /> : null}
      <AvatarFallback className="bg-primary-muted font-heading font-bold text-primary-muted-foreground">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
