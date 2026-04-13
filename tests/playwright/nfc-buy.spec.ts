import { test, expect } from "@playwright/test";

test("NFC buy flow: create checkout session and redirect (mocked)", async ({ page }) => {
  await page.goto("/nfc/buy", { waitUntil: "networkidle" });

  // 1) mock API create checkout
  await page.route("**/nfc/pay/checkout", async (route) => {
    const fake = { url: "https://checkout.stripe.mock/session_nfc_123", sessionId: "sess_nfc_123" };
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(fake) });
  });

  // 2) mock external checkout page
  await page.route("https://checkout.stripe.mock/*", async (route) => {
    const successRedirect = `${process.env.NEXT_PUBLIC_FRONTEND_ORIGIN || "http://localhost:3000"}/nfc/buy/success?session_id=sess_nfc_123`;
    const body = `<html><body>Mock Stripe NFC<br/><a id="complete" href="${successRedirect}">Complete</a></body></html>`;
    await route.fulfill({ status: 200, contentType: "text/html", body });
  });

  // 3) trouver et cliquer sur le bouton via data-testid
  const buyBtn = page.getByTestId("nfc-buy-first") || page.locator('button:has-text("Acheter")').first();
  await expect(buyBtn).toBeVisible({ timeout: 7000 });
  await buyBtn.click();

  // 4) simuler le paiement et vérifier la success page
  await page.waitForURL("**/nfc/buy/success**", { timeout: 10000 });
  await expect(page.locator("text=Paiement réussi")).toHaveCount(1);
});
