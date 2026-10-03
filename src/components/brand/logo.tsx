import Link from "next/link";
import { PawPrint } from "lucide-react";

import { cn } from "cn";
import { siteConfig } from "@/config/site";

type LogoProps = {
  /** Hide the wordmark and keep only the mark (used in tight spaces). */
  markOnly?: boolean;
  className?: string;
};

export function Logo({ markOnly = false, className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span
        className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-soft transition-transform group-hover:-rotate-6"
        aria-hidden
      >
        <PawPrint className="size-5" />
      </span>
      <span className="sr-only">{siteConfig.name} — home</span>
      {markOnly ? null : (
        <span
          className="font-heading text-lg font-extrabold tracking-tight"
          aria-hidden
        >
          Paw<span className="text-primary">Pals</span>
        </span>
      )}
    </Link>
  );
}
