import { z } from "zod";

/**
 * Environment access, validated with Zod.
 *
 * Validation is **per concern**, not per file: asking for Supabase config must
 * not fail because Cloudinary is unconfigured. Each accessor validates exactly
 * what its caller needs and nothing else.
 *
 * It is also lazy, so `next build` never requires secrets — only code paths
 * that actually use a variable can throw, and they throw a readable message.
 *
 * `process.env.NEXT_PUBLIC_*` is referenced literally, which is what the
 * Next.js compiler needs in order to inline the value into the client bundle.
 */

function parse<T extends z.ZodType>(
  scope: string,
  schema: T,
  values: unknown,
): z.infer<T> {
  const result = schema.safeParse(values);
  if (result.success) return result.data;

  const details = result.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Missing or invalid ${scope} environment variables:\n${details}\n\n` +
      `Copy .env.example to .env.local and fill in the values.`,
  );
}

/** Caches a successful parse; a failure stays a failure and keeps throwing. */
function once<T>(load: () => T): () => T {
  let cached: T | undefined;

  return () => {
    if (cached === undefined) cached = load();
    return cached;
  };
}

function assertServer(name: string): void {
  if (typeof window !== "undefined") {
    throw new Error(`${name} must never be called in the browser.`);
  }
}

// --- Supabase ---------------------------------------------------------------

const supabaseSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export type SupabaseEnv = z.infer<typeof supabaseSchema>;

/** Public Supabase config. Safe in the browser — RLS is the real boundary. */
export const supabaseEnv = once<SupabaseEnv>(() =>
  parse("Supabase", supabaseSchema, {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }),
);

const supabaseServiceSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

/** Bypasses RLS. Seed scripts only — never in a request path. */
export const supabaseServiceEnv = once(() => {
  assertServer("supabaseServiceEnv()");

  return parse("Supabase service", supabaseServiceSchema, {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
});

// --- Cloudinary -------------------------------------------------------------

const cloudinaryPublicSchema = z.object({
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
});

/** Cloud name only — enough to build delivery URLs. */
export const cloudinaryPublicEnv = once(() =>
  parse("Cloudinary", cloudinaryPublicSchema, {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  }),
);

const cloudinaryServerSchema = cloudinaryPublicSchema.extend({
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

export type CloudinaryEnv = z.infer<typeof cloudinaryServerSchema>;

/** Signing credentials. Throws outright if reached from a client bundle. */
export const cloudinaryEnv = once<CloudinaryEnv>(() => {
  assertServer("cloudinaryEnv()");

  return parse("Cloudinary", cloudinaryServerSchema, {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  });
});
