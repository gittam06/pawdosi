import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`.
 *
 * Phase 0: keep the Supabase session fresh on every page request.
 * Route protection and onboarding redirects land here in Phase 1.
 */
export async function proxy(request: NextRequest) {
  // Without Supabase credentials there is no session to refresh. In
  // development we warn and let the request through so the UI is still
  // browsable on a fresh clone; in production a missing URL is a hard error.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL is not set. Auth cannot work — see .env.example.",
      );
    }

    console.warn(
      "[proxy] Supabase env vars missing — skipping session refresh. Copy .env.example to .env.local.",
    );

    return NextResponse.next({ request });
  }

  const { response } = await updateSession(request);

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and image files — the session refresh is
     * a network call, so it should not fire for every icon.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
