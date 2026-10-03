import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { signUpload } from "@/lib/cloudinary";

/**
 * Issues a short-lived signature for a direct browser → Cloudinary upload.
 *
 * The secret never leaves the server, and the signature covers the folder, so
 * a caller cannot redirect the upload somewhere else in the account.
 */

const bodySchema = z.object({
  folder: z.enum(["avatar", "pet", "post", "report"]),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Sign in to upload images." },
      { status: 401 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload request." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(signUpload(parsed.data.folder));
  } catch (error) {
    console.error("Failed to sign Cloudinary upload", error);

    return NextResponse.json(
      { error: "Image uploads are not configured." },
      { status: 500 },
    );
  }
}
