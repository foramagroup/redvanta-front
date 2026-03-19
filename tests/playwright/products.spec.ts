import { test, expect } from "@playwright/test";

test.describe("Products admin", () => {
  test("create -> edit -> delete product", async ({ page }) => {
    // assume admin cookie/session exists or adjust login
    await page.goto("http://localhost:3000/dashboard/products/new");
    await page.fill("input[placeholder='Titre']", "E2E Test Product");
    await page.fill("input[placeholder='Slug']", "e2e-test-product");
    await page.fill("input[placeholder='Prix (ex: 19.90)']", "9.99");
    await page.click("button:has-text('Enregistrer')");
    await page.waitForURL("**/dashboard/products");

    // find created product row
    await page.waitForSelector("text=E2E Test Product");
    const row = page.locator("text=E2E Test Product").first();
    await expect(row).toBeVisible();

    // open edit
    await row.locator("xpath=..").locator("text=Éditer").click();
    await page.waitForSelector("input[placeholder='Titre']");
    await page.fill("input[placeholder='Titre']", "E2E Test Product Edited");
    await page.click("button:has-text('Enregistrer')");
    await page.waitForURL("**/dashboard/products");

    await expect(page.locator("text=E2E Test Product Edited")).toBeVisible();

    // delete via bulk
    await page.click("input[type='checkbox']"); // select all
    await page.click("text=Supprimer");
    await page.click("text=OK"); // confirm if prompt exists (adjust)
  });
});
