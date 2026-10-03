import type { Metadata } from "next";
import Link from "next/link";

import { SignUpForm } from "./sign-up-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Separator } from "@/components/ui/separator";
import { features } from "@/config/features";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Join PawPals and give your pet a profile of its own.",
};

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="font-heading text-2xl font-bold">Join PawPals</h1>
        <p className="text-sm text-muted-foreground">
          One account, a profile for every pet you have.
        </p>
      </div>

      <SignUpForm />

      {features.googleAuth ? (
        <>
          <div className="relative">
            <Separator />
            <span className="absolute inset-0 -top-2 mx-auto w-fit bg-background px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>
          <GoogleSignInButton next="/onboarding" />
        </>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
