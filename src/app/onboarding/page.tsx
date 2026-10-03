import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { OnboardingForm } from "./onboarding-form";
import { getCurrentProfile, requireUser } from "@/lib/auth";
import { isOnboarded } from "@/lib/types";

export const metadata: Metadata = {
  title: "Set up your account",
  robots: { index: false },
};

// Session-dependent: never cache a snapshot of someone's setup state.
export const dynamic = "force-dynamic";

/** Suggests a username from the display name the signup trigger stored. */
function suggestUsername(displayName: string): string {
  const slug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);

  return slug.length >= 3 ? slug : "";
}

export default async function OnboardingPage() {
  await requireUser();
  const profile = await getCurrentProfile();

  // Already set up — nothing to do here.
  if (isOnboarded(profile)) redirect("/");

  const displayName = profile?.display_name ?? "";

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12 sm:py-20">
      <div className="space-y-6">
        <div className="space-y-1.5 text-center">
          <h1 className="font-heading text-2xl font-bold">Almost there</h1>
          <p className="text-sm text-pretty text-muted-foreground">
            Pick a username and tell us your city. Your pets get their own
            profiles next.
          </p>
        </div>

        <OnboardingForm
          defaultDisplayName={displayName}
          defaultUsername={suggestUsername(displayName)}
        />
      </div>
    </div>
  );
}
