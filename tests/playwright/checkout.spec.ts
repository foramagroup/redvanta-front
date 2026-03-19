import { test, expect } from "@playwright/test";

test("Checkout flow: create session and redirect (mocked)", async ({ page }) => {
  // 1) navigue vers la page checkout
  await page.goto("/checkout", { waitUntil: "networkidle" });

  // 2) mock endpoint create-session
  await page.route("**/api/payments/create-session", async (route) => {
    const fake = { url: "https://checkout.stripe.mock/session123", sessionId: "sess_test_123" };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fake) });
  });

  // 3) mock external checkout domain
  await page.route("https://checkout.stripe.mock/*", async (route) => {
    const successRedirect = `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || "http://localhost:3000"}/checkout/success?session_id=sess_test_123`;
    const body = `<html><body>Mock Stripe<br/><a id="complete" href="${successRedirect}">Complete</a></body></html>`;
    await route.fulfill({ status: 200, contentType: "text/html", body });
  });

  // 4) attendre le bouton via data-testid
  const payBtn = page.getByTestId("checkout-pay-btn");
  await expect(payBtn).toBeVisible({ timeout: 7000 });
  await payBtn.click();

  // 5) vérifier qu'on est bien arrivé sur la page success
  await page.waitForURL("**/checkout/success**", { timeout: 10000 });
  await expect(page.locator("text=Paiement réussi")).toHaveCount(1);
});
