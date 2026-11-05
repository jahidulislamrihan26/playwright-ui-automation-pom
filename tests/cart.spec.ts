import { test, expect, catalog, STANDARD_STATE } from '../fixtures';

test.use({ storageState: STANDARD_STATE });

const BACKPACK = 'Sauce Labs Backpack';
const BIKE = 'Sauce Labs Bike Light';
const ONESIE = 'Sauce Labs Onesie';

// These tests click "Add to cart" on purpose: they are about that button. Other specs seed the cart for speed.
test.describe('Shopping cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('[TC-030] adding one product updates the badge and button @smoke @regression', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.header.expectCartCount(1);
    await expect(inventoryPage.removeButton(BACKPACK)).toBeVisible();
    await expect(inventoryPage.addButton(BACKPACK)).toHaveCount(0);
  });

  test('badge counts several products @regression', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(BACKPACK, BIKE, ONESIE);
    await inventoryPage.header.expectCartCount(3);
  });

  test('[TC-076] all six products can be added @regression', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(...catalog.map((p) => p.name));
    await inventoryPage.header.expectCartCount(6);
  });

  test('[TC-031] removing from the products page clears the badge @regression', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.removeFromCart(BACKPACK);
    await inventoryPage.header.expectCartCount(0);
    await expect(inventoryPage.addButton(BACKPACK)).toBeVisible();
  });

  test('[TC-078] double-clicking Add to cart leaves the cart and button consistent @regression', async ({ inventoryPage }) => {
    await inventoryPage.addButton(BACKPACK).dblclick();
    // The second click lands on the Remove button the first click created, so the net result is an empty cart.
    await inventoryPage.header.expectCartCount(0);
    await expect(inventoryPage.addButton(BACKPACK)).toBeVisible();
  });

  test('[TC-032] cart page lists exactly the chosen products @smoke @regression', async ({ inventoryPage, cartPage }) => {
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

  test('[TC-033] Reset App State clears the cart badge @regression', async ({ inventoryPage }) => {
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.header.resetAppState();
    await inventoryPage.header.expectCartCount(0);
  });

  // KNOWN DEFECT (manual project BUG-003). test.fail() = we EXPECT this to fail today;
  // if the site is fixed the test starts "passing unexpectedly" and tells us to remove the annotation.
  test('[TC-034] Reset App State puts the product button back to "Add to cart" [BUG-003] @known-bug', async ({ inventoryPage }) => {
    test.fail(true, 'BUG-003: button still shows Remove after Reset App State');
    await inventoryPage.addToCart(BACKPACK);
    await inventoryPage.header.resetAppState();
    await expect(inventoryPage.addButton(BACKPACK)).toBeVisible();
  });
});

test.describe('Seeded cart (fixture)', () => {
  test('a cart written to storage by the fixture shows up as if the products had been added @regression', async ({ shopWithCart, inventoryPage, cartPage }) => {
    await shopWithCart(BACKPACK, ONESIE);
    await inventoryPage.header.expectCartCount(2);
    await expect(inventoryPage.removeButton(BACKPACK)).toBeVisible();
    await inventoryPage.header.openCart();
    expect(await cartPage.itemNames()).toEqual([BACKPACK, ONESIE]);
  });
});
