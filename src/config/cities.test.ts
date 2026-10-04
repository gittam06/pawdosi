import { describe, expect, it } from "vitest";

import { CITIES, suggestCities } from "@/config/cities";

const names = (query: string) => suggestCities(query).map((city) => city.name);

describe("suggestCities", () => {
  it("puts prefix matches first — 'new' finds New Delhi, not Nellore", () => {
    const result = names("new");

    expect(result[0]).toBe("New Delhi");
    expect(result.indexOf("New Delhi")).toBeLessThan(
      result.indexOf("Nellore") === -1 ? Infinity : result.indexOf("Nellore"),
    );
  });

  it("is case-insensitive and ignores surrounding space", () => {
    expect(names("  BENGAL")).toContain("Bengaluru");
  });

  it("matches inside the name, not only at the start", () => {
    expect(names("bad")).toContain("Ahmedabad");
  });

  it("falls back to the state, so 'kerala' finds its cities", () => {
    expect(names("kerala")).toContain("Kochi");
  });

  it("shows a starter list when nothing is typed", () => {
    expect(suggestCities("").length).toBeGreaterThan(0);
  });

  it("never returns more than it can show", () => {
    // "a" matches a large share of the list.
    expect(suggestCities("a").length).toBeLessThanOrEqual(8);
  });

  it("returns nothing for a city that is not listed", () => {
    expect(suggestCities("zzzzzz")).toEqual([]);
  });

  it("has no duplicate city/state pairs", () => {
    const keys = CITIES.map((city) => `${city.name}|${city.state}`);

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("only lists names the city length constraint accepts", () => {
    for (const city of CITIES) {
      expect(city.name.length).toBeGreaterThanOrEqual(2);
      expect(city.name.length).toBeLessThanOrEqual(60);
    }
  });
});
