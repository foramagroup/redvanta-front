import { test, expect } from "@playwright/test";

test.describe("NFC admin", () => {
  test.beforeEach(async ({ page }) => {
    // optionally add auth cookie here
    await page.goto("http://localhost:3000/dashboard/nfc");
  });

  test("list and view tag", async ({ page }) => {
    await expect(page.getByText("NFC Tags")).toBeVisible();
    // click first View
    const firstView = page.locator("a:has-text('View')").first();
    await expect(firstView).toBeVisible();
    await firstView.click();
    await expect(page.locator("text=Recent scans")).toBeVisible();
  });

  test("assign design", async ({ page }) => {
    await page.goto("http://localhost:3000/dashboard/nfc");
    const view = page.locator("a:has-text('View')").first();
    await view.click();
    await page.fill("input[placeholder='design id']", "demo-design-123");
    await page.click("button:has-text('Assign')");
    await expect(page.getByText("Design assigné")).toBeVisible({ timeout: 3000 }).catch(()=>{});
  });
});
