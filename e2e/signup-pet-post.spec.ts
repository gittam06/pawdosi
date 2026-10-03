import { expect, test } from "@playwright/test";

import {
  E2E_PASSWORD,
  createConfirmedUser,
  deleteUser,
  pngBuffer,
  requireE2EEnv,
  uniqueEmail,
} from "./helpers";

/**
 * The journey that matters: sign up, pick a username, create a pet, post as
 * that pet, and see the post on the pet's public page.
 *
 * The signup *form* is driven through the UI — including its server-side
 * validation — but the account the rest of the journey uses is provisioned
 * already-confirmed through the admin API, for two reasons: a confirmation
 * email cannot be clicked from a test, and Supabase's free tier rate-limits
 * auth emails to a couple an hour, which would make a real signup flaky by
 * the third run of the day.
 */

test.describe("signup → create pet → post", () => {
  let userId: string | undefined;

  test.beforeAll(() => {
    requireE2EEnv();
  });

  test.afterAll(async () => {
    // Cascades to profile, pets, posts and post_images.
    if (userId) await deleteUser(userId);
  });

  test("a new owner can publish a post as their pet", async ({ page }) => {
    const email = uniqueEmail();

    await test.step("the signup form validates on the server", async () => {
      await page.goto("/sign-up");

      // `noValidate` is set, so the browser does not intercept: this round
      // trips through the Server Action and Zod.
      await page.getByLabel("Email").fill("not-an-email");
      await page.getByLabel("Password", { exact: true }).fill("short");
      await page.getByRole("button", { name: "Create account" }).click();

      await expect(
        page.getByText("Enter a valid email address."),
      ).toBeVisible();
      await expect(page.getByText("Use at least 8 characters.")).toBeVisible();
      // The typed email survives the rejection.
      await expect(page.getByLabel("Email")).toHaveValue("not-an-email");
    });

    await test.step("sign in with a confirmed account", async () => {
      userId = await createConfirmedUser(email, "E2E Tester");

      await page.goto("/sign-in");
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(E2E_PASSWORD);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();

      await expect(page).toHaveURL("/");
    });

    await test.step("onboarding is required before anything else", async () => {
      await page.goto("/pets");
      await expect(page).toHaveURL(/\/onboarding/);

      await page.getByLabel("City").fill("Bengaluru");
      await page.getByRole("button", { name: "Finish setup" }).click();

      await expect(page).toHaveURL("/");
    });

    await test.step("create a pet", async () => {
      await page.goto("/pets/new");

      await page.getByLabel("Name").fill("Pixel");
      await page.getByLabel("Species").click();
      await page.getByRole("option", { name: "Dog" }).click();
      await page.getByLabel("Breed").fill("Indie");

      await page.getByRole("button", { name: "Create profile" }).click();

      await expect(page).toHaveURL(/\/pets\/pixel-[a-z0-9]{4}$/);
      // `exact` matters: the posts section has an sr-only "Posts by Pixel".
      await expect(
        page.getByRole("heading", { name: "Pixel", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "No posts yet" }),
      ).toBeVisible();
    });

    const petUrl = page.url();

    await test.step("post as that pet", async () => {
      await page.goto("/posts/new");

      await page.getByLabel("Choose photos").setInputFiles({
        name: "pixel.png",
        mimeType: "image/png",
        buffer: pngBuffer(),
      });

      // Wait for the Cloudinary upload to produce a preview.
      await expect(
        page.getByRole("button", { name: /Remove this photo/ }),
      ).toBeVisible({ timeout: 30_000 });

      await page.getByLabel("Caption").fill("First walk of the morning.");
      await page.getByRole("button", { name: "Publish post" }).click();

      await expect(page).toHaveURL(/\/posts\/[0-9a-f-]{36}$/);
      await expect(page.getByText("First walk of the morning.")).toBeVisible();
    });

    await test.step("the post appears on the pet's public page", async () => {
      await page.goto(petUrl);

      await expect(page.getByText("First walk of the morning.")).toBeVisible();
      // The empty state is gone, which is the real assertion about the count.
      await expect(
        page.getByRole("heading", { name: "No posts yet" }),
      ).toBeHidden();
    });
  });
});
