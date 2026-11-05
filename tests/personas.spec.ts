import { test, expect, catalog, validInfo } from '../fixtures';
import { users } from '../data/users';

// The site ships special users with built-in faults. These tests state the CORRECT behaviour and are marked as
// expected failures (test.fail), the same defects logged in the manual-testing project.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('problem_user', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open(users.problem);
  });

  test('[TC-022] every product shows its own image [BUG-004] @known-bug', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-004: all products show the same placeholder image');
    expect(new Set(await inventoryPage.imageSources()).size).toBe(6);
  });

  test('[TC-028] sort by name Z to A reorders the list [BUG-005] @known-bug', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-005: sorting has no effect');
    await inventoryPage.sortBy('za');
    expect(await inventoryPage.productNames()).toEqual(catalog.map((p) => p.name).sort().reverse());
  });

  test('[TC-035] Fleece Jacket can be added to the cart [BUG-006] @known-bug', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-006: Add to cart does nothing for some products');
    await inventoryPage.addToCart('Sauce Labs Fleece Jacket');
    await inventoryPage.header.expectCartCount(1);
  });

  test('[TC-036] an added product can be removed again [BUG-006] @known-bug', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-006: Remove does nothing for some products');
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.removeFromCart('Sauce Labs Backpack');
    await expect(inventoryPage.addButton('Sauce Labs Backpack')).toBeVisible();
  });

  test('[TC-046] last name can be entered at checkout [BUG-007] @known-bug', async ({ shopWithCart, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage }) => {
    test.fail(true, 'BUG-007: last name text is typed into the first name field');
    await shopWithCart('Sauce Labs Backpack');
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutInfoPage.submit(validInfo);
    await checkoutOverviewPage.expectOnPage();
  });
});

test.describe('error_user', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open(users.error);
  });

  test('[TC-029] sorting works without an error alert [BUG-008] @known-bug', async ({ page, inventoryPage }) => {
    test.fail(true, 'BUG-008: sorting raises "Sorting is broken!" alert');
    const alert = page.waitForEvent('dialog', { timeout: 2000 }).catch(() => null);
    await inventoryPage.sortBy('za');
    const dialog = await alert;
    if (dialog) await dialog.dismiss();
    expect(dialog && dialog.message(), 'an alert was shown').toBeNull();
  });

  test('[TC-037] Bolt T-Shirt can be added to the cart [BUG-009] @known-bug', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-009: Add to cart does nothing for some products');
    await inventoryPage.addToCart('Sauce Labs Bolt T-Shirt');
    await inventoryPage.header.expectCartCount(1);
  });

  test('[TC-047] an order can be finished [BUG-010] @known-bug', async ({ shopWithCart, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage }) => {
    test.fail(true, 'BUG-010: Finish does nothing, the order is not placed');
    await shopWithCart('Sauce Labs Backpack');
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutInfoPage.submit(validInfo);
    await checkoutOverviewPage.finish();
    await checkoutCompletePage.expectOrderPlaced();
  });
});

test.describe('performance_glitch_user', () => {
  test('[TC-014] products appear within 3 seconds of logging in [BUG-012] @known-bug', async ({ loginPage, inventoryPage }) => {
    test.fail(true, 'BUG-012: products take about 5 seconds to appear after login');
    await loginPage.goto();
    await loginPage.username.fill(users.performanceGlitch.username);
    await loginPage.password.fill(users.performanceGlitch.password);
    const start = Date.now();
    await loginPage.loginButton.click();
    await inventoryPage.items.first().waitFor();
    expect(Date.now() - start).toBeLessThan(3000);
  });
});

test.describe('visual_user', () => {
  test('[TC-023] prices match the standard catalogue [BUG-011] @known-bug', async ({ loginPage, inventoryPage }) => {
    test.fail(true, 'BUG-011: prices differ from standard_user');
    await loginPage.open(users.visual);
    expect(await inventoryPage.productPrices()).toEqual(catalog.map((p) => p.price));
  });
});
