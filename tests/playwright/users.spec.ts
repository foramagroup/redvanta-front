import { test, expect } from "@playwright/test";

test("Users admin loads", async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page.fill('input[name="email"]', "admin@example.com");
  await page.fill('input[name="password"]', "admin123");
  await page.click("button:has-text('Login')");

  await page.goto("http://localhost:3000/dashboard/users");

  await expect(page.locator("h2")).toHaveText("Users");
});

test("Invite user", async ({ page }) => {
  await page.goto("http://localhost:3000/dashboard/users");

  await page.fill('input[placeholder="Email…"]', "invitee@example.com");
  await page.click("button:has-text('Send Invite')");

  await expect(page).toHaveURL(/users/);
});
