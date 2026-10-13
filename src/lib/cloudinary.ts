import { v2 as cloudinary } from "cloudinary";

import { cloudinaryEnv } from "@/lib/env";

/**
 * Server-side Cloudinary access. `cloudinaryEnv()` throws if this module is
 * ever pulled into a client bundle, so the API secret cannot leak.
 */

/** Every asset we create lives under one of these prefixes. */
export const CLOUDINARY_FOLDERS = {
  avatar: "pawdosi/avatars",
  pet: "pawdosi/pets",
  post: "pawdosi/posts",
  report: "pawdosi/reports",
} as const;

export type CloudinaryFolderKey = keyof typeof CLOUDINARY_FOLDERS;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
] as const;

function configured() {
  const env = cloudinaryEnv();

  cloudinary.config({
    cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return cloudinary;
}

/**
 * Every asset an uploader owns lives under this prefix.
 *
 * Putting the uploader's id in the path is what makes ownership checkable
 * later: the signature below pins the `public_id`, so the browser cannot move
 * its upload out of its own prefix, and `verifyUploadedImage()` can refuse a
 * `public_id` that belongs to somebody else. Without this, a `public_id` read
 * off any public image URL could be claimed by any signed-in user — and then
 * deleted on their behalf when they replaced "their" photo.
 */
export function assetOwnerPrefix(
  folderKey: CloudinaryFolderKey,
  ownerId: string,
): string {
  return `${CLOUDINARY_FOLDERS[folderKey]}/${ownerId}/`;
}

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  /** The exact id the browser must upload to. Covered by the signature. */
  publicId: string;
  signature: string;
};

/**
 * Signs a direct browser upload.
 *
 * Only the parameters signed here can be used by the client — Cloudinary
 * rejects the request if the browser adds or changes anything else. Signing
 * the full `public_id` (rather than just the folder) is what pins the upload
 * to this user's prefix: the browser can neither rename it nor move it.
 */
export function signUpload(
  folderKey: CloudinaryFolderKey,
  ownerId: string,
): UploadSignature {
  const client = configured();
  const env = cloudinaryEnv();

  const publicId = `${assetOwnerPrefix(folderKey, ownerId)}${crypto.randomUUID()}`;
  const timestamp = Math.round(Date.now() / 1000);

  const signature = client.utils.api_sign_request(
    { public_id: publicId, timestamp },
    env.CLOUDINARY_API_SECRET,
  );

  return {
    cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    timestamp,
    publicId,
    signature,
  };
}

export type AssetCheck =
  | { ok: true; url: string; width: number; height: number }
  | { ok: false; reason: string };

/**
 * Verifies an asset the browser claims to have uploaded.
 *
 * The client reports its own `public_id`, so nothing it says is trusted on two
 * counts. *Whose* it is comes from the path — `signUpload()` pins every upload
 * under `<folder>/<ownerId>/`, so an id outside this caller's prefix was never
 * theirs to claim. *What* it is comes from Cloudinary: we ask what actually
 * landed and reject (and delete) anything that is not a reasonably sized image.
 */
export async function verifyUploadedImage(
  publicId: string,
  folderKey: CloudinaryFolderKey,
  ownerId: string,
): Promise<AssetCheck> {
  if (!publicId.startsWith(assetOwnerPrefix(folderKey, ownerId))) {
    return { ok: false, reason: "That upload is not one of yours." };
  }

  const client = configured();

  try {
    const asset = await client.api.resource(publicId, {
      resource_type: "image",
    });

    if (asset.bytes > MAX_UPLOAD_BYTES) {
      await deleteAsset(publicId);
      return { ok: false, reason: "That image is larger than 5 MB." };
    }

    return {
      ok: true,
      url: asset.secure_url,
      width: asset.width,
      height: asset.height,
    };
  } catch (error) {
    console.error("Cloudinary asset verification failed", error);
    return { ok: false, reason: "We could not verify that upload." };
  }
}

/**
 * Deletes an asset whose id came from the **client**.
 *
 * The clean-up paths in the Server Actions ("that upload was rejected, bin
 * it") run on an id the browser supplied, which is the one thing a delete must
 * never trust: a forged id would turn the rollback into a weapon. This refuses
 * anything outside the caller's own prefix. Ids read back from the database
 * under the owner's RLS are already proven and use `deleteAsset()`.
 */
export async function deleteOwnedAsset(
  publicId: string | null,
  folderKey: CloudinaryFolderKey,
  ownerId: string,
): Promise<void> {
  if (!publicId) return;
  if (!publicId.startsWith(assetOwnerPrefix(folderKey, ownerId))) return;

  await deleteAsset(publicId);
}

/** Best-effort delete. A failure here must never break the user's action. */
export async function deleteAsset(publicId: string | null): Promise<void> {
  if (!publicId) return;

  try {
    await configured().uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset ${publicId}`, error);
  }
}
