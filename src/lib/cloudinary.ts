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

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

/**
 * Signs a direct browser upload.
 *
 * Only the parameters signed here can be used by the client — Cloudinary
 * rejects the request if the browser adds or changes anything else. That is
 * what keeps an upload pinned to our folder.
 */
export function signUpload(folderKey: CloudinaryFolderKey): UploadSignature {
  const client = configured();
  const env = cloudinaryEnv();

  const folder = CLOUDINARY_FOLDERS[folderKey];
  const timestamp = Math.round(Date.now() / 1000);

  const signature = client.utils.api_sign_request(
    { folder, timestamp },
    env.CLOUDINARY_API_SECRET,
  );

  return {
    cloudName: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  };
}

export type AssetCheck =
  | { ok: true; url: string; width: number; height: number }
  | { ok: false; reason: string };

/**
 * Verifies an asset the browser claims to have uploaded.
 *
 * The client reports its own `public_id`, so nothing it says is trusted: we
 * ask Cloudinary what actually landed, and reject (and delete) anything that
 * is not a reasonably sized image inside the expected folder.
 */
export async function verifyUploadedImage(
  publicId: string,
  folderKey: CloudinaryFolderKey,
): Promise<AssetCheck> {
  const expectedPrefix = `${CLOUDINARY_FOLDERS[folderKey]}/`;

  if (!publicId.startsWith(expectedPrefix)) {
    return { ok: false, reason: "That upload is not in the expected folder." };
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
