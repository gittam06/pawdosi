const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> =
  [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
    { amount: Number.POSITIVE_INFINITY, unit: "year" },
  ];

/**
 * "3 hours ago", "last week".
 *
 * Rendered on the server, so it is correct at request time and then frozen —
 * acceptable for a feed, and it avoids a hydration mismatch from two clocks
 * disagreeing. Pair it with an absolute `title`/`dateTime` for precision.
 */
export function relativeTime(timestamp: string): string {
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return "";

  let duration = (then - Date.now()) / 1000;

  for (const { amount, unit } of DIVISIONS) {
    if (Math.abs(duration) < amount) {
      return formatter.format(Math.round(duration), unit);
    }

    duration /= amount;
  }

  return "";
}

/**
 * The zone these timestamps are rendered in.
 *
 * `toLocaleString` with no `timeZone` uses the *server's* zone, which is UTC on
 * Vercel — so "last seen at 6pm" came out as 12:30pm for every reader. Since
 * this renders on the server there is no viewer zone to use, and the audience
 * is one country, so it is pinned rather than guessed. The offset is shown so
 * the reading is never ambiguous. Revisit when Pawdosi leaves IST.
 */
const DISPLAY_TIME_ZONE = "Asia/Kolkata";

export function absoluteTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: DISPLAY_TIME_ZONE,
    timeZoneName: "short",
  });
}
