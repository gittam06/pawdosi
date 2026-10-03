import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { removePetAvatarAction, updatePetAvatarAction } from "@/actions/pet";
import { DeletePetDialog } from "@/components/pets/delete-pet-dialog";
import { PetAvatar } from "@/components/pets/pet-avatar";
import { PetForm } from "@/components/pets/pet-form";
import { ImageUploader } from "@/components/upload/image-uploader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireOnboardedProfile } from "@/lib/auth";
import { getPetBySlug } from "@/lib/pets";

type EditPetPageProps = { params: Promise<{ slug: string }> };

export const metadata: Metadata = {
  title: "Edit pet",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function EditPetPage({ params }: EditPetPageProps) {
  const { slug } = await params;
  const profile = await requireOnboardedProfile();
  const pet = await getPetBySlug(slug);

  // 404 rather than 403 for someone else's pet: the page's existence is not
  // worth confirming, and the public profile is already reachable anyway.
  if (!pet || pet.owner_id !== profile.id) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href={`/pets/${pet.slug}`}>
          <ArrowLeft aria-hidden />
          {pet.name}
        </Link>
      </Button>

      <div className="space-y-4">
        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Photo</CardTitle>
            <CardDescription>
              A clear, well-lit shot works best — it is cropped to a square.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader
              folder="pet"
              currentUrl={pet.avatar_url}
              hiddenFields={{ petId: pet.id }}
              preview={
                <PetAvatar
                  name={pet.name}
                  species={pet.species}
                  src={pet.avatar_url}
                  size={72}
                />
              }
              onUpload={updatePetAvatarAction}
              onRemove={removePetAvatarAction}
            />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Details</CardTitle>
            <CardDescription>
              The profile link stays {`/pets/${pet.slug}`} even if the name
              changes, so shared links keep working.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PetForm mode="edit" pet={pet} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-destructive/30 shadow-none">
          <CardHeader>
            <CardTitle className="font-heading text-lg text-destructive">
              Danger zone
            </CardTitle>
            <CardDescription>
              Deleting {pet.name}&apos;s profile is permanent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeletePetDialog petId={pet.id} petName={pet.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
