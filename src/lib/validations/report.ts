import { z } from "zod";

import { SPECIES_VALUES } from "@/config/pets";

const trimmed = z.string().trim();

export const DESCRIPTION_LIMIT = 1000;
export const CONTACT_NOTE_LIMIT = 200;

export const reportTypeSchema = z.enum(["lost", "found"], {
  message: "Pick lost or found.",
});

export const reportStatusSchema = z.enum(["open", "reunited"]);

/**
 * ISO-8601 with an explicit offset: "2026-10-06T00:36:00+05:30" or a `Z`.
 *
 * `datetime-local` posts "YYYY-MM-DDTHH:mm" with no timezone at all, which
 * `Date.parse` then resolves in whatever zone the *server* runs in — UTC on
 * Vercel, not the reporter's. A reporter in India filling in their own local
 * time would have it read as UTC: five and a half hours in the future, so the
 * "cannot be in the future" check below rejected the form's own default value,
 * and anything that did get through was stored 5h30m off.
 *
 * So the offset is not optional here. The browser resolves the instant (it is
 * the only party that knows its own zone) and posts that; the visible input
 * keeps showing local time. Requiring the offset means a naked local string is
 * now a validation failure rather than a silent five-hour error.
 */
const ISO_INSTANT =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;

/** Older than this is a typo, not a sighting. */
const EARLIEST_LAST_SEEN = Date.UTC(2000, 0, 1);

export const lastSeenAtSchema = trimmed
  .min(1, "When was it last seen?")
  .refine(
    (value) => ISO_INSTANT.test(value) && !Number.isNaN(Date.parse(value)),
    "That is not a date.",
  )
  .refine(
    (value) => Date.parse(value) <= Date.now() + 60_000,
    "That cannot be in the future.",
  )
  .refine(
    (value) => Date.parse(value) >= EARLIEST_LAST_SEEN,
    "That date is too far in the past.",
  );

export const reportSchema = z.object({
  type: reportTypeSchema,
  species: z.enum(SPECIES_VALUES, { message: "Pick a species." }),
  title: trimmed
    .min(3, "At least 3 characters.")
    .max(80, "At most 80 characters."),
  description: trimmed
    .min(10, "A few more details would help.")
    .max(DESCRIPTION_LIMIT, `At most ${DESCRIPTION_LIMIT} characters.`),
  city: trimmed.min(2, "At least 2 characters.").max(60, "At most 60."),
  locality: trimmed.min(2, "Which area?").max(80, "At most 80 characters."),
  lastSeenAt: lastSeenAtSchema,
  // Transform after `.optional()`, not as a `.or()` branch: a union takes the
  // first matching branch and `z.string().max()` matches "".
  contactNote: trimmed
    .max(CONTACT_NOTE_LIMIT, `At most ${CONTACT_NOTE_LIMIT} characters.`)
    .optional()
    .transform((value) => value || undefined),
  // `nullish`, not `optional`: when the pet picker is not rendered at all,
  // `formData.get("petId")` is null rather than undefined, and a schema that
  // only tolerates undefined fails on a field the user cannot even see.
  petId: z
    .union([z.uuid(), z.literal("")])
    .nullish()
    .transform((value) => value || undefined),
  image: z
    .object({ publicId: trimmed.min(1).max(200), url: z.url() })
    .optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;

/**
 * Board filters. Every field is optional and comes from the query string, so
 * each one is parsed leniently: an unknown value means "no filter", not an
 * error page.
 */
export const reportFiltersSchema = z.object({
  // `%` would widen an ILIKE pattern and `,` is a PostgREST value separator,
  // so neither survives into the query.
  city: trimmed
    .max(60)
    .transform((value) => value.replace(/[%,_]/g, " ").trim())
    .optional(),
  species: z.enum(SPECIES_VALUES).optional(),
  type: reportTypeSchema.optional(),
  status: reportStatusSchema.optional(),
});

export type ReportFilters = z.infer<typeof reportFiltersSchema>;

/** Explicit "show both" — distinct from an absent param, which means "open". */
export const STATUS_ALL = "all";

export function parseReportFilters(
  params: Record<string, string | string[] | undefined>,
): ReportFilters {
  const single = (key: string): string | undefined => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  // The board defaults to open reports — resolved ones are history, and a
  // board full of history is a board nobody scans. "all" is therefore its own
  // value rather than the absence of one, otherwise clearing the filter and
  // asking for everything would be indistinguishable.
  const rawStatus = single("status");
  const status = rawStatus === STATUS_ALL ? undefined : rawStatus || "open";

  const parsed = reportFiltersSchema.safeParse({
    city: single("city") || undefined,
    species: single("species") || undefined,
    type: single("type") || undefined,
    status,
  });

  return parsed.success ? parsed.data : { status: "open" };
}
