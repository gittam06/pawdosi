import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseReportFilters, reportSchema } from "@/lib/validations/report";

const NOW = new Date("2026-06-15T12:00:00Z");

const VALID = {
  type: "lost",
  species: "cat",
  title: "Missing tabby",
  description: "Grey tabby with a red collar, very shy.",
  city: "Bengaluru",
  locality: "Indiranagar",
  // An absolute instant, offset and all. See the `lastSeenAt` tests below for
  // why a naked "2026-06-14T18:30" is not accepted.
  lastSeenAt: "2026-06-14T18:30:00+05:30",
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("reportSchema", () => {
  it("accepts a minimal valid report", () => {
    expect(reportSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepts a null petId, which is what an unrendered field posts", () => {
    const result = reportSchema.safeParse({ ...VALID, petId: null });

    expect(result.success).toBe(true);
    expect(result.success && result.data.petId).toBeUndefined();
  });

  it("accepts an empty petId from the 'not one of mine' option", () => {
    const result = reportSchema.safeParse({ ...VALID, petId: "" });

    expect(result.success).toBe(true);
    expect(result.success && result.data.petId).toBeUndefined();
  });

  it("rejects a petId that is not a uuid", () => {
    expect(reportSchema.safeParse({ ...VALID, petId: "nope" }).success).toBe(
      false,
    );
  });

  it("rejects a sighting in the future", () => {
    const result = reportSchema.safeParse({
      ...VALID,
      lastSeenAt: "2026-07-01T10:00:00Z",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a description too short to help anyone", () => {
    expect(
      reportSchema.safeParse({ ...VALID, description: "lost" }).success,
    ).toBe(false);
  });
});

describe("lastSeenAt", () => {
  /**
   * These are the regression tests for the bug the old schema had: it accepted
   * a `datetime-local` string with no offset and let `Date.parse` resolve it in
   * the server's zone. On Vercel (UTC) a reporter in India filling in their own
   * local time was five and a half hours "in the future", so the form rejected
   * its own default value — and the suite did not notice, because it only ever
   * ran on a machine whose zone happened to be IST.
   */
  it("rejects a datetime-local string, which carries no timezone", () => {
    const result = reportSchema.safeParse({
      ...VALID,
      lastSeenAt: "2026-06-14T18:30",
    });

    expect(result.success).toBe(false);
  });

  it("accepts the same wall-clock time from either side of UTC", () => {
    for (const offset of ["+05:30", "-07:00", "Z"]) {
      const result = reportSchema.safeParse({
        ...VALID,
        lastSeenAt: `2026-06-14T18:30:00${offset}`,
      });

      expect(result.success, offset).toBe(true);
    }
  });

  /**
   * The case that broke in production: 00:36 IST on the 6th is 19:06 UTC on the
   * 5th — in the past — but reads as "tomorrow" to a server running in UTC.
   */
  it("accepts a reporter's local 'just now' from east of UTC", () => {
    vi.setSystemTime(new Date("2026-06-15T19:06:00Z"));

    const result = reportSchema.safeParse({
      ...VALID,
      lastSeenAt: "2026-06-16T00:36:00+05:30",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a date too old to be a sighting", () => {
    expect(
      reportSchema.safeParse({ ...VALID, lastSeenAt: "1998-01-01T10:00:00Z" })
        .success,
    ).toBe(false);
  });

  it("rejects something that is not a date at all", () => {
    expect(
      reportSchema.safeParse({ ...VALID, lastSeenAt: "yesterday" }).success,
    ).toBe(false);
  });
});

describe("parseReportFilters", () => {
  it("defaults to open reports when no status is given", () => {
    expect(parseReportFilters({}).status).toBe("open");
  });

  it("treats an empty status param as absent", () => {
    expect(parseReportFilters({ status: "" }).status).toBe("open");
  });

  it("maps the 'all' sentinel to no status filter", () => {
    expect(parseReportFilters({ status: "all" }).status).toBeUndefined();
  });

  it("keeps an explicit status", () => {
    expect(parseReportFilters({ status: "reunited" }).status).toBe("reunited");
  });

  it("falls back to open rather than erroring on a junk status", () => {
    expect(parseReportFilters({ status: "banana" }).status).toBe("open");
  });

  it("strips ILIKE wildcards out of the city filter", () => {
    expect(parseReportFilters({ city: "%Beng,alu_ru%" }).city).toBe(
      "Beng alu ru",
    );
  });

  it("takes the first value when a param is repeated", () => {
    expect(parseReportFilters({ species: ["cat", "dog"] }).species).toBe("cat");
  });

  it("ignores an unknown species instead of failing the page", () => {
    expect(parseReportFilters({ species: "dragon" }).species).toBeUndefined();
  });
});
