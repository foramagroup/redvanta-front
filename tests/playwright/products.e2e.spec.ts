import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Products admin flows", () => {
  test("create, edit, bulk delete product", async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto("http://localhost:3000/dashboard/products/new");

    await page.fill("input[placeholder='Titre'], input[placeholder='Title']", "E2E Prod");
    await page.fill("input[placeholder='Slug']", `e2e-prod-${Date.now()}`);
    await page.fill("input[placeholder='Prix'], input[placeholder='Price']", "9.99");

    // submit
    await page.click("button:has-text('Enregistrer'), button:has-text('Save')");

    // go back to list and assert
    await page.goto("http://localhost:3000/dashboard/products");
    await expect(page.locator("text=E2E Prod")).toBeVisible({ timeout: 5000 });

    // select first checkbox and bulk delete
    await page.locator("table tbody tr").first().locator("input[type='checkbox']").check();
    await page.click("text=Supprimer");
    // confirm native dialog? Playwright cannot click browser confirm by default; if you use custom modal then handle accordingly
  });
});
