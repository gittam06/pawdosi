"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { removeAvatarAction, updateAvatarAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { idleState } from "@/lib/action-state";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type SignResponse = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

type AvatarUploaderProps = {
  name: string;
  currentUrl: string | null;
};

/**
 * Signed direct upload: the browser asks our server for a signature, then
 * sends the file straight to Cloudinary. The file never passes through the
 * Next.js server, which keeps the function fast and well under its body limit.
 */
export function AvatarUploader({ name, currentUrl }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  const busy = isPending || isUploading;

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
        body: JSON.stringify({ folder: "avatar" }),
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

      const payload = new FormData();
      payload.append("publicId", asset.public_id);
      payload.append("url", asset.secure_url);

      const result = await updateAvatarAction(idleState, payload);

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(
        result.status === "success" && result.message
          ? result.message
          : "Photo updated.",
      );
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Avatar upload failed", error);
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
      const result = await removeAvatarAction();

      if (result.status === "error") {
        toast.error(result.message);
        return;
      }

      toast.success(
        result.status === "success" && result.message
          ? result.message
          : "Photo removed.",
      );
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-4">
      <UserAvatar name={name} src={currentUrl} size={72} />

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
            {currentUrl ? "Change photo" : "Upload photo"}
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
        aria-label="Choose a profile photo"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
