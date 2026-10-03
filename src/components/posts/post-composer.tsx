"use client";

import { useActionState, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { createPostAction } from "@/actions/post";
import { TextAreaField } from "@/components/forms/fields";
import { FormAlert } from "@/components/forms/form-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { Button } from "@/components/ui/button";
import { idleState } from "@/lib/action-state";
import type { Pet } from "@/lib/types";
import { CAPTION_LIMIT, MAX_POST_IMAGES } from "@/lib/validations/post";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type UploadedImage = { publicId: string; url: string };

export function PostComposer({ pets }: { pets: Pet[] }) {
  const [state, formAction] = useActionState(createPostAction, idleState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const remaining = MAX_POST_IMAGES - images.length;

  async function uploadOne(file: File): Promise<UploadedImage | null> {
    const signResponse = await fetch("/api/cloudinary/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder: "post" }),
    });

    if (!signResponse.ok) {
      const { error } = await signResponse.json().catch(() => ({}));
      throw new Error(error ?? "Could not start the upload.");
    }

    const sign = await signResponse.json();

    const body = new FormData();
    body.append("file", file);
    body.append("api_key", sign.apiKey);
    body.append("timestamp", String(sign.timestamp));
    body.append("folder", sign.folder);
    body.append("signature", sign.signature);

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
      { method: "POST", body },
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json().catch(() => null);
      throw new Error(
        error?.error?.message
          ? `Cloudinary rejected the image: ${error.error.message}`
          : "Cloudinary rejected the image.",
      );
    }

    const asset = await uploadResponse.json();
    return { publicId: asset.public_id, url: asset.secure_url };
  }

  async function handleFiles(files: FileList) {
    // Uploading happens before submit, so the Server Action only ever sees
    // ids it can verify — and the user sees the photo before committing.
    const picked = Array.from(files).slice(0, remaining);
    if (picked.length === 0) return;

    const valid = picked.filter((file) => {
      if (!ACCEPTED.includes(file.type)) {
        toast.error(`${file.name}: use JPEG, PNG, WebP or AVIF.`);
        return false;
      }

      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is larger than 5 MB.`);
        return false;
      }

      return true;
    });

    if (valid.length === 0) return;

    setIsUploading(true);

    try {
      const uploaded = await Promise.all(valid.map(uploadOne));
      setImages((current) => [
        ...current,
        ...uploaded.filter((image): image is UploadedImage => image !== null),
      ]);
    } catch (error) {
      console.error("Post image upload failed", error);
      toast.error(
        error instanceof Error ? error.message : "That upload did not work.",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(publicId: string) {
    // The asset stays in Cloudinary until the post is created or abandoned;
    // unreferenced uploads are cleaned up by the action on failure.
    setImages((current) =>
      current.filter((image) => image.publicId !== publicId),
    );
  }

  const petOptions = pets.map((pet) => ({ value: pet.id, label: pet.name }));

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <FormAlert state={state} />

      <SelectField
        name="petId"
        label="Posting as"
        options={petOptions}
        defaultValue={pets.length === 1 ? pets[0].id : undefined}
        placeholder="Pick a pet"
        required
        errors={fieldErrors?.petId}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium">Photos</p>

        {images.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {images.map((image) => (
              <li
                key={image.publicId}
                className="relative aspect-square overflow-hidden rounded-xl bg-muted"
              >
                <CloudinaryImage
                  src={image.url}
                  alt=""
                  width={300}
                  height={300}
                  transformation="c_fill,g_auto,w_300,h_300"
                  className="size-full"
                />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="secondary"
                  className="absolute top-1 right-1"
                  aria-label="Remove this photo"
                  onClick={() => removeImage(image.publicId)}
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
        ) : null}

        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={isUploading || remaining === 0}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <ImagePlus aria-hidden />
          )}
          {images.length === 0 ? "Add photos" : `Add more (${remaining} left)`}
        </Button>

        <p className="text-xs text-muted-foreground">
          Up to {MAX_POST_IMAGES} photos, 5 MB each.
        </p>

        {fieldErrors?.images ? (
          <ul role="alert" className="text-xs font-medium text-destructive">
            {fieldErrors.images.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          className="sr-only"
          aria-label="Choose photos"
          onChange={(event) => {
            if (event.target.files) void handleFiles(event.target.files);
          }}
        />
      </div>

      <TextAreaField
        name="caption"
        label="Caption"
        value={caption}
        onChange={(event) => setCaption(event.target.value)}
        rows={4}
        maxLength={CAPTION_LIMIT}
        placeholder="What happened?"
        hint={`${caption.length}/${CAPTION_LIMIT} characters. Optional.`}
        errors={fieldErrors?.caption}
      />

      <SubmitButton
        size="lg"
        className="h-10"
        disabled={images.length === 0 || isUploading}
        pendingLabel="Publishing…"
      >
        Publish post
      </SubmitButton>
    </form>
  );
}
