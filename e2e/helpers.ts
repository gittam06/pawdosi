import { deflateSync } from "node:zlib";

/**
 * Helpers for the end-to-end suite.
 *
 * These talk to Supabase's admin API with the service role key, which is why
 * they live here and nowhere near `src/`.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const E2E_PASSWORD = "PawPals!E2E-2026";

export function requireE2EEnv(): void {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
      "E2E tests need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Load .env.local first.",
    );
  }
}

function adminHeaders(): HeadersInit {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  };
}

/** A unique address per run, so reruns never collide on the unique index. */
export function uniqueEmail(): string {
  const stamp = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
  return `pawpals.e2e.${stamp}@example.com`;
}

/**
 * Creates an already-confirmed user.
 *
 * Signing up through the UI is covered by the test itself, but the
 * confirmation email cannot be clicked from here — so the account the rest of
 * the journey uses is provisioned directly.
 */
export async function createConfirmedUser(
  email: string,
  displayName: string,
): Promise<string> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify({
      email,
      password: E2E_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: displayName },
    }),
  });

  if (!response.ok) {
    throw new Error(`Could not create test user: ${await response.text()}`);
  }

  const user = (await response.json()) as { id: string };
  return user.id;
}

/** Deleting the auth user cascades to profile, pets, posts and images. */
export async function deleteUser(userId: string): Promise<void> {
  await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: adminHeaders(),
  }).catch(() => undefined);
}

function crcTable(): number[] {
  const table: number[] = [];

  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }

  return table;
}

const CRC_TABLE = crcTable();

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);

  const typeBuffer = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));

  return Buffer.concat([length, typeBuffer, data, crc]);
}

/**
 * A real PNG, built in memory.
 *
 * Cloudinary rejects anything that is not an image, so the upload step needs
 * genuine bytes — but committing a binary fixture for a solid colour would be
 * silly.
 */
export function pngBuffer(
  size = 240,
  colour: [number, number, number] = [232, 124, 46],
): Buffer {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  let offset = 0;

  for (let y = 0; y < size; y += 1) {
    raw[offset] = 0; // filter: none
    offset += 1;

    for (let x = 0; x < size; x += 1) {
      const band = Math.abs(x - y) % 60 < 20;
      raw[offset] = band ? 255 - colour[0] : colour[0];
      raw[offset + 1] = band ? 255 - colour[1] : colour[1];
      raw[offset + 2] = band ? 255 - colour[2] : colour[2];
      offset += 3;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
