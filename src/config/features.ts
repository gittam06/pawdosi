/**
 * Feature flags.
 *
 * Read from NEXT_PUBLIC_* so the same value is available on both sides of the
 * render. Flags default to off: an unset variable must never switch something
 * on by accident.
 */
export const features = {
  /** Requires a Google provider configured in the Supabase dashboard. */
  googleAuth: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH === "true",
} as const;
