import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Camera,
  Clock,
  HeartHandshake,
  Heart,
  MapPin,
  MessageCircle,
  PawPrint,
  Search,
  Share2,
  Siren,
  Users,
} from "lucide-react";

import { CommunityStrip } from "@/components/landing/community-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------
   Content lives at the top so the page below reads as structure, not prose.
   ---------------------------------------------------------------------- */

const AUDIENCES = [
  {
    icon: PawPrint,
    tone: "primary" as const,
    title: "You have a pet",
    body: "Give them a profile of their own — name, breed, birthday, the lot. Post as them, and let people follow the animal rather than you.",
  },
  {
    icon: HeartHandshake,
    tone: "teal" as const,
    title: "You feed a street dog",
    body: "She already has a name and four people looking out for her. Give her a profile too. No ownership required — just someone willing to keep an eye out.",
  },
  {
    icon: Siren,
    tone: "alert" as const,
    title: "You want to help",
    body: "Watch the Lost & Found board for your area. Recognising one dog in one photo is the whole contribution, and it is the one that matters.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create a profile",
    body: "For your pet, or for the animal on your street. Takes a minute: a name, a species, a photo.",
  },
  {
    number: "02",
    title: "Post moments",
    body: "Up to four photos and a caption, posted as the animal. The ordinary days are the good ones.",
  },
  {
    number: "03",
    title: "Follow and be found",
    body: "Follow pets you like, build a feed worth opening — and have neighbours nearby when something goes wrong.",
  },
];

const FEATURES = [
  {
    icon: Camera,
    title: "Posts that belong to the animal",
    body: "Four photos, a caption, and a profile that is theirs. Your feed is the pets you chose, in the order they happened.",
  },
  {
    icon: Users,
    title: "Follow pets, not people",
    body: "Follow a beagle in Pune without signing up for everything else its owner posts. The follow is for the animal.",
  },
  {
    icon: Heart,
    title: "Likes and comments",
    body: "Instant, optimistic, and reverted automatically if the network disagrees. It just feels right.",
  },
  {
    icon: Bell,
    title: "Notifications that are honest",
    body: "Written by the database itself, so they cannot be faked or missed. Un-like something and the notification goes with it.",
  },
  {
    icon: Search,
    title: "Find any animal",
    body: "Search by name or breed. Every pet page is public and shareable, with a proper link preview.",
  },
  {
    icon: Share2,
    title: "Built to be shared",
    body: "A filtered Lost & Found board is a link. Paste it into a neighbourhood group and it works for people with no account at all.",
  },
];

const LOST_FOUND_POINTS = [
  {
    icon: MapPin,
    title: "Scoped to your area",
    body: "Filter by city, locality and species. Nobody in Kochi needs to scroll past a missing cat in Delhi.",
  },
  {
    icon: Clock,
    title: "Time matters, so it is first",
    body: "Last seen, where, and how to reach you — the three things a stranger needs — are at the top of every report.",
  },
  {
    icon: HeartHandshake,
    title: "Reunions stay visible",
    body: "Mark a report reunited and it turns green rather than vanishing. The happy endings are the reason people keep looking.",
  },
];

const FAQS = [
  {
    question: "Do I need to own a pet to use Pawdosi?",
    answer:
      "No. Plenty of people here look after animals they do not own — the dog outside the shop, the cats behind the building. Those profiles are marked as street animals, and the person who added them is listed as the caretaker rather than the owner.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes, and there is nothing to upgrade to. No ads, no promoted posts, no algorithm deciding which pets you are allowed to see.",
  },
  {
    question: "Who can see my posts?",
    answer:
      "Pet profiles, posts and Lost & Found reports are public, because a lost pet is no use to anyone behind a login. Your email is never shown. You choose what contact details, if any, go on a report.",
  },
  {
    question: "What happens when a pet is found?",
    answer:
      "The person who filed the report marks it reunited. It stays on the board, turns green, and stops competing for attention with the reports that are still open.",
  },
  {
    question: "Can I delete things?",
    answer:
      "Any post, pet profile or report you created, whenever you like. Deleting removes the photos from storage too, not just the row in the database.",
  },
];

const toneClasses = {
  primary: "bg-primary-muted text-primary-muted-foreground",
  teal: "bg-teal-muted text-teal-muted-foreground",
  alert: "bg-alert-muted text-alert-muted-foreground",
} satisfies Record<string, string>;

export default async function HomePage() {
  const user = await getCurrentUser();
  const startHref = user ? "/pets/new" : "/sign-up";
  const startLabel = user ? "Add an animal" : "Create a free account";

  return (
    <div className="w-full">
      {/* Hero ---------------------------------------------------------- */}
      <section className="relative overflow-hidden">
        {/* Two soft brand washes rather than a flat panel: the page should
            feel warm before a single word is read. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 -left-32 size-[32rem] rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-40 size-[28rem] rounded-full bg-teal/10 blur-3xl"
        />

        <div className="relative mx-auto flex w-full max-w-page flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28">
          <Badge
            variant="secondary"
            className="gap-1.5 rounded-full px-3 py-1 text-xs"
          >
            <PawPrint className="size-3.5" aria-hidden />
            For pets and street animals in Indian cities
          </Badge>

          <h1 className="max-w-3xl font-heading text-4xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Every animal on your street{" "}
            <span className="text-primary">deserves a profile</span>
          </h1>

          <p className="max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            Pawdosi is a community where the pet is the profile — your dog, your
            cat, or the one who lives outside the chai shop. Share their days,
            follow the ones you like, and help find them when they go missing.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-11 px-6 text-base shadow-soft"
              asChild
            >
              <Link href={startHref}>
                {startLabel}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 text-base"
              asChild
            >
              <Link href="/lost-found">
                <Siren aria-hidden />
                See Lost &amp; Found
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Free, no ads, no algorithm. You see the animals you followed.
          </p>
        </div>
      </section>

      {/* Live activity, when there is any ------------------------------- */}
      <CommunityStrip />

      {/* Who it is for ------------------------------------------------- */}
      <section
        aria-labelledby="audiences-heading"
        className="mx-auto w-full max-w-page px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2
            id="audiences-heading"
            className="font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
          >
            You do not need to own an animal to belong here
          </h2>
          <p className="mt-3 text-base text-pretty text-muted-foreground">
            Most of the animals in an Indian neighbourhood have no owner — and
            half a dozen people who quietly look after them anyway.
          </p>
        </div>

        <ul className="grid gap-4 md:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, tone, title, body }) => (
            <li key={title}>
              <Card className="h-full rounded-2xl shadow-card transition-shadow hover:shadow-lift">
                <CardContent className="space-y-3">
                  <span
                    className={`flex size-11 items-center justify-center rounded-xl ${toneClasses[tone]}`}
                    aria-hidden
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-heading text-lg font-bold">{title}</h3>
                  <p className="text-sm text-pretty text-muted-foreground">
                    {body}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {/* How it works -------------------------------------------------- */}
      <section
        aria-labelledby="steps-heading"
        className="border-y border-border bg-card/50"
      >
        <div className="mx-auto w-full max-w-page px-4 py-16 sm:px-6 sm:py-20">
          <h2
            id="steps-heading"
            className="mb-10 text-center font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
          >
            Three steps, about a minute
          </h2>

          <ol className="grid gap-8 md:grid-cols-3">
            {STEPS.map(({ number, title, body }) => (
              <li key={number} className="relative">
                <span
                  aria-hidden
                  className="font-heading text-5xl font-extrabold text-primary/20"
                >
                  {number}
                </span>
                <h3 className="mt-2 font-heading text-lg font-bold">{title}</h3>
                <p className="mt-1.5 text-sm text-pretty text-muted-foreground">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Lost & Found spotlight ---------------------------------------- */}
      <section
        aria-labelledby="lost-found-heading"
        className="mx-auto w-full max-w-page px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-alert px-2.5 py-1 text-xs font-semibold text-alert-foreground">
              <Siren className="size-3.5" aria-hidden />
              The part that matters most
            </span>

            <h2
              id="lost-found-heading"
              className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
            >
              A neighbourhood board for lost and found pets
            </h2>

            <p className="mt-3 text-base text-pretty text-muted-foreground">
              When a pet goes missing, the people who can actually help are
              within about two kilometres — and most of them are not on your
              social media. So reports here are public, readable without an
              account, and filtered down to one city and one locality.
            </p>

            <ul className="mt-6 space-y-4">
              {LOST_FOUND_POINTS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3">
                  <span
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-alert-muted text-alert-muted-foreground"
                    aria-hidden
                  >
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-heading text-sm font-bold">{title}</h3>
                    <p className="text-sm text-pretty text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <Button className="mt-7 h-11 px-6 text-base" asChild>
              <Link href="/lost-found">
                Open the board
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>

          {/* A mock of the real card, built from the real tokens. */}
          <div className="space-y-3" aria-hidden>
            <Card className="rounded-2xl border-alert/40 bg-alert-muted/30 shadow-card">
              <CardContent className="flex gap-4">
                <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-alert-muted text-alert-muted-foreground">
                  <PawPrint className="size-8" />
                </span>
                <div className="min-w-0 space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-alert px-2.5 py-1 text-xs font-semibold text-alert-foreground">
                    <Siren className="size-3.5" />
                    Lost
                  </span>
                  <p className="font-heading text-base font-bold">
                    Beagle missing near Indiranagar 12th Main
                  </p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    Tan and white, blue harness, answers to Mishti. Last seen
                    following a food cart on Sunday evening.
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    Indiranagar, Bengaluru
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-success/30 bg-success-muted/20 shadow-card">
              <CardContent className="flex gap-4">
                <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-success-muted text-success-muted-foreground">
                  <HeartHandshake className="size-8" />
                </span>
                <div className="min-w-0 space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-muted px-2.5 py-1 text-xs font-semibold text-success-muted-foreground">
                    <HeartHandshake className="size-3.5" />
                    Reunited
                  </span>
                  <p className="font-heading text-base font-bold">
                    Ginger cat found in Bandra — back home
                  </p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    Posted on Thursday. His family recognised the white sock
                    markings within the hour.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features ------------------------------------------------------ */}
      <section
        aria-labelledby="features-heading"
        className="border-y border-border bg-card/50"
      >
        <div className="mx-auto w-full max-w-page px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2
              id="features-heading"
              className="font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
            >
              Everything you would expect, nothing you would not
            </h2>
            <p className="mt-3 text-base text-pretty text-muted-foreground">
              A small app that does a few things properly.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title}>
                <Card className="h-full rounded-2xl shadow-card transition-shadow hover:shadow-lift">
                  <CardContent className="space-y-2.5">
                    <span
                      className="flex size-10 items-center justify-center rounded-xl bg-primary-muted text-primary-muted-foreground"
                      aria-hidden
                    >
                      <Icon className="size-5" />
                    </span>
                    <h3 className="font-heading text-base font-bold">
                      {title}
                    </h3>
                    <p className="text-sm text-pretty text-muted-foreground">
                      {body}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why not Instagram --------------------------------------------- */}
      <section
        aria-labelledby="different-heading"
        className="mx-auto w-full max-w-page px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="different-heading"
            className="font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
          >
            Why not just post them on Instagram?
          </h2>
          <p className="mt-4 text-base text-pretty text-muted-foreground">
            You can, and people do. But a pet account there is still{" "}
            <em>your</em> account, a lost dog competes with everything else in
            the feed, and the neighbour three streets away who actually saw her
            does not follow you.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            {
              icon: PawPrint,
              label: "The pet is the account",
              body: "Not a hashtag on yours.",
            },
            {
              icon: MapPin,
              label: "Sorted by where you are",
              body: "Not by what performs.",
            },
            {
              icon: MessageCircle,
              label: "No feed algorithm",
              body: "You see what you followed.",
            },
          ].map(({ icon: Icon, label, body }) => (
            <div
              key={label}
              className="rounded-2xl border border-dashed border-border bg-card/40 p-5 text-center"
            >
              <span
                className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-teal-muted text-teal-muted-foreground"
                aria-hidden
              >
                <Icon className="size-5" />
              </span>
              <p className="font-heading text-sm font-bold">{label}</p>
              <p className="text-xs text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ ------------------------------------------------------------ */}
      <section
        aria-labelledby="faq-heading"
        className="border-y border-border bg-card/50"
      >
        <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <h2
            id="faq-heading"
            className="mb-8 text-center font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl"
          >
            Questions
          </h2>

          {/* Native disclosure elements: keyboard accessible, searchable by
              the browser's find-in-page, and no JavaScript involved. */}
          <div className="space-y-3">
            {FAQS.map(({ question, answer }) => (
              <details
                key={question}
                className="group rounded-2xl border border-border bg-background px-5 py-4 [&[open]]:shadow-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                  {question}
                  <span
                    aria-hidden
                    className="shrink-0 text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-pretty text-muted-foreground">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA ---------------------------------------------------- */}
      <section className="mx-auto w-full max-w-page px-4 py-20 sm:px-6 sm:py-24">
        <Card className="relative overflow-hidden rounded-3xl border-primary/20 bg-primary-muted/40 shadow-card">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-16 size-72 rounded-full bg-primary/10 blur-3xl"
          />
          <CardContent className="relative flex flex-col items-center gap-5 py-14 text-center">
            <span
              className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft"
              aria-hidden
            >
              <PawPrint className="size-6" />
            </span>

            <h2 className="max-w-xl font-heading text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
              Start with one animal
            </h2>
            <p className="max-w-md text-base text-pretty text-muted-foreground">
              Yours, or the one who waits outside your gate every morning.{" "}
              {siteConfig.name} works better the more of your street is on it —
              so it may as well start with you.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="h-11 px-6 text-base shadow-soft"
                asChild
              >
                <Link href={startHref}>
                  {startLabel}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 text-base"
                asChild
              >
                <Link href="/explore">Look around first</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
