import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Camera, ImageIcon, Pencil } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { PetAvatar } from "@/components/pets/pet-avatar";
import { SpeciesBadge } from "@/components/pets/species-badge";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { genderLabel } from "@/config/pets";
import { getCurrentUser } from "@/lib/auth";
import { avatarUrl } from "@/lib/cloudinary-url";
import { formatAge, formatBirthDate } from "@/lib/pet-age";
import { getPetBySlug } from "@/lib/pets";

type PetPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PetPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pet = await getPetBySlug(slug);

  if (!pet) return { title: "Pet not found" };

  const description =
    pet.bio ??
    `${pet.name} is a ${pet.breed ? `${pet.breed} ` : ""}${pet.species} on PawPals.`;

  // A square Cloudinary crop doubles as the Open Graph image.
  const image = avatarUrl(pet.avatar_url, 1200);

  return {
    title: pet.name,
    description,
    openGraph: {
      title: `${pet.name} on PawPals`,
      description,
      type: "profile",
      images: image ? [{ url: image, width: 1200, height: 1200 }] : undefined,
    },
  };
}

export default async function PetPage({ params }: PetPageProps) {
  const { slug } = await params;
  const pet = await getPetBySlug(slug);

  if (!pet) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === pet.owner_id;

  const age = formatAge(pet.birth_date);
  const birthday = formatBirthDate(pet.birth_date);
  const gender = genderLabel(pet.gender);

  return (
    <div className="mx-auto w-full max-w-page px-4 py-8 sm:px-6 sm:py-10">
      {/* Identity ------------------------------------------------------- */}
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <PetAvatar
          name={pet.name}
          species={pet.species}
          src={pet.avatar_url}
          size={128}
          className="self-start"
        />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-3xl font-extrabold tracking-tight">
              {pet.name}
            </h1>
            <SpeciesBadge species={pet.species} />
          </div>

          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {pet.breed ? (
              <div className="flex gap-1.5">
                <dt className="sr-only">Breed</dt>
                <dd>{pet.breed}</dd>
              </div>
            ) : null}
            {gender ? (
              <div className="flex gap-1.5">
                <dt className="sr-only">Gender</dt>
                <dd>{gender}</dd>
              </div>
            ) : null}
            {age ? (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Age</dt>
                <dd className="flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden />
                  <span title={birthday ?? undefined}>{age}</span>
                </dd>
              </div>
            ) : null}
          </dl>

          {pet.bio ? (
            <p className="max-w-prose text-sm text-pretty">{pet.bio}</p>
          ) : null}

          {/* Counts are wired up in Phases 3 and 4; the shape is here now. */}
          <dl className="flex items-center gap-6 text-sm">
            <div className="flex items-baseline gap-1.5">
              <dt className="order-2 text-muted-foreground">followers</dt>
              <dd className="order-1 font-heading font-bold">0</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="order-2 text-muted-foreground">posts</dt>
              <dd className="order-1 font-heading font-bold">0</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* Not a link: owners do not have public pages — pets do. */}
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserAvatar
                name={pet.owner.display_name}
                src={pet.owner.avatar_url}
                size={24}
              />
              <span>
                Cared for by{" "}
                <span className="font-medium text-foreground">
                  {pet.owner.display_name}
                </span>
                {pet.owner.username ? (
                  <span className="ml-1">@{pet.owner.username}</span>
                ) : null}
              </span>
            </p>

            {isOwner ? (
              <Button variant="outline" size="lg" asChild className="ml-auto">
                <Link href={`/pets/${pet.slug}/edit`}>
                  <Pencil aria-hidden />
                  Edit
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Posts ---------------------------------------------------------- */}
      <section aria-labelledby="posts-heading" className="mt-10">
        <h2 id="posts-heading" className="sr-only">
          Posts by {pet.name}
        </h2>

        <EmptyState
          icon={isOwner ? Camera : ImageIcon}
          title={isOwner ? "No posts yet" : `${pet.name} has not posted yet`}
          description={
            isOwner
              ? "Moments you post as this pet will show up here."
              : "Follow this pet to see new moments in your feed."
          }
        />
      </section>
    </div>
  );
}
