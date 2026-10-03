import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { MainNav } from "@/components/layout/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Server component — the only interactive parts (nav highlighting, theme menu)
 * are isolated into their own client components.
 *
 * Phase 1 replaces the auth buttons with the signed-in user menu.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-page items-center gap-3 px-4 sm:px-6">
        <Logo />

        <div className="ml-auto flex items-center gap-2">
          <MainNav />
          <ThemeToggle />
          <Button variant="ghost" size="lg" asChild className="hidden sm:flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button size="lg" asChild>
            <Link href="/sign-up">Join</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
