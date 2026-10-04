import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PetForm } from "@/components/pets/pet-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MAX_PETS_PER_OWNER } from "@/config/pets";
import { requireOnboardedProfile } from "@/lib/auth";
import { countPetsByOwner } from "@/lib/pets";

export const metadata: Metadata = {
  title: "Add a pet",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function NewPetPage() {
  const profile = await requireOnboardedProfile();

  // The action enforces this too; checking here avoids showing a form that
  // can only fail.
  if ((await countPetsByOwner(profile.id)) >= MAX_PETS_PER_OWNER) {
    redirect("/pets");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link href="/pets">
          <ArrowLeft aria-hidden />
          My pets
        </Link>
      </Button>

      <Card className="rounded-2xl shadow-card">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Add an animal</CardTitle>
          <CardDescription>
            Your own pet, or a street animal you look after. Only the name and
            species are required — you can add a photo once the profile exists.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PetForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
