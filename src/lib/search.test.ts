import { describe, expect, it } from "vitest";

import { sanitiseSearchTerm } from "@/lib/search";

/**
 * Regression tests for a confirmed PostgREST filter injection.
 *
 * The old `searchPets` interpolated the term into a quoted `or(...)`
 * expression and escaped only `%` and `_`. Live, on the running app:
 *
 *   /search?q=aa                      -> "No matches"
 *   /search?q=a",breed.ilike."%       -> matched every pet
 *   /search?q=%%                      -> matched every pet
 *
 * The second escaped the quoted value and appended its own filter; the third
 * showed the wildcard escaping never worked inside a quoted value at all.
 */
describe("sanitiseSearchTerm", () => {
  it("leaves an ordinary search alone", () => {
    expect(sanitiseSearchTerm("Bruno")).toBe("Bruno");
    expect(sanitiseSearchTerm("  golden retriever ")).toBe("golden retriever");
  });

  it("removes the quote that closed the filter value", () => {
    expect(sanitiseSearchTerm('a",breed.ilike."%')).toBe("a breed.ilike.");
  });

  it("removes LIKE wildcards instead of trying to escape them", () => {
    expect(sanitiseSearchTerm("%%")).toBe("");
    expect(sanitiseSearchTerm("a_b")).toBe("a b");
    // PostgREST rewrites `*` to `%`, so it is a wildcard too.
    expect(sanitiseSearchTerm("a*b")).toBe("a b");
  });

  it("removes a backslash, which defeated the old escaping", () => {
    expect(sanitiseSearchTerm("\\%")).toBe("");
  });

  it("removes the expression syntax of an or(...) filter", () => {
    expect(sanitiseSearchTerm('a")or(id.not.is.null')).toBe(
      "a or id.not.is.null",
    );
  });

  it("collapses what is left so a stripped term cannot pass the length check", () => {
    // "%_" would otherwise become "  " and read as two characters.
    expect(sanitiseSearchTerm("%_").length).toBe(0);
  });
});
