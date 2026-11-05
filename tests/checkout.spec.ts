import { test, expect, STANDARD_STATE, validInfo } from '../fixtures';
import { byName, round2, TAX_RATE } from '../data/products';
import { missingField } from '../data/checkout';

test.use({ storageState: STANDARD_STATE });

const BACKPACK = 'Sauce Labs Backpack';
const BIKE = 'Sauce Labs Bike Light';
const JACKET = 'Sauce Labs Fleece Jacket';

test.describe('Checkout', () => {
  test('buy one product end to end @smoke @regression', async ({ shopWithCart, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage }) => {
    await shopWithCart(BACKPACK);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutInfoPage.expectOnPage();
    await checkoutInfoPage.submit(validInfo);
    await checkoutOverviewPage.expectOnPage();
    await checkoutOverviewPage.finish();
    await checkoutCompletePage.expectOrderPlaced();
  });

  test('order totals are calculated correctly for several products @smoke @regression', async ({ shopWithCart, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage }) => {
    const names = [BACKPACK, BIKE, JACKET];
    await shopWithCart(...names);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutInfoPage.submit(validInfo);

    const subtotal = round2(names.reduce((sum, n) => sum + byName(n).price, 0));
    const tax = round2(subtotal * TAX_RATE);
    expect(await checkoutOverviewPage.itemNames()).toEqual(names);
    expect(await checkoutOverviewPage.subtotal()).toBe(subtotal);
    expect(await checkoutOverviewPage.tax()).toBe(tax);
    expect(await checkoutOverviewPage.total()).toBe(round2(subtotal + tax));
  });

  test('after the order the cart is empty and Back Home works @regression', async ({ shopWithCart, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage }) => {
    await shopWithCart(BIKE);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutInfoPage.submit(validInfo);
    await checkoutOverviewPage.finish();
    await checkoutCompletePage.header.expectCartCount(0);
    await checkoutCompletePage.backHome();
    await inventoryPage.expectOnPage();
  });

  for (const c of missingField) {
    test(`missing ${c.title} shows an error @regression`, async ({ shopWithCart, inventoryPage, cartPage, checkoutInfoPage }) => {
      await shopWithCart(BACKPACK);
      await inventoryPage.header.openCart();
      await cartPage.checkout();
      await checkoutInfoPage.submit(c.info);
      await checkoutInfoPage.expectError(c.error);
      await checkoutInfoPage.expectOnPage();
    });
  }

  test('Cancel leaves the checkout and keeps the cart @regression', async ({ shopWithCart, inventoryPage, cartPage, checkoutInfoPage }) => {
    await shopWithCart(BACKPACK);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutInfoPage.cancel();
    await expect(checkoutInfoPage.firstName).toHaveCount(0);
    await inventoryPage.header.expectCartCount(1);
  });
});

test.describe('Checkout: known defects', () => {
  // Each test states the CORRECT behaviour and is marked as an expected failure (see the manual-testing project).
  test('checkout is blocked when the cart is empty @known-bug', async ({ page, inventoryPage, cartPage }) => {
    test.fail(true, 'BUG-001: empty cart can be checked out');
    await inventoryPage.goto();
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    // Correct behaviour: the form never opens. Wait up to 3 s for a wrong navigation instead of
    // asserting instantly (the page changes a moment after the click).
    const reachedForm = await page.waitForURL(/checkout-step-one/, { timeout: 3000 }).then(() => true, () => false);
    expect(reachedForm, 'checkout form opened with an empty cart').toBe(false);
  });

  test('postal code with letters is rejected @known-bug', async ({ shopWithCart, inventoryPage, cartPage, checkoutInfoPage }) => {
    test.fail(true, 'BUG-002: any text is accepted as a postal code');
    await shopWithCart(BACKPACK);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutInfoPage.submit({ ...validInfo, postalCode: 'abc!@#' });
    await expect(checkoutInfoPage.error).toBeVisible();
  });

  test('whitespace-only names are rejected @known-bug', async ({ shopWithCart, inventoryPage, cartPage, checkoutInfoPage }) => {
    test.fail(true, 'BUG-002: whitespace-only values are accepted');
    await shopWithCart(BACKPACK);
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutInfoPage.submit({ firstName: '   ', lastName: '   ', postalCode: '   ' });
    await expect(checkoutInfoPage.error).toBeVisible();
  });
});
