import { test, expect } from "@playwright/test";

test("Dashboard basic navigation and data", async ({ page }) => {
  const uid = "test-org-1";
  await page.goto(`http://localhost:3000/dashboard/${uid}`, { waitUntil: "networkidle" });

  await expect(page.locator("text=Dashboard —")).toBeVisible();

  // go to NFC
  await page.goto(`http://localhost:3000/dashboard/${uid}/nfc`, { waitUntil: "networkidle" });
  await expect(page.locator("text=Tags NFC")).toBeVisible();

  // if at least one tag exists, click first and check heatmap
  const first = page.locator("table tbody tr").first();
  if (await first.count() > 0) {
    await first.click();
    await expect(page).toHaveURL(/\/dashboard\/.+\/nfc\/.+/);
    await expect(page.locator("text=Heatmap")).toBeVisible();
  }
});
