import { z } from "zod";

/**
 * Environment access, validated with Zod.
 *
 * Validation is lazy (inside functions) rather than at module load so that
 * `next build` never fails on a machine without secrets — only code paths that
 * actually need a variable will throw, and they throw a readable message.
 *
 * `process.env.NEXT_PUBLIC_*` is still referenced literally, which is what the
 * Next.js compiler needs in order to inline the value into the client bundle.
 */

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function format(scope: string, error: z.ZodError): never {
  const details = error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");

  throw new Error(
    `Invalid ${scope} environment variables:\n${details}\n\n` +
      `Copy .env.example to .env.local and fill in the values.`,
  );
}

let clientCache: ClientEnv | null = null;

/** Public config. Safe to call from the browser or the server. */
export function clientEnv(): ClientEnv {
  if (clientCache) return clientCache;

  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  });

  if (!parsed.success) format("public", parsed.error);

  clientCache = parsed.data;
  return clientCache;
}

let serverCache: ServerEnv | null = null;

/** Secrets. Throws if reached from a client bundle. */
export function serverEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must never be called in the browser.");
  }

  if (serverCache) return serverCache;

  const parsed = serverEnvSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  });

  if (!parsed.success) format("server", parsed.error);

  serverCache = parsed.data;
  return serverCache;
}
