import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatAge, formatBirthDate } from "@/lib/pet-age";

// Ages are relative to "now", so the clock is pinned.
const NOW = new Date("2026-06-15T12:00:00Z");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("formatAge", () => {
  it("returns null without a birth date", () => {
    expect(formatAge(null)).toBeNull();
  });

  it("returns null for an unparseable date", () => {
    expect(formatAge("not-a-date")).toBeNull();
  });

  it("describes the first month in words, not '0 months'", () => {
    expect(formatAge("2026-06-01")).toBe("Under a month old");
  });

  it("uses months below two years", () => {
    expect(formatAge("2026-05-15")).toBe("1 month old");
    expect(formatAge("2025-06-15")).toBe("12 months old");
    expect(formatAge("2024-07-15")).toBe("23 months old");
  });

  it("switches to years at two", () => {
    expect(formatAge("2024-06-15")).toBe("2 years old");
    expect(formatAge("2020-01-01")).toBe("6 years old");
  });

  it("does not count a month until the day of the month arrives", () => {
    // One day short of two months.
    expect(formatAge("2026-04-16")).toBe("1 month old");
  });

  it("returns null for a future date rather than a negative age", () => {
    expect(formatAge("2027-01-01")).toBeNull();
  });
});

describe("formatBirthDate", () => {
  it("formats in UTC, so the date never slips a day", () => {
    expect(formatBirthDate("2023-04-18")).toBe("18 April 2023");
  });

  it("returns null for missing or invalid input", () => {
    expect(formatBirthDate(null)).toBeNull();
    expect(formatBirthDate("nope")).toBeNull();
  });
});
