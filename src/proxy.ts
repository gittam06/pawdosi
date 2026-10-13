import { NextResponse, type NextRequest } from "next/server";

import { supabaseConfiguredOrWarn } from "@/lib/supabase/config";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`.
 *
 * Two jobs: keep the Supabase session fresh, and bounce signed-out visitors
 * away from private routes. Fine-grained rules (is this user onboarded? does
 * this user own this pet?) belong in the page, where the answer is cheap and
 * typed; the proxy only does the coarse check on every request.
 */

/** Everything under these requires a signed-in user. */
const PROTECTED_PREFIXES = [
  "/onboarding",
  "/settings",
  "/notifications",
  "/feed",
];

/**
 * Exact paths only. `/pets` and `/pets/new` are private, but `/pets/<slug>`
 * is a public profile — a prefix rule here would hide the whole feature. Same
 * for `/posts/new` against `/posts/<id>`, and `/lost-found/new` against the
 * public board.
 *
 * The two composer routes guard themselves with `requireOnboardedProfile()`,
 * but leaving them out of this list was still wrong twice over: the page
 * streams as a `200` before that redirect reaches the client, and the redirect
 * it issues has no `?next=`, so signing in dropped the visitor on the home
 * page instead of the form they came for.
 */
const PROTECTED_EXACT = ["/pets", "/pets/new", "/posts/new", "/lost-found/new"];

function isProtected(pathname: string): boolean {
  if (PROTECTED_EXACT.includes(pathname)) return true;

  // /pets/<slug>/edit
  if (pathname.startsWith("/pets/") && pathname.endsWith("/edit")) return true;

  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest) {
  // Without Supabase credentials there is no session to refresh. The request
  // passes through as signed out so a fresh clone is still browsable.
  if (!supabaseConfiguredOrWarn()) {
    return NextResponse.next({ request });
  }

  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!user && isProtected(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;

    const redirect = NextResponse.redirect(url);

    // Carry over any cookies the session refresh just set, otherwise the
    // rotated refresh token is lost on this hop.
    for (const cookie of response.cookies.getAll()) {
      redirect.cookies.set(cookie);
    }

    return redirect;
  }

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
