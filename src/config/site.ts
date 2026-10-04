import { Compass, Home, PawPrint, Siren, type LucideIcon } from "lucide-react";

/**
 * Pawdosi — paw + *padosi* (पड़ोसी), Hindi for neighbour.
 *
 * The name carries the thesis: the animals on your street are your
 * neighbours, whether or not anyone owns them. Copy throughout the app should
 * stay true to that — "animals", not only "pets".
 */
export const siteConfig = {
  name: "Pawdosi",
  tagline: "Every animal on your street is somebody's neighbour",
  description:
    "Pawdosi is a community where the pet is the profile — your dog, your cat, or the one who lives outside the chai shop. Share their days, follow the ones you like, and help find them when they go missing.",
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
