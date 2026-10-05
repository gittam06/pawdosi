"use client";

import { useActionState, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { createReportAction } from "@/actions/report";
import { CloudinaryImage } from "@/components/cloudinary-image";
import { CityField } from "@/components/forms/city-field";
import { TextAreaField, TextField } from "@/components/forms/fields";
import { FormAlert } from "@/components/forms/form-alert";
import { SelectField } from "@/components/forms/select-field";
import { SubmitButton } from "@/components/forms/submit-button";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SPECIES } from "@/config/pets";
import { idleState } from "@/lib/action-state";
import type { Pet, ReportType } from "@/lib/types";
import {
  CONTACT_NOTE_LIMIT,
  DESCRIPTION_LIMIT,
} from "@/lib/validations/report";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type UploadedImage = { publicId: string; url: string };

const speciesOptions = SPECIES.map(({ value, label }) => ({ value, label }));

/** Radix forbids an empty SelectItem value, so "none" stands in for it. */
const NOT_MINE = "none";

/** Local-time "YYYY-MM-DDTHH:mm" for a datetime-local input. */
function localDateTimeValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function ReportForm({ pets }: { pets: Pet[] }) {
  const [state, formAction] = useActionState(createReportAction, idleState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  const inputRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<ReportType>("lost");
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [species, setSpecies] = useState("");
  const [petId, setPetId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [contactNote, setContactNote] = useState("");
  const [lastSeenAt, setLastSeenAt] = useState(() =>
    localDateTimeValue(new Date()),
  );

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
        body: JSON.stringify({ folder: "report" }),
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
      // The signature covers this id, so it cannot be altered here.
      body.append("public_id", sign.publicId);
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
      setImage({ publicId: asset.public_id, url: asset.secure_url });
    } catch (error) {
      console.error("Report image upload failed", error);
      toast.error(
        error instanceof Error ? error.message : "That upload did not work.",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isLost = type === "lost";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="petId" value={petId} />
      <input
        type="hidden"
        name="image"
        value={image ? JSON.stringify(image) : ""}
      />

      <FormAlert state={state} />

      {/* Type first: it changes the wording of everything below it. */}
      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 text-sm font-medium">
          What are you reporting?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <TypeOption
            active={isLost}
            title="A pet is lost"
            description="Yours or one you know"
            onSelect={() => setType("lost")}
          />
          <TypeOption
            active={!isLost}
            title="I found a pet"
            description="Help find its family"
            onSelect={() => setType("found")}
          />
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="report-photo">Photo</Label>

        {image ? (
          <div className="relative size-32 overflow-hidden rounded-xl bg-muted">
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
              onClick={() => setImage(null)}
            >
              <X className="size-3.5" aria-hidden />
            </Button>
          </div>
        ) : null}

        <Button
          id="report-photo"
          type="button"
          variant="outline"
          size="lg"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <ImagePlus aria-hidden />
          )}
          {image ? "Replace photo" : "Add a photo"}
        </Button>

        <p className="text-xs text-muted-foreground">
          Optional, but a photo is the single most useful thing on a report.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="sr-only"
          aria-label="Choose a photo"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>

      <TextField
        name="title"
        label="Headline"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={
          isLost ? "Missing beagle near Indiranagar" : "Found a tabby cat"
        }
        required
        errors={fieldErrors?.title}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          name="species"
          label="Species"
          options={speciesOptions}
          value={species}
          onValueChange={setSpecies}
          placeholder="Pick a species"
          required
          errors={fieldErrors?.species}
        />

        {isLost && pets.length > 0 ? (
          /* Radix rejects an empty SelectItem value, so "none" is a sentinel
             and the real value is posted through a hidden input. */
          <SelectField
            name="petChoice"
            label="Which of your pets?"
            options={[
              { value: NOT_MINE, label: "Not one of mine" },
              ...pets.map((pet) => ({ value: pet.id, label: pet.name })),
            ]}
            value={petId || NOT_MINE}
            onValueChange={(value) => setPetId(value === NOT_MINE ? "" : value)}
            hint="Links the report to that pet's profile."
            errors={fieldErrors?.petId}
          />
        ) : null}
      </div>

      <TextAreaField
        name="description"
        label="Details"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={5}
        maxLength={DESCRIPTION_LIMIT}
        placeholder={
          isLost
            ? "Colour, collar, markings, temperament — anything that helps someone recognise them."
            : "Where exactly, what condition, any collar or tag, and where the pet is now."
        }
        required
        hint={`${description.length}/${DESCRIPTION_LIMIT} characters.`}
        errors={fieldErrors?.description}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <CityField
          value={city}
          onChange={setCity}
          required
          errors={fieldErrors?.city}
        />

        <TextField
          name="locality"
          label="Area"
          value={locality}
          onChange={(event) => setLocality(event.target.value)}
          placeholder="Indiranagar, 12th Main"
          hint="Specific enough for a neighbour to recognise."
          required
          errors={fieldErrors?.locality}
        />
      </div>

      <TextField
        name="lastSeenAt"
        label={isLost ? "Last seen" : "Found at"}
        type="datetime-local"
        value={lastSeenAt}
        onChange={(event) => setLastSeenAt(event.target.value)}
        max={localDateTimeValue(new Date())}
        required
        errors={fieldErrors?.lastSeenAt}
      />

      <TextField
        name="contactNote"
        label="How should people reach you?"
        value={contactNote}
        onChange={(event) => setContactNote(event.target.value)}
        maxLength={CONTACT_NOTE_LIMIT}
        placeholder="WhatsApp 98xxxxxx12, evenings"
        hint="Shown publicly on the report. Share only what you are comfortable with."
        errors={fieldErrors?.contactNote}
      />

      <SubmitButton
        size="lg"
        className="h-10"
        disabled={isUploading}
        pendingLabel="Publishing…"
      >
        Publish report
      </SubmitButton>
    </form>
  );
}

function TypeOption({
  active,
  title,
  description,
  onSelect,
}: {
  active: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        "rounded-xl border p-3 text-left transition-colors outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-primary bg-primary-muted text-primary-muted-foreground"
          : "border-border hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <span className="block font-heading text-sm font-bold">{title}</span>
      <span className="block text-xs text-muted-foreground">{description}</span>
    </button>
  );
}
