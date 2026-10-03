"use client";

import Link from "next/link";
import { LogOut, PawPrint, Settings, UserRound } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import type { Profile } from "@/lib/types";

export function UserMenu({ profile }: { profile: Profile }) {
  const needsOnboarding = !profile.username || !profile.city;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Account menu"
      >
        <UserAvatar
          name={profile.display_name}
          src={profile.avatar_url}
          size={36}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="font-heading font-bold">{profile.display_name}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {profile.username ? `@${profile.username}` : "Finish your setup"}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {needsOnboarding ? (
          <DropdownMenuItem asChild>
            <Link href="/onboarding">
              <UserRound aria-hidden />
              Finish setup
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/pets">
              <PawPrint aria-hidden />
              My pets
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild>
          <Link href="/settings/profile">
            <Settings aria-hidden />
            Profile settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* A real form post, so signing out works without client JS. */}
        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut aria-hidden />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
