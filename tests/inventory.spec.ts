import { test, expect, catalog, STANDARD_STATE } from '../fixtures';

test.use({ storageState: STANDARD_STATE });

test.describe('Product catalogue', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('shows all six products with the right names and prices @smoke @regression', async ({ inventoryPage }) => {
    expect(await inventoryPage.productNames()).toEqual(catalog.map((p) => p.name));
    expect(await inventoryPage.productPrices()).toEqual(catalog.map((p) => p.price));
  });

  test('each product has its own image @regression', async ({ inventoryPage }) => {
    const sources = await inventoryPage.imageSources();
    expect(sources).toHaveLength(6);
    expect(new Set(sources).size).toBe(6);
  });

  test('default sort is Name A to Z @regression', async ({ inventoryPage }) => {
    await expect(inventoryPage.sortSelect).toHaveValue('az');
  });

  const sorts = [
    { option: 'az', label: 'name A to Z', expected: () => [...catalog].map((p) => p.name).sort() },
    { option: 'za', label: 'name Z to A', expected: () => [...catalog].map((p) => p.name).sort().reverse() },
  ] as const;
  for (const s of sorts) {
    test(`sort by ${s.label} @regression`, async ({ inventoryPage }) => {
      await inventoryPage.sortBy(s.option);
      expect(await inventoryPage.productNames()).toEqual(s.expected());
    });
  }

  test('sort by price low to high @smoke @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    expect(prices[0]).toBe(7.99);
  });

  test('sort by price high to low @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.productPrices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
    expect(prices[0]).toBe(49.99);
  });

  for (const product of catalog) {
    test(`detail page for "${product.name}" @regression`, async ({ inventoryPage, productDetailPage }) => {
      await inventoryPage.openProduct(product.name);
      await productDetailPage.expectProduct(product.name, product.price);
      await expect(productDetailPage.description).not.toBeEmpty();
      await productDetailPage.backToProducts();
      await inventoryPage.expectOnPage();
    });
  }

  test('product can be added from its detail page @regression', async ({ inventoryPage, productDetailPage }) => {
    await inventoryPage.openProduct('Sauce Labs Onesie');
    await productDetailPage.addToCart();
    await productDetailPage.header.expectCartCount(1);
  });
});
