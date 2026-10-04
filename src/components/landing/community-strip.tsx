import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PetAvatar } from "@/components/pets/pet-avatar";
import { getCommunityStats } from "@/lib/stats";

/**
 * Live proof that the place is inhabited.
 *
 * Renders nothing at all while the community is empty — an "0 pets, 0 posts"
 * banner is worse than no banner, and a landing page should never advertise
 * its own emptiness. It appears on its own the moment the first animal joins,
 * which means the page gets better without anyone editing it.
 */
export async function CommunityStrip() {
  const { pets, posts, openReports, reunited, recentPets } =
    await getCommunityStats();

  if (pets === 0) return null;

  const stats = [
    { value: pets, label: pets === 1 ? "animal" : "animals" },
    { value: posts, label: posts === 1 ? "moment" : "moments" },
    {
      value: openReports,
      label: openReports === 1 ? "open report" : "open reports",
    },
    { value: reunited, label: "reunited" },
  ].filter((stat) => stat.value > 0);

  return (
    <section
      aria-labelledby="community-heading"
      className="border-y border-border bg-card/50"
    >
      <div className="mx-auto w-full max-w-page px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2
              id="community-heading"
              className="font-heading text-sm font-bold tracking-wide text-muted-foreground uppercase"
            >
              On PawPals right now
            </h2>

            <dl className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-2">
              {stats.map(({ value, label }) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <dd className="font-heading text-2xl font-extrabold">
                    {value}
                  </dd>
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                </div>
              ))}
            </dl>
          </div>

          {recentPets.length > 0 ? (
            <div className="flex items-center gap-3">
              <ul className="flex -space-x-3">
                {recentPets.slice(0, 6).map((pet) => (
                  <li
                    key={pet.id}
                    className="rounded-full ring-2 ring-background"
                  >
                    <Link
                      href={`/pets/${pet.slug}`}
                      aria-label={pet.name}
                      className="block rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <PetAvatar
                        name={pet.name}
                        species={pet.species}
                        src={pet.avatar_url}
                        size={40}
                      />
                    </Link>
                  </li>
                ))}
              </ul>

              <Link
                href="/explore"
                className="inline-flex items-center gap-1 rounded-sm text-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Meet them
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
