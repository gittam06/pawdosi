import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { MainNav } from "@/components/layout/main-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentProfile } from "@/lib/auth";

/**
 * Server component: it reads the session, so the header is correct on first
 * paint with no signed-in/signed-out flash. The interactive bits (nav
 * highlighting, theme menu, account menu) are separate client components.
 */
export async function SiteHeader() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-page items-center gap-3 px-4 sm:px-6">
        <Logo />

        <div className="ml-auto flex items-center gap-2">
          <MainNav />
          <ThemeToggle />

          {profile ? (
            <UserMenu profile={profile} />
          ) : (
            <>
              <Button
                variant="ghost"
                size="lg"
                asChild
                className="hidden sm:flex"
              >
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button size="lg" asChild>
                <Link href="/sign-up">Join</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
