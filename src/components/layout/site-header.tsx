import Link from "next/link";
import { Search } from "lucide-react";

import { searchNavItem } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { MainNav } from "@/components/layout/main-nav";
import { NotificationBell } from "@/components/layout/notification-bell";
import { PetSearch } from "@/components/layout/pet-search";
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

          {/* The real search box from `lg`, where it fits. Between `md` and
              `lg` the header has no room for a 176px input, so search becomes
              an icon pointing at the page — the tab bar covers phones. */}
          <PetSearch className="hidden lg:block" />
          <Button
            variant="ghost"
            size="icon-lg"
            asChild
            className="hidden md:inline-flex lg:hidden"
          >
            <Link href={searchNavItem.href} aria-label="Search pets">
              <Search aria-hidden />
            </Link>
          </Button>

          <ThemeToggle />

          {profile ? (
            <>
              <NotificationBell />
              <UserMenu profile={profile} />
            </>
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
