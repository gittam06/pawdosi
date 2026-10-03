/**
 * Human-readable age from a `YYYY-MM-DD` birth date.
 *
 * Deliberately coarse: "3 years" for anything over two, months for younger
 * animals, because that is how owners actually talk about it.
 */
export function formatAge(birthDate: string | null): string | null {
  if (!birthDate) return null;

  const born = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(born.getTime())) return null;

  const now = new Date();
  let months =
    (now.getUTCFullYear() - born.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - born.getUTCMonth());

  if (now.getUTCDate() < born.getUTCDate()) months -= 1;
  if (months < 0) return null;

  if (months < 1) return "Under a month old";
  if (months < 24) return `${months} ${months === 1 ? "month" : "months"} old`;

  const years = Math.floor(months / 12);
  return `${years} years old`;
}

/** "14 March 2021" — the exact date, for the detail list. */
export function formatBirthDate(birthDate: string | null): string | null {
  if (!birthDate) return null;

  const born = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(born.getTime())) return null;

  return born.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
