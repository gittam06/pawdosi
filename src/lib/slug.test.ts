import { describe, expect, it } from "vitest";

import { buildSlug, slugify, slugSuffix } from "@/lib/slug";

const SLUG_CONSTRAINT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Bruno The Beagle")).toBe("bruno-the-beagle");
  });

  it("strips accents rather than the letters carrying them", () => {
    expect(slugify("Café")).toBe("cafe");
    expect(slugify("Zoë")).toBe("zoe");
  });

  it("collapses runs of punctuation into a single hyphen", () => {
    expect(slugify("Mr.  Whiskers!!! (the third)")).toBe(
      "mr-whiskers-the-third",
    );
  });

  it("never leaves a leading or trailing hyphen", () => {
    expect(slugify("  ...Simba...  ")).toBe("simba");
  });

  it("caps length without leaving a trailing hyphen behind", () => {
    const slug = slugify(`${"a".repeat(38)} tail`);

    expect(slug.length).toBeLessThanOrEqual(40);
    expect(slug.endsWith("-")).toBe(false);
  });

  it("returns an empty string when there is nothing usable", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("🐶")).toBe("");
  });
});

describe("slugSuffix", () => {
  it("is four base-36 characters", () => {
    for (let i = 0; i < 50; i += 1) {
      expect(slugSuffix()).toMatch(/^[a-z0-9]{4}$/);
    }
  });
});

describe("buildSlug", () => {
  it("satisfies the database check constraint", () => {
    const names = [
      "Bruno",
      "Café",
      "!!!",
      "🐶",
      "A",
      "Mr. Whiskers (the third)",
      "x".repeat(200),
    ];

    for (const name of names) {
      expect(buildSlug(name)).toMatch(SLUG_CONSTRAINT);
    }
  });

  it("falls back to 'pet' when the name yields nothing", () => {
    expect(buildSlug("🐶")).toMatch(/^pet-[a-z0-9]{4}$/);
  });

  it("differs between calls for the same name", () => {
    const slugs = new Set(Array.from({ length: 20 }, () => buildSlug("Bruno")));

    // 36^4 possibilities: 20 draws colliding every time would be a broken RNG.
    expect(slugs.size).toBeGreaterThan(1);
  });
});
