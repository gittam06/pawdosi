import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { supabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Always create a fresh client per request: it closes over that request's
 * cookie store, so caching it across requests would leak sessions between
 * users. `cookies()` is async in Next.js 15+, hence the async factory.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const env = supabaseEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components cannot write cookies. Refreshed tokens are
            // persisted by the middleware instead, so this is safe to ignore.
          }
        },
      },
    },
  );
}
