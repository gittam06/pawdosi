/**
 * Delivery-URL helpers. No secrets here — safe in client components.
 *
 * Cloudinary transformations are expressed in the URL path, so resizing is a
 * string edit rather than a round trip: the CDN renders and caches the variant
 * on first request.
 */

const UPLOAD_SEGMENT = "/upload/";

function isCloudinaryUrl(url: string): boolean {
  return (
    url.startsWith("https://res.cloudinary.com/") &&
    url.includes(UPLOAD_SEGMENT)
  );
}

export function cloudinaryTransform(
  url: string,
  transformation: string,
): string {
  if (!isCloudinaryUrl(url)) return url;

  return url.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}${transformation}/`);
}

/**
 * Square, face-aware crop for avatars.
 *
 * `f_auto,q_auto` lets Cloudinary pick the format and quality per browser;
 * `g_face` keeps the animal (or person) in frame when cropping.
 */
export function avatarUrl(url: string | null, size: number): string | null {
  if (!url) return null;

  return cloudinaryTransform(
    url,
    `f_auto,q_auto,c_fill,g_face,w_${size},h_${size}`,
  );
}
