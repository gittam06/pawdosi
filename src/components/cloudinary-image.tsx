import Image from "next/image";

import { cn } from "cn";
import { cloudinaryTransform } from "@/lib/cloudinary-url";

type CloudinaryImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Cloudinary transformation string, e.g. "c_fill,w_800,h_800". */
  transformation?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Cloudinary already resizes and re-encodes on delivery, so Next's optimizer
 * is switched off: running both would re-process an image that is already in
 * the right format and size, and bill for the privilege.
 *
 * `f_auto,q_auto` lets Cloudinary pick AVIF/WebP and a quality per browser.
 */
export function CloudinaryImage({
  src,
  alt,
  width,
  height,
  transformation = "c_limit,w_1200",
  sizes,
  priority,
  className,
}: CloudinaryImageProps) {
  return (
    <Image
      src={cloudinaryTransform(src, `f_auto,q_auto,${transformation}`)}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      unoptimized
      className={cn("object-cover", className)}
    />
  );
}
