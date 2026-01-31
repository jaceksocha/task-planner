import { test, expect } from "@playwright/test";

test.describe("Task Management", () => {
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

  test.skip("should display task list page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Task Planner" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Task" })).toBeVisible();
  });

  test.skip("should open create task dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Add Task" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Create Task" })).toBeVisible();
  });

  test.skip("should create a new task", async ({ page }) => {
    await page.getByRole("button", { name: "Add Task" }).click();

    await page.getByLabel("Title").fill("Test Task E2E");
    await page.getByLabel("Description").fill("This is a test task created by E2E tests");

    await page.getByRole("button", { name: "Create Task" }).click();

    // Dialog should close and task should appear in list
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(page.getByText("Test Task E2E")).toBeVisible();
  });

  test.skip("should edit a task", async ({ page }) => {
    // First create a task
    await page.getByRole("button", { name: "Add Task" }).click();
    await page.getByLabel("Title").fill("Task to Edit");
    await page.getByRole("button", { name: "Create Task" }).click();
    await expect(page.getByText("Task to Edit")).toBeVisible();

    // Click edit on the task (using the menu)
    await page.getByText("Task to Edit").locator("..").getByRole("button").first().click();
    await page.getByRole("menuitem", { name: "Edit" }).click();

    // Edit the task
    await page.getByLabel("Title").fill("Edited Task");
    await page.getByRole("button", { name: "Save Changes" }).click();

    // Verify changes
    await expect(page.getByText("Edited Task")).toBeVisible();
    await expect(page.getByText("Task to Edit")).not.toBeVisible();
  });

  test.skip("should toggle task completion", async ({ page }) => {
    // Find a task and toggle its checkbox
    const taskCard = page.locator('[data-testid="task-card"]').first();
    const checkbox = taskCard.locator('button[role="checkbox"]');

    const wasChecked = await checkbox.getAttribute("aria-checked");

    await checkbox.click();

    // Verify state changed
    const isChecked = await checkbox.getAttribute("aria-checked");
    expect(isChecked).not.toBe(wasChecked);
  });

  test.skip("should delete a task", async ({ page }) => {
    // First create a task to delete
    await page.getByRole("button", { name: "Add Task" }).click();
    await page.getByLabel("Title").fill("Task to Delete");
    await page.getByRole("button", { name: "Create Task" }).click();
    await expect(page.getByText("Task to Delete")).toBeVisible();

    // Delete the task
    await page.getByText("Task to Delete").locator("..").getByRole("button").first().click();
    await page.getByRole("menuitem", { name: "Delete" }).click();

    // Confirm deletion
    page.on("dialog", (dialog) => dialog.accept());

    // Task should be removed
    await expect(page.getByText("Task to Delete")).not.toBeVisible();
  });

  test.skip("should filter tasks by status", async ({ page }) => {
    // Select a status filter
    await page.getByRole("combobox", { name: "Status" }).click();
    await page.getByRole("option", { name: "To Do" }).click();

    // URL should update with filter
    await expect(page).toHaveURL(/status=todo/);
  });

  test.skip("should filter tasks by priority", async ({ page }) => {
    // Select a priority filter
    await page.getByRole("combobox", { name: "Priority" }).click();
    await page.getByRole("option", { name: "High" }).click();

    // URL should update with filter
    await expect(page).toHaveURL(/priority=high/);
  });
});
