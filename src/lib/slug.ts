/**
 * Slug helpers.
 *
 * Slugs are generated server-side and must satisfy the `pets_slug_format`
 * check constraint: lowercase, hyphen separated, 3-60 characters.
 */

/** Unicode combining marks, left over after NFKD decomposition. */
const COMBINING_MARKS = /[̀-ͯ]/g;

export function slugify(value: string): string {
  return (
    value
      .normalize("NFKD")
      // Decompose-then-strip turns "Café" into "cafe" rather than "caf".
      .replace(COMBINING_MARKS, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)
      .replace(/-+$/g, "")
  );
}

/** Four random base-36 characters, from a CSPRNG rather than Math.random. */
export function slugSuffix(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(4));

  return Array.from(bytes, (byte) => (byte % 36).toString(36)).join("");
}

/**
 * Builds a unique-ish slug. Pet names collide constantly ("Bruno", "Simba"),
 * so every slug carries a random suffix instead of probing the table first.
 * The unique index stays the real guarantee; the caller retries on conflict.
 */
export function buildSlug(name: string): string {
  const base = slugify(name);
  const stem = base.length >= 2 ? base : "pet";

  return `${stem}-${slugSuffix()}`;
}
