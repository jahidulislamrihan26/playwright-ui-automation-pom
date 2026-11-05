import AxeBuilder from '@axe-core/playwright';
import { test, expect, STANDARD_STATE } from '../fixtures';

// Automated accessibility scan with axe-core (WCAG 2.0/2.1 A and AA rules).
// Rule: no violation of impact "critical". Everything else is attached to the report for review.
// Automated scans find only some problems; they do not replace a manual check with a screen reader.
async function scan(page: import('@playwright/test').Page, testInfo: import('@playwright/test').TestInfo) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  await testInfo.attach('axe-violations.json', { body: JSON.stringify(results.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })), null, 2), contentType: 'application/json' });
  return results.violations;
}

test.describe('Accessibility scan @a11y', () => {
  test('login page has no critical violations', async ({ page, loginPage }, testInfo) => {
    await page.context().clearCookies();
    await loginPage.goto();
    await loginPage.expectVisible();
    const v = await scan(page, testInfo);
    expect(v.filter((x) => x.impact === 'critical')).toEqual([]);
  });

  test.describe('signed in', () => {
    test.use({ storageState: STANDARD_STATE });

    test('products page has no critical violations', async ({ page, inventoryPage }, testInfo) => {
      await inventoryPage.goto();
      await expect(inventoryPage.items.first()).toBeVisible();
      expect((await scan(page, testInfo)).filter((x) => x.impact === 'critical')).toEqual([]);
    });

    test('cart page has no critical violations', async ({ page, cartPage }, testInfo) => {
      await cartPage.goto();
      await expect(cartPage.heading).toHaveText('Your Cart');
      expect((await scan(page, testInfo)).filter((x) => x.impact === 'critical')).toEqual([]);
    });

    test('checkout form has no critical violations', async ({ page, checkoutInfoPage }, testInfo) => {
      await checkoutInfoPage.goto();
      await expect(checkoutInfoPage.firstName).toBeVisible();
      expect((await scan(page, testInfo)).filter((x) => x.impact === 'critical')).toEqual([]);
    });
  });
});
