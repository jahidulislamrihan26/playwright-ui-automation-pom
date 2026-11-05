import { test, expect, STANDARD_STATE } from '../fixtures';

// What happens when a shopper types an address or uses the Back button (manual-testing charter 5).
test.use({ storageState: STANDARD_STATE });

test.describe('Addresses and the Back button @navigation', () => {
  for (const id of ['?id=999', '?id=abc', '?id=-1', '']) {
    test(`[TC-071] product page with id "${id || '(none)'}" shows a not-found state @regression`, async ({ page }) => {
      await page.goto(`/inventory-item.html${id}`);
      await expect(page.getByTestId('inventory-item-name')).toHaveText('ITEM NOT FOUND');
    });
  }

  test('[TC-072] the product not-found page uses plain language [BUG-019] @known-bug', async ({ page }) => {
    test.fail(true, 'BUG-019: the message is worded for a telephone line');
    await page.goto('/inventory-item.html?id=999');
    await expect(page.getByTestId('inventory-item-name')).toHaveText('ITEM NOT FOUND');
    await expect(page.locator('body')).not.toContainText('your call could not be completed');
  });

  test('[TC-072] an unknown address shows a helpful page [BUG-019] @known-bug', async ({ page }) => {
    test.fail(true, 'BUG-019: unknown addresses show a blank page');
    await page.goto('/nonexistent-page.html');
    const visibleText = (await page.locator('body').innerText()).trim();
    expect(visibleText.length, 'the page shows some text').toBeGreaterThan(0);
  });

  test('[TC-073] the order confirmation cannot be opened without an order [BUG-014] @known-bug', async ({ page, checkoutCompletePage }) => {
    test.fail(true, 'BUG-014: "Thank you for your order!" is shown without an order');
    await page.goto('/checkout-complete.html');
    await expect(checkoutCompletePage.confirmation).toBeHidden();
  });

  test('[TC-074] the checkout overview cannot be opened with an empty cart [BUG-015] @known-bug', async ({ page }) => {
    test.fail(true, 'BUG-015: the overview opens with a $0.00 total and a working Finish button');
    await page.goto('/checkout-step-two.html');
    await expect(page.getByTestId('finish')).toBeHidden();
  });

  test('[TC-075] the Back button after an order does not allow finishing it again [BUG-015] @known-bug', async ({ page, completeOrder }) => {
    test.fail(true, 'BUG-015: Back returns to the overview and Finish accepts a second, empty order');
    await completeOrder('Sauce Labs Backpack');
    await page.goBack();
    await expect(page.getByTestId('finish')).toBeHidden();
  });
});
