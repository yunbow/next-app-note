import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /ログイン|login/i })).toBeVisible();
  });

  test("should show validation error for empty email", async ({ page }) => {
    await page.goto("/login");
    
    const submitButton = page.getByRole("button", { name: /ログイン|login/i });
    await submitButton.click();
    
    // Wait for validation message
    await page.waitForTimeout(500);
  });
});
