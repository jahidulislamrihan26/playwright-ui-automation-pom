import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import { test, expect, STANDARD_STATE } from '../fixtures';

// Automated accessibility scan with axe-core (WCAG 2.0/2.1 A and AA rules, including colour contrast) on all 7 pages.
// Rule: no violation of impact "critical". Everything else is attached to the report for review.
// Automated scans find only part of the problems: keyboard focus (BUG-016) is checked in keyboard.spec.ts because axe cannot see it,
// and a screen-reader check is still manual work.
async function scan(page: Page, testInfo: TestInfo) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  await testInfo.attach('axe-violations.json', { body: JSON.stringify(results.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })), null, 2), contentType: 'application/json' });
  return results.violations;
}
const critical = (v: Awaited<ReturnType<typeof scan>>) => v.filter((x) => x.impact === 'critical');

test.describe('Accessibility scan @a11y', () => {
  test('[TC-060] login page has no critical violations', async ({ page, loginPage }, testInfo) => {
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.expectVisible();
    expect(critical(await scan(page, testInfo))).toEqual([]);
  });

  test.describe('signed in', () => {
    test.use({ storageState: STANDARD_STATE });

    test('[TC-060] products page has no critical violations', async ({ page, inventoryPage }, testInfo) => {
      await inventoryPage.goto();
      await expect(inventoryPage.items.first()).toBeVisible();
      expect(critical(await scan(page, testInfo))).toEqual([]);
    });

    test('[TC-060] product detail page has no critical violations', async ({ page, inventoryPage, productDetailPage }, testInfo) => {
      await inventoryPage.goto();
      await inventoryPage.openProduct('Sauce Labs Backpack');
      await productDetailPage.expectProduct('Sauce Labs Backpack', 29.99);
      expect(critical(await scan(page, testInfo))).toEqual([]);
    });

    test('[TC-060] cart page has no critical violations', async ({ page, cartPage }, testInfo) => {
      await cartPage.goto();
      await expect(cartPage.heading).toHaveText('Your Cart');
      expect(critical(await scan(page, testInfo))).toEqual([]);
    });

    test('[TC-060] checkout form has no critical violations', async ({ page, checkoutInfoPage }, testInfo) => {
      await checkoutInfoPage.goto();
      await expect(checkoutInfoPage.firstName).toBeVisible();
      expect(critical(await scan(page, testInfo))).toEqual([]);
    });

    test('[TC-060] checkout overview has no critical violations', async ({ page, shopWithCart, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage }, testInfo) => {
      await shopWithCart('Sauce Labs Backpack');
      await inventoryPage.header.openCart();
      await cartPage.checkout();
      await checkoutInfoPage.submit({ firstName: 'Test', lastName: 'User', postalCode: '12345' });
      await checkoutOverviewPage.expectOnPage();
      expect(critical(await scan(page, testInfo))).toEqual([]);
    });

    test('[TC-060] order confirmation has no critical violations', async ({ page, completeOrder, checkoutCompletePage }, testInfo) => {
      await completeOrder('Sauce Labs Backpack');
      await expect(checkoutCompletePage.confirmation).toBeVisible();
      expect(critical(await scan(page, testInfo))).toEqual([]);
    });
  });
});
