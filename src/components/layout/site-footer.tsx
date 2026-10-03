import Link from "next/link";

import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card/40">
      <div className="mx-auto flex w-full max-w-page flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-heading font-bold text-foreground">
            {siteConfig.name}
          </span>{" "}
          — built for pets and their people.
        </p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-4">
            <li>
              <Link
                href="/explore"
                className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Explore
              </Link>
            </li>
            <li>
              <Link
                href="/lost-found"
                className="rounded-sm underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Lost &amp; Found
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
