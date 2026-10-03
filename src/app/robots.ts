import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private or per-user routes. These already carry `robots: noindex`
      // in their metadata; this saves crawlers the round trip.
      disallow: [
        "/api/",
        "/auth/",
        "/settings/",
        "/notifications",
        "/feed",
        "/onboarding",
        "/sign-in",
        "/sign-up",
        "/check-email",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
