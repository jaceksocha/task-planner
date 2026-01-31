import { test, expect } from "@playwright/test";

test.describe("Category Management", () => {
  // Note: These tests require authentication
  // For CI, you would set up a test user and authenticate before each test

  test.beforeEach(async ({ page }) => {
    const email = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!email || !password) {
      test.skip();
      return;
    }

    // Login before each test
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL("/");
  });

  test.skip("should open categories dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Categories" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Manage Categories" })).toBeVisible();
  });

  test.skip("should create a new category", async ({ page }) => {
    await page.getByRole("button", { name: "Categories" }).click();

    // Fill in category name
    await page.getByPlaceholder("Category name").fill("E2E Test Category");

    // Select a color (first one)
    await page.locator('button[aria-label^="Select color"]').first().click();

    // Click add button
    await page.getByRole("button", { name: "Add" }).click();

    // Category should appear in list
    await expect(page.getByText("E2E Test Category")).toBeVisible();
  });

  test.skip("should edit a category", async ({ page }) => {
    // First create a category
    await page.getByRole("button", { name: "Categories" }).click();
    await page.getByPlaceholder("Category name").fill("Category to Edit");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("Category to Edit")).toBeVisible();

    // Click edit button
    await page.getByText("Category to Edit").locator("..").getByRole("button").first().click();

    // Edit the category
    await page.getByPlaceholder("Category name").clear();
    await page.getByPlaceholder("Category name").fill("Edited Category");
    await page.getByRole("button", { name: "Save" }).click();

    // Verify changes
    await expect(page.getByText("Edited Category")).toBeVisible();
  });

  test.skip("should delete a category", async ({ page }) => {
    // First create a category
    await page.getByRole("button", { name: "Categories" }).click();
    await page.getByPlaceholder("Category name").fill("Category to Delete");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("Category to Delete")).toBeVisible();

    // Click delete button
    await page
      .getByText("Category to Delete")
      .locator("..")
      .getByRole("button")
      .filter({ hasText: /delete/i })
      .click();

    // Confirm deletion
    page.on("dialog", (dialog) => dialog.accept());

    // Category should be removed
    await expect(page.getByText("Category to Delete")).not.toBeVisible();
  });

  test.skip("should show categories in task form", async ({ page }) => {
    // Create a category first
    await page.getByRole("button", { name: "Categories" }).click();
    await page.getByPlaceholder("Category name").fill("Test Category for Task");
    await page.getByRole("button", { name: "Add" }).click();
    await page.getByRole("button", { name: "Done" }).click();

    // Open task creation dialog
    await page.getByRole("button", { name: "Add Task" }).click();

    // Category should be selectable
    await page.getByRole("combobox", { name: "Category" }).click();
    await expect(page.getByRole("option", { name: "Test Category for Task" })).toBeVisible();
  });
});
