import Link from "next/link";
import { Heart, MessageCircle, PawPrint, Siren, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config/site";

const features = [
  {
    icon: PawPrint,
    title: "A profile per pet",
    description:
      "Your pet is the account. Name, breed, birthday, bio — one page that is unmistakably theirs.",
    tone: "primary" as const,
  },
  {
    icon: Users,
    title: "Follow pets, not people",
    description:
      "Build a feed of the animals you actually want to see. Follow a beagle in Pune, skip the rest.",
    tone: "teal" as const,
  },
  {
    icon: Siren,
    title: "Lost & Found",
    description:
      "Post a lost or found pet with a photo, the area and the last-seen time. Neighbours see it first.",
    tone: "alert" as const,
  },
];

const toneClasses = {
  primary: "bg-primary-muted text-primary-muted-foreground",
  teal: "bg-teal-muted text-teal-muted-foreground",
  alert: "bg-alert-muted text-alert-muted-foreground",
} satisfies Record<string, string>;

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-page px-4 sm:px-6">
      {/* Hero ------------------------------------------------------------ */}
      <section className="flex flex-col items-center gap-6 py-16 text-center sm:py-24">
        <Badge
          variant="secondary"
          className="gap-1.5 rounded-full px-3 py-1 text-xs"
        >
          <PawPrint className="size-3.5" aria-hidden />
          Made for pet owners in Indian cities
        </Badge>

        <h1 className="max-w-2xl font-heading text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
          The social home for{" "}
          <span className="text-primary">pets and their people</span>
        </h1>

        <p className="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
          {siteConfig.description}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="h-11 px-6 text-base shadow-soft" asChild>
            <Link href="/sign-up">Create your pet&apos;s profile</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6 text-base"
            asChild
          >
            <Link href="/explore">Browse the community</Link>
          </Button>
        </div>
      </section>

      {/* Features -------------------------------------------------------- */}
      <section aria-labelledby="features-heading" className="pb-16 sm:pb-24">
        <h2 id="features-heading" className="sr-only">
          What you can do on {siteConfig.name}
        </h2>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description, tone }) => (
            <li key={title}>
              <Card className="h-full rounded-2xl shadow-card transition-shadow hover:shadow-lift">
                <CardHeader>
                  <span
                    className={`mb-2 flex size-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
                    aria-hidden
                  >
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="font-heading text-lg">
                    {title}
                  </CardTitle>
                  <CardDescription className="text-pretty">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* Closing note ---------------------------------------------------- */}
      <section className="pb-20">
        <Card className="rounded-3xl border-dashed bg-card/60 shadow-none">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div
              className="flex items-center gap-2 text-muted-foreground"
              aria-hidden
            >
              <Heart className="size-5" />
              <MessageCircle className="size-5" />
              <PawPrint className="size-5" />
            </div>
            <p className="max-w-md text-sm text-pretty text-muted-foreground">
              Likes, comments, follows and a neighbourhood Lost &amp; Found
              board — all in one place, free to use.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
