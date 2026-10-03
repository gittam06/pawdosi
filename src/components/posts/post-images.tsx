import { cn } from "cn";
import { CloudinaryImage } from "@/components/cloudinary-image";
import type { PostImage } from "@/lib/types";

/**
 * Layout by count: one image keeps its own aspect ratio (capped so a tall
 * photo cannot push the caption off screen); two or more go into a square
 * grid, which is the only arrangement that stays tidy at every width.
 */
export function PostImages({
  images,
  petName,
  priority = false,
}: {
  images: PostImage[];
  petName: string;
  priority?: boolean;
}) {
  if (images.length === 0) return null;

  const alt = (index: number) =>
    images.length === 1
      ? `Photo of ${petName}`
      : `Photo ${index + 1} of ${images.length} of ${petName}`;

  if (images.length === 1) {
    const [image] = images;

    return (
      <div className="overflow-hidden rounded-xl bg-muted">
        <CloudinaryImage
          src={image.url}
          alt={alt(0)}
          width={image.width}
          height={image.height}
          transformation="c_limit,w_1200"
          sizes="(max-width: 640px) 100vw, 560px"
          priority={priority}
          className="max-h-[70vh] w-full object-contain"
        />
      </div>
    );
  }

  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-1 overflow-hidden rounded-xl bg-muted",
        images.length === 3 && "grid-rows-2",
      )}
    >
      {images.map((image, index) => (
        <li
          key={image.id}
          className={cn(
            "relative aspect-square",
            // Three images: the first spans the full height of the left column.
            images.length === 3 && index === 0 && "row-span-2 aspect-auto",
          )}
        >
          <CloudinaryImage
            src={image.url}
            alt={alt(index)}
            width={600}
            height={600}
            transformation="c_fill,g_auto,w_600,h_600"
            sizes="(max-width: 640px) 50vw, 280px"
            priority={priority && index === 0}
            className="size-full"
          />
        </li>
      ))}
    </ul>
  );
}
