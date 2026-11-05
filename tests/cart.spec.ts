import { test, expect, STANDARD_STATE } from '../fixtures';

test.use({ storageState: STANDARD_STATE });

const BACKPACK = 'Sauce Labs Backpack';
const BIKE = 'Sauce Labs Bike Light';
const ONESIE = 'Sauce Labs Onesie';

test.describe('Shopping cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('adding one product updates the badge and button @smoke @regression', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.header.expectCartCount(1);
    await expect(inventoryPage.removeButton(BACKPACK)).toBeVisible();
    await expect(inventoryPage.addButton(BACKPACK)).toHaveCount(0);
  });

  test('badge counts several products @regression', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(BACKPACK, BIKE, ONESIE);
    await inventoryPage.header.expectCartCount(3);
  });

  test('removing from the products page clears the badge @regression', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.removeFromCart(BACKPACK);
    await inventoryPage.header.expectCartCount(0);
    await expect(inventoryPage.addButton(BACKPACK)).toBeVisible();
  });

  test('cart page lists exactly the chosen products @smoke @regression', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(BIKE, ONESIE);
    await inventoryPage.header.openCart();
    await cartPage.expectOnPage();
    await expect(cartPage.heading).toHaveText('Your Cart');
    expect(await cartPage.itemNames()).toEqual([BIKE, ONESIE]);
  });

  test('removing from the cart page updates the list and badge @regression', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(BACKPACK, BIKE);
    await inventoryPage.header.openCart();
    await cartPage.remove(BACKPACK);
    expect(await cartPage.itemNames()).toEqual([BIKE]);
    await cartPage.header.expectCartCount(1);
  });

  test('cart contents survive moving between pages @regression', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.header.openCart();
    await cartPage.continueShopping();
    await inventoryPage.expectOnPage();
    await inventoryPage.header.expectCartCount(1);
    await expect(inventoryPage.removeButton(BACKPACK)).toBeVisible();
  });

  test('cart contents survive a page reload @regression', async ({ page, inventoryPage }) => {
    await inventoryPage.addToCart(ONESIE);
    await page.reload();
    await inventoryPage.header.expectCartCount(1);
  });

  test('Reset App State clears the cart badge @regression', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.header.resetAppState();
    await inventoryPage.header.expectCartCount(0);
  });

  // KNOWN DEFECT (manual project BUG-003). test.fail() = we EXPECT this to fail today;
  // if the site is fixed the test starts "passing unexpectedly" and tells us to remove the annotation.
  test('Reset App State puts the product button back to "Add to cart" @known-bug', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-003: button still shows Remove after Reset App State');
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.header.resetAppState();
    await expect(inventoryPage.addButton(BACKPACK)).toBeVisible();
  });
});
