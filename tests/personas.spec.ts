import { test, expect, catalog, validInfo } from '../fixtures';
import { users } from '../data/users';

// The site ships special users with built-in faults. These tests state the CORRECT behaviour and are marked as
// expected failures (test.fail), the same defects logged in the manual-testing project.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('problem_user', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open(users.problem);
  });

  test('every product shows its own image @known-bug', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-004: all products show the same placeholder image');
    expect(new Set(await inventoryPage.imageSources()).size).toBe(6);
  });

  test('sort by name Z to A reorders the list @known-bug', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-005: sorting has no effect');
    await inventoryPage.sortBy('za');
    expect(await inventoryPage.productNames()).toEqual(catalog.map((p) => p.name).sort().reverse());
  });

  test('Fleece Jacket can be added to the cart @known-bug', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-006: Add to cart does nothing for some products');
    await inventoryPage.addToCart('Sauce Labs Fleece Jacket');
    await inventoryPage.header.expectCartCount(1);
  });

  test('last name can be entered at checkout @known-bug', async ({ inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage }) => {
    test.fail(true, 'BUG-007: last name text is typed into the first name field');
    await inventoryPage.addToCart('Sauce Labs Backpack');
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

  test('sorting works without an error alert @known-bug', async ({ page, inventoryPage }) => {
    test.fail(true, 'BUG-008: sorting raises "Sorting is broken!" alert');
    let alert = '';
    page.on('dialog', async (d) => { alert = d.message(); await d.dismiss(); });
    await inventoryPage.sortBy('za');
    await page.waitForTimeout(300);
    expect(alert).toBe('');
  });

  test('Bolt T-Shirt can be added to the cart @known-bug', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-009: Add to cart does nothing for some products');
    await inventoryPage.addToCart('Sauce Labs Bolt T-Shirt');
    await inventoryPage.header.expectCartCount(1);
  });
});

test.describe('performance_glitch_user', () => {
  test('products appear within 3 seconds of logging in @known-bug', async ({ loginPage, inventoryPage }) => {
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
  test('prices match the standard catalogue @known-bug', async ({ loginPage, inventoryPage }) => {
    test.fail(true, 'BUG-011: prices differ from standard_user');
    await loginPage.open(users.visual);
    expect(await inventoryPage.productPrices()).toEqual(catalog.map((p) => p.price));
  });
});
