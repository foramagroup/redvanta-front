import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

test.describe("Checkout / Stripe mock", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("user creates checkout session and is redirected (mock)", async ({ page }) => {
    // navigate to checkout page
    await page.goto("http://localhost:3000/checkout");

    // intercept backend create-session call and return a fake session url
    await page.route("**/api/payments/create-session", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "http://localhost:3000/mock-stripe-checkout-session", sessionId: "sess_test_123" })
      });
    });

    // wait for pay button
    const payBtn = page.getByRole("button", { name: /payer|checkout|pay/i }).first();
    await expect(payBtn).toBeVisible({ timeout: 7000 });
    await payBtn.click();

    // check that we navigated to the mocked stripe url
    await page.waitForURL("http://localhost:3000/mock-stripe-checkout-session", { timeout: 5000 });
    expect(page.url()).toContain("/mock-stripe-checkout-session");
  });
});
