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
  lastSeenAt: "2026-06-14T18:30",
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
      lastSeenAt: "2026-07-01T10:00",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a description too short to help anyone", () => {
    expect(
      reportSchema.safeParse({ ...VALID, description: "lost" }).success,
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
