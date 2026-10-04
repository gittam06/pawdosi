import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Confirm your email",
  description: "Check your inbox to finish creating your Pawdosi account.",
};

export default function CheckEmailPage() {
  return (
    <div className="space-y-5 text-center">
      <span
        className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-muted text-teal-muted-foreground"
        aria-hidden
      >
        <MailCheck className="size-7" />
      </span>

      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-bold">Check your inbox</h1>
        <p className="text-sm text-pretty text-muted-foreground">
          We sent you a confirmation link. Open it to activate your account —
          then you can pick a username and get started.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        Nothing there? Check your spam folder, or try signing up again.
      </p>

      <Button variant="outline" asChild className="h-10">
        <Link href="/sign-in">Back to sign in</Link>
      </Button>
    </div>
  );
}
