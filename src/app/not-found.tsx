import Link from "next/link";
import { PawPrint } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <span
        className="flex size-14 items-center justify-center rounded-2xl bg-primary-muted text-primary-muted-foreground"
        aria-hidden
      >
        <PawPrint className="size-7" />
      </span>
      <h1 className="font-heading text-2xl font-bold">
        This trail goes nowhere
      </h1>
      <p className="text-sm text-muted-foreground">
        The page you were looking for does not exist, or it has not been built
        yet.
      </p>
      <Button asChild className="mt-2">
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
