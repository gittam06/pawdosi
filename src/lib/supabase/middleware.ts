import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

import { supabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Refreshes the Supabase session on every matched request and returns both the
 * response carrying the updated auth cookies and the current user.
 *
 * The response must be the one returned from the middleware, otherwise the
 * rotated refresh token is dropped and the user gets logged out at random.
 */
export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  let response = NextResponse.next({ request });
  const env = supabaseEnv();

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() (not getSession()) revalidates the JWT against the auth server,
  // so the result can be trusted for authorisation decisions.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
