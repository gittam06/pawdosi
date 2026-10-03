import { Compass, Home, PawPrint, Siren, type LucideIcon } from "lucide-react";

export const siteConfig = {
  name: "PawPals",
  tagline: "The social home for pets and the people who love them",
  description:
    "PawPals is a community for pets and their owners. Give your pet its own profile, share moments, follow other pets, and help reunite lost pets with their families in your city.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export type NavItem = {
  href: string;
  label: string;
  /** Short label for the mobile tab bar. */
  shortLabel: string;
  icon: LucideIcon;
};

/** Primary navigation, shared by the header and the mobile tab bar. */
export const mainNav: NavItem[] = [
  { href: "/feed", label: "Feed", shortLabel: "Feed", icon: Home },
  { href: "/explore", label: "Explore", shortLabel: "Explore", icon: Compass },
  {
    href: "/lost-found",
    label: "Lost & Found",
    shortLabel: "Lost",
    icon: Siren,
  },
  { href: "/pets", label: "My pets", shortLabel: "Pets", icon: PawPrint },
];
