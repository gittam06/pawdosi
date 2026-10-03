import { z } from "zod";

const trimmed = z.string().trim();

export const MAX_POST_IMAGES = 4;
export const CAPTION_LIMIT = 2200;

/** One uploaded image, as reported by the browser and re-checked server-side. */
export const postImageSchema = z.object({
  publicId: trimmed.min(1).max(200),
  url: z.url(),
});

export const postSchema = z.object({
  petId: z.uuid("Pick which pet is posting."),
  caption: trimmed
    .max(CAPTION_LIMIT, `At most ${CAPTION_LIMIT} characters.`)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  images: z
    .array(postImageSchema)
    .min(1, "Add at least one photo.")
    .max(MAX_POST_IMAGES, `At most ${MAX_POST_IMAGES} photos.`),
});

export type PostInput = z.infer<typeof postSchema>;

/**
 * Images arrive as a JSON string in the form body — FormData has no nested
 * values. Bad JSON is a validation failure, not an exception.
 */
export function parseImagesField(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string" || value.length === 0) return [];

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
