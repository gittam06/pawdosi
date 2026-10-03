import { describe, expect, it } from "vitest";

import {
  bioSchema,
  onboardingSchema,
  usernameSchema,
} from "@/lib/validations/profile";

describe("usernameSchema", () => {
  it("accepts lowercase letters, digits and underscores", () => {
    expect(usernameSchema.parse("paw_parent_99")).toBe("paw_parent_99");
  });

  it("lowercases and trims before validating", () => {
    expect(usernameSchema.parse("  PawParent  ")).toBe("pawparent");
  });

  it("rejects anything the database check constraint would reject", () => {
    for (const value of [
      "ab",
      "a".repeat(25),
      "paw parent",
      "paw-parent",
      "påw",
    ]) {
      expect(usernameSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rejects names that collide with a route", () => {
    for (const value of ["settings", "api", "lost-found", "admin"]) {
      expect(usernameSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("bioSchema", () => {
  it("treats an empty string as absent", () => {
    expect(bioSchema.parse("")).toBeUndefined();
  });

  it("rejects more than 300 characters", () => {
    expect(bioSchema.safeParse("x".repeat(301)).success).toBe(false);
  });
});

describe("onboardingSchema", () => {
  it("accepts a complete submission", () => {
    const result = onboardingSchema.parse({
      username: "Meera_N",
      displayName: "  Meera Nair ",
      city: "Bengaluru",
    });

    expect(result).toEqual({
      username: "meera_n",
      displayName: "Meera Nair",
      city: "Bengaluru",
    });
  });

  it("reports every invalid field at once, not just the first", () => {
    const result = onboardingSchema.safeParse({
      username: "a",
      displayName: "",
      city: "x",
    });

    expect(result.success).toBe(false);

    const fields = new Set(
      result.success ? [] : result.error.issues.map((issue) => issue.path[0]),
    );
    expect(fields).toEqual(new Set(["username", "displayName", "city"]));
  });
});
