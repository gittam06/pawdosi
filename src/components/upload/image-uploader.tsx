"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { idleState, type ActionState } from "@/lib/action-state";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type SignResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

type UploadAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

type ImageUploaderProps = {
  /** Which signed folder to upload into. */
  folder: "avatar" | "pet" | "post" | "report";
  currentUrl: string | null;
  /** Rendered preview of the current image. */
  preview: ReactNode;
  /** Extra fields every action call needs, e.g. `{ petId }`. */
  hiddenFields?: Record<string, string>;
  onUpload: UploadAction;
  onRemove: UploadAction;
  uploadLabel?: string;
  replaceLabel?: string;
};

/**
 * Signed direct upload: the browser asks our server for a signature, then
 * sends the file straight to Cloudinary. The file never passes through the
 * Next.js server, which keeps the function fast and well under its body limit.
 *
 * Client-side type and size checks are courtesy only — the Server Action
 * re-verifies the asset with Cloudinary before storing anything.
 */
export function ImageUploader({
  folder,
  currentUrl,
  preview,
  hiddenFields,
  onUpload,
  onRemove,
  uploadLabel = "Upload photo",
  replaceLabel = "Change photo",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const busy = isPending || isUploading;

  function withHiddenFields(formData: FormData): FormData {
    for (const [key, value] of Object.entries(hiddenFields ?? {})) {
      formData.append(key, value);
    }

    return formData;
  }

  function report(result: ActionState, fallback: string) {
    if (result.status === "error") {
      toast.error(result.message);
      return false;
    }

    toast.success(
      result.status === "success" && result.message ? result.message : fallback,
    );
    return true;
  }

  async function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Pick a JPEG, PNG, WebP or AVIF image.");
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error("That image is larger than 5 MB.");
      return;
    }

    setIsUploading(true);

    try {
      const signResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });

      if (!signResponse.ok) {
        const { error } = await signResponse.json().catch(() => ({}));
        throw new Error(error ?? "Could not start the upload.");
      }

      const sign: SignResponse = await signResponse.json();

      const upload = new FormData();
      upload.append("file", file);
      upload.append("api_key", sign.apiKey);
      upload.append("timestamp", String(sign.timestamp));
      upload.append("folder", sign.folder);
      upload.append("signature", sign.signature);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
        { method: "POST", body: upload },
      );

      if (!uploadResponse.ok) throw new Error("Cloudinary rejected the image.");

      const asset: { public_id: string; secure_url: string } =
        await uploadResponse.json();

      const payload = withHiddenFields(new FormData());
      payload.append("publicId", asset.public_id);
      payload.append("url", asset.secure_url);

      if (report(await onUpload(idleState, payload), "Photo updated.")) {
        startTransition(() => router.refresh());
      }
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error(
        error instanceof Error ? error.message : "That upload did not work.",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await onRemove(
        idleState,
        withHiddenFields(new FormData()),
      );

      if (report(result, "Photo removed.")) router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4">
      {preview}

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Upload aria-hidden />
            )}
            {currentUrl ? replaceLabel : uploadLabel}
          </Button>

          {currentUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              disabled={busy}
              onClick={handleRemove}
            >
              <Trash2 aria-hidden />
              Remove
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP or AVIF. Up to 5 MB.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        aria-label="Choose an image"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
