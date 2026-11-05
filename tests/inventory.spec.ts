import { test, expect, catalog, STANDARD_STATE } from '../fixtures';

test.use({ storageState: STANDARD_STATE });

test.describe('Product catalogue', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('[TC-019] shows all six products with the right names and prices @smoke @regression', async ({ inventoryPage }) => {
    expect(await inventoryPage.productNames()).toEqual(catalog.map((p) => p.name));
    expect(await inventoryPage.productPrices()).toEqual(catalog.map((p) => p.price));
  });

  test('each product has its own image @regression', async ({ inventoryPage }) => {
    const sources = await inventoryPage.imageSources();
    expect(sources).toHaveLength(6);
    expect(new Set(sources).size).toBe(6);
  });

  test('[TC-024] default sort is Name A to Z @regression', async ({ inventoryPage }) => {
    await expect(inventoryPage.sortSelect).toHaveValue('az');
  });

  test('sort by name A to Z @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');
    expect(await inventoryPage.productNames()).toEqual(catalog.map((p) => p.name).sort());
  });

  test('[TC-025] sort by name Z to A @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    expect(await inventoryPage.productNames()).toEqual(catalog.map((p) => p.name).sort().reverse());
  });

  test('[TC-026] sort by price low to high @smoke @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(prices[0]).toBe(7.99);
  });

  test('[TC-027] sort by price high to low @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
    expect(prices[0]).toBe(49.99);
  });

  for (const product of catalog) {
    test(`[TC-021] detail page for "${product.name}" @regression`, async ({ inventoryPage, productDetailPage }) => {
      await inventoryPage.openProduct(product.name);
      await productDetailPage.expectProduct(product.name, product.price);
      await expect(productDetailPage.description).not.toBeEmpty();
      await productDetailPage.backToProducts();
      await inventoryPage.expectOnPage();
    });
  }

  test('[TC-079] a product added from its detail page shows as added in the list @regression', async ({ inventoryPage, productDetailPage }) => {
    await inventoryPage.openProduct('Sauce Labs Bike Light');
    await productDetailPage.addToCart();
    await productDetailPage.header.expectCartCount(1);
    await productDetailPage.backToProducts();
    await expect(inventoryPage.removeButton('Sauce Labs Bike Light')).toBeVisible();
  });

  // KNOWN DEFECT (manual project BUG-017). test.fail() = we EXPECT this to fail today.
  test('[TC-080] the chosen sort order is kept after viewing a product [BUG-017] @known-bug', async ({ inventoryPage, productDetailPage }) => {
    test.fail(true, 'BUG-017: sort resets to Name A to Z after viewing a product');
    await inventoryPage.sortBy('hilo');
    await inventoryPage.openProduct('Sauce Labs Fleece Jacket');
    await productDetailPage.backToProducts();
    await expect(inventoryPage.sortSelect).toHaveValue('hilo');
  });

  test('[TC-020] every product image has alt text equal to the product name @a11y @regression', async ({ page }) => {
    const alts = await page.locator('.inventory_item_img img').evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).alt));
    expect(alts).toEqual(catalog.map((p) => p.name));
  });

  test('[TC-059] the page has a title and a language @a11y @regression', async ({ page }) => {
    await expect(page).toHaveTitle('Swag Labs');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('[TC-054] the About link points to saucelabs.com @regression', async ({ inventoryPage }) => {
    expect(await inventoryPage.header.aboutHref()).toContain('saucelabs.com');
  });

  test('[TC-055] the footer has the three social links @regression', async ({ inventoryPage }) => {
    const links = await inventoryPage.header.footerLinks();
    expect(links).toHaveLength(3);
    expect(links.join(' ')).toMatch(/x\.com.*facebook\.com.*linkedin\.com/);
  });
});
