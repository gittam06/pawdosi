import { createBrowserClient } from "@supabase/ssr";

import { supabaseEnv } from "@/lib/env";
import type { Database } from "@/lib/supabase/types";

/**
 * Supabase client for Client Components.
 *
 * `createBrowserClient` is memoised internally by @supabase/ssr, so calling
 * this per component is cheap — there is still only one GoTrue instance.
 */
export function createClient() {
  const env = supabaseEnv();

  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
