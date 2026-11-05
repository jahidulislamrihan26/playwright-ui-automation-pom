import { test, expect, STANDARD_STATE, validInfo } from '../fixtures';

// Keyboard use (manual-testing charter 6). An automated axe scan cannot see most of this, which is why it is tested directly.
test.use({ storageState: STANDARD_STATE });

test.describe('Keyboard @a11y @keyboard', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await expect(inventoryPage.items.first()).toBeVisible();
  });

  test('[TC-081] Tab order on the products page is logical @regression', async ({ page, inventoryPage }) => {
    const order: string[] = [];
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      order.push(await inventoryPage.focusedKey());
    }
    // menu, sort, then the first product: image link, name link, Add to cart button
    expect(order).toEqual(['react-burger-menu-btn', 'product-sort-container', 'item-4-img-link', 'item-4-title-link', 'add-to-cart-sauce-labs-backpack']);
  });

  test('[TC-082] Add to cart works with the Enter key @regression', async ({ page, inventoryPage }) => {
    await inventoryPage.addButton('Sauce Labs Onesie').focus();
    await page.keyboard.press('Enter');
    await expect(inventoryPage.removeButton('Sauce Labs Onesie')).toBeVisible();
    await inventoryPage.header.expectCartCount(1);
  });

  test('[TC-083] Escape closes the side menu @regression', async ({ page, inventoryPage }) => {
    await inventoryPage.header.openMenu();
    // The menu ignores Escape while it is still sliding open, so press again until it closes (a person would simply try again).
    await expect(async () => {
      await page.keyboard.press('Escape');
      await expect(page.locator('#logout_sidebar_link')).toBeHidden({ timeout: 500 });
    }).toPass({ timeout: 5000 });
  });

  // KNOWN DEFECT (manual project BUG-020, found while writing this suite): the cart link is an <a role="button"> without
  // an href, so Tab skips it and Enter does nothing. A keyboard-only shopper cannot open the cart.
  test('[TC-086] the cart can be reached with Tab and opened with Enter [BUG-020] @known-bug', async ({ page, inventoryPage, cartPage }) => {
    test.fail(true, 'BUG-020: the cart link cannot be reached or activated with the keyboard');
    let reached = false;
    for (let i = 0; i < 40 && !reached; i++) {
      await page.keyboard.press('Tab');
      reached = (await inventoryPage.focusedKey()) === 'shopping-cart-link';
    }
    expect(reached, 'Tab reaches the cart link').toBe(true);
    await page.keyboard.press('Enter');
    await cartPage.expectOnPage();
  });

  // KNOWN DEFECT (manual project BUG-016): found by keyboard testing; the automated scan reports no violations.
  for (const [name, selector] of [
    ['the menu button', '#react-burger-menu-btn'],
    ['the sort menu', '[data-test="product-sort-container"]'],
    ['an Add to cart button', '[data-test="add-to-cart-sauce-labs-backpack"]'],
    ['the cart link', '.shopping_cart_link'],
  ] as const) {
    test(`[TC-084] keyboard focus is visible on ${name} [BUG-016] @known-bug`, async ({ page }) => {
      test.fail(true, 'BUG-016: no outline, shadow or colour change when a control has keyboard focus');
      await page.locator(selector).focus();
      const style = await page.evaluate(() => {
        const s = getComputedStyle(document.activeElement as Element);
        return { outlineStyle: s.outlineStyle, boxShadow: s.boxShadow };
      });
      expect(style.outlineStyle !== 'none' || style.boxShadow !== 'none', 'a visible focus indicator').toBe(true);
    });
  }

  test('[TC-087] a whole purchase can be completed without a mouse [BUG-020] @known-bug', async ({ page, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage }) => {
    test.fail(true, 'BUG-020: the cart cannot be opened by keyboard, so the purchase cannot continue');
    // Every activation uses focus + keyboard: Enter on buttons and links, typing in the fields.
    await inventoryPage.addButton('Sauce Labs Backpack').focus();
    await page.keyboard.press('Enter');
    await page.locator('.shopping_cart_link').focus();
    await page.keyboard.press('Enter');
    await cartPage.expectOnPage();
    await page.getByTestId('checkout').focus();
    await page.keyboard.press('Enter');
    await checkoutInfoPage.firstName.focus();
    await page.keyboard.type(validInfo.firstName);
    await page.keyboard.press('Tab');
    await page.keyboard.type(validInfo.lastName);
    await page.keyboard.press('Tab');
    await page.keyboard.type(validInfo.postalCode);
    await page.getByTestId('continue').focus();
    await page.keyboard.press('Enter');
    await checkoutOverviewPage.expectOnPage();
    await page.getByTestId('finish').focus();
    await page.keyboard.press('Enter');
    await checkoutCompletePage.expectOrderPlaced();
  });
});
