import { test, expect, STANDARD_STATE } from '../fixtures';

test.use({ storageState: STANDARD_STATE });

// [TC-056] desktop, [TC-057] phone, [TC-085] narrow screens of the manual test suite.
const viewports = [
  { tc: 'TC-056', name: 'desktop', width: 1366, height: 768 },
  { tc: '', name: 'tablet', width: 768, height: 1024 },
  { tc: 'TC-057', name: 'phone', width: 375, height: 667 },
  { tc: 'TC-085', name: 'small phone (480)', width: 480, height: 640 },
  { tc: 'TC-085', name: 'narrow phone (320)', width: 320, height: 640 },
];

for (const vp of viewports) {
  test.describe(`${vp.name} ${vp.width}x${vp.height}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`${vp.tc ? `[${vp.tc}] ` : ''}products page has no horizontal scroll @regression`, async ({ page, inventoryPage }) => {
      await inventoryPage.goto();
      await expect(inventoryPage.items.first()).toBeVisible();
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
