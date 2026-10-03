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
 * `datetime-local` posts "YYYY-MM-DDTHH:mm" with no timezone, which the
 * browser means in *local* time. It is converted on the server with the same
 * assumption, so a 6pm sighting is stored as 6pm where the reporter is.
 */
export const lastSeenAtSchema = trimmed
  .min(1, "When was it last seen?")
  .refine((value) => !Number.isNaN(Date.parse(value)), "That is not a date.")
  .refine(
    (value) => Date.parse(value) <= Date.now() + 60_000,
    "That cannot be in the future.",
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
  contactNote: trimmed
    .max(CONTACT_NOTE_LIMIT, `At most ${CONTACT_NOTE_LIMIT} characters.`)
    .optional()
    .or(z.literal("").transform(() => undefined)),
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
