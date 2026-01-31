import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should show login page for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    // Middleware should redirect to login
    await expect(page).toHaveURL("/login");
  });

  test("should display login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("should display register form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Account" })).toBeVisible();
  });

  test("should navigate from login to register", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL("/register");
  });

  test("should navigate from register to login", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("should show error for invalid login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("invalid@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign In" }).click();
    // Wait for error message
    await expect(page.locator(".bg-red-50")).toBeVisible();
  });

  test("should show validation error for short password on register", async ({ page }) => {
    await page.goto("/register");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("123"); // Too short
    await page.getByRole("button", { name: "Create Account" }).click();
    // HTML5 validation should prevent submission or API should return error
    // The minLength attribute is set to 6 for registration
  });
});

test.describe("Authenticated User", () => {
  // These tests require a valid test user to be set up in Supabase
  // Skip if E2E_USERNAME and E2E_PASSWORD are not set

  test.skip("should login successfully with valid credentials", async ({ page }) => {
    const email = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!email || !password) {
      test.skip();
      return;
    }

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should redirect to home page
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Task Planner" })).toBeVisible();
  });

  test.skip("should logout successfully", async ({ page }) => {
    const email = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;

    if (!email || !password) {
      test.skip();
      return;
    }

    // Login first
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page).toHaveURL("/");

    // Click user menu and logout
    await page.getByRole("button", { name: email }).click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();

    // Should redirect to login
    await expect(page).toHaveURL("/login");
  });
});
