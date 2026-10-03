/**
 * Is Supabase configured for this environment?
 *
 * Read paths treat a missing configuration as "signed out" rather than
 * throwing: `next build` prerenders pages that render the header, and a build
 * must not require production secrets. The loud failure happens where it is
 * actionable — any actual auth or write call goes through `supabaseEnv()`, which
 * throws with a message naming the missing variable.
 */

let warned = false;

export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Returns false (and complains once) when credentials are missing. */
export function supabaseConfiguredOrWarn(): boolean {
  if (supabaseConfigured()) return true;

  if (!warned) {
    warned = true;
    const message =
      "Supabase is not configured — treating every visitor as signed out. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example).";

    if (process.env.NODE_ENV === "production") {
      console.error(message);
    } else {
      console.warn(message);
    }
  }

  return false;
}
