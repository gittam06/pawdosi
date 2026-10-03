import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";

/**
 * Public URLs only. Feeds, settings and notifications are per-user and
 * noindex, so they have no business here.
 *
 * Capped rather than paginated: a sitemap index is the right answer past
 * ~50k URLs, and this project is nowhere near that.
 */
const MAX_URLS = 2000;

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/explore`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/lost-found`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/search`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // A build without credentials still produces a valid sitemap.
  if (!supabaseConfigured()) return staticRoutes;

  const supabase = await createClient();

  const [pets, reports, posts] = await Promise.all([
    supabase
      .from("pets")
      .select("slug, updated_at")
      .order("updated_at", { ascending: false })
      .limit(MAX_URLS),
    supabase
      .from("lost_found_reports")
      .select("id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(MAX_URLS),
    supabase
      .from("posts")
      .select("id, created_at")
      .order("created_at", { ascending: false })
      .limit(MAX_URLS),
  ]);

  return [
    ...staticRoutes,
    ...(pets.data ?? []).map((pet) => ({
      url: `${base}/pets/${pet.slug}`,
      lastModified: new Date(pet.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...(reports.data ?? []).map((report) => ({
      url: `${base}/lost-found/${report.id}`,
      lastModified: new Date(report.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...(posts.data ?? []).map((post) => ({
      url: `${base}/posts/${post.id}`,
      lastModified: new Date(post.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
