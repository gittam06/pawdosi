import type { Metadata } from "next";
import Link from "next/link";

import { SignInForm } from "./sign-in-form";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Separator } from "@/components/ui/separator";
import { features } from "@/config/features";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to PawPals.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="font-heading text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to keep up with your pack.
        </p>
      </div>

      <SignInForm next={next} />

      {features.googleAuth ? (
        <>
          <div className="relative">
            <Separator />
            <span className="absolute inset-0 -top-2 mx-auto w-fit bg-background px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>
          <GoogleSignInButton next={next} />
        </>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href="/sign-up"
          className="rounded-sm font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
