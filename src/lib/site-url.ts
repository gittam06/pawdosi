import { headers } from "next/headers";

import { siteConfig } from "@/config/site";

/**
 * Absolute origin of the current request.
 *
 * Derived from the request rather than from an env var so that Vercel preview
 * deployments send auth emails pointing at themselves instead of production.
 */
export async function getOrigin(): Promise<string> {
  const headerList = await headers();

  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return siteConfig.url;

  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}
