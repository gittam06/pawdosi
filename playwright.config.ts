import { readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

/**
 * Next.js loads .env.local for the app, but this config and the test process
 * are plain Node — so the few variables the helpers need are read here.
 * Existing environment variables always win, so CI secrets are not clobbered.
 */
function loadEnvLocal(): void {
  let contents: string;

  try {
    contents = readFileSync(".env.local", "utf8");
  } catch {
    return;
  }

  for (const line of contents.split("\n")) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

loadEnvLocal();

const PORT = Number(process.env.E2E_PORT ?? 3000);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

/**
 * End-to-end tests run against a real server and a real Supabase project —
 * they are not unit tests and are not part of `npm test`.
 *
 * Run with: npm run test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  // Each spec signs in as its own freshly created user, but they share one
  // database; serial execution keeps failures readable.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  timeout: 60_000,

  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
