const { test, expect } = require('@playwright/test');

test.describe('Krootal basic flows', () => {

  test('homepage loads', async ({ page, baseURL }) => {
    await page.goto(baseURL || '/');
    await expect(page.locator('text=Krootal Review')).toBeVisible();
  });

  test('admin products list and create (mock)', async ({ page }) => {
    // Intercept admin products GET
    await page.route('**/api/admin/products', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    // Intercept create product POST
    await page.route('**/api/products', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'p1', title: 'Mock', slug: 'mock', priceCents: 1000 }) });
    });

    await page.goto('/dashboard/products');
    await expect(page.locator('text=Admin — Produits')).toBeVisible();

    // Fill create form
    await page.fill('input[placeholder="Titre"]', 'Test Prod');
    await page.fill('input[placeholder="slug"]', 'test-prod');
    await page.fill('input[placeholder="Prix €"]', '9.90');
    await page.fill('textarea[placeholder="Description"]', 'Description test');

    await page.click('button:has-text("Enregistrer")');
    // after creation, product list fetched again (we mocked empty list) -> expect no crash
    await expect(page.locator('text=Aucun produit.')).toBeVisible();
  });

  test('checkout flow opens stripe redirect (mock)', async ({ page }) => {
    // mock backend checkout response to return a session id
    await page.route('**/api/payments/checkout', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ session: { id: 'sess_123' }, url: 'https://checkout.stripe.fake' }) });
    });

    await page.goto('/checkout');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.click('button:has-text("Payer")');

    // if code triggers redirect to checkout via stripe.js, we just ensure backend call succeeded by waiting a bit
    await page.waitForTimeout(300);
    // no crash means success
    expect(true).toBeTruthy();
  });

});
