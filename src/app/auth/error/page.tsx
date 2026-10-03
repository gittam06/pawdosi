import type { Metadata } from "next";
import Link from "next/link";
import { LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Link expired",
  robots: { index: false },
};

export default function AuthErrorPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <span
        className="flex size-14 items-center justify-center rounded-2xl bg-alert-muted text-alert-muted-foreground"
        aria-hidden
      >
        <LinkIcon className="size-7" />
      </span>

      <h1 className="font-heading text-2xl font-bold">
        That link did not work
      </h1>
      <p className="text-sm text-pretty text-muted-foreground">
        Confirmation links expire, and each one can only be used once. Sign in
        again and we will send you a fresh link.
      </p>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Button asChild className="h-10">
          <Link href="/sign-in">Back to sign in</Link>
        </Button>
        <Button variant="outline" asChild className="h-10">
          <Link href="/sign-up">Create an account</Link>
        </Button>
      </div>
    </div>
  );
}
