import { test, expect, STANDARD_STATE } from '../fixtures';

test.use({ storageState: STANDARD_STATE });

const viewports = [
  { name: 'phone', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1366, height: 768 },
];

for (const vp of viewports) {
  test.describe(`${vp.name} ${vp.width}x${vp.height}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('products page has no horizontal scroll @regression', async ({ page, inventoryPage }) => {
      await inventoryPage.goto();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow).toBe(false);
    });

    test('cart and menu are usable @regression', async ({ inventoryPage, cartPage }) => {
      await inventoryPage.goto();
      await inventoryPage.addToCart('Sauce Labs Backpack');
      await inventoryPage.header.openCart();
      await cartPage.expectOnPage();
      await cartPage.header.openMenu();
      await expect(cartPage.header.allItems).toBeVisible();
    });
  });
}
