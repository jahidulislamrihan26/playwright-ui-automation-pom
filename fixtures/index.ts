import { test as base, expect } from '@playwright/test';
import { CartPage } from '../pages/CartPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { InventoryPage } from '../pages/InventoryPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { byName, catalog } from '../data/products';
import { validInfo } from '../data/checkout';

/** Session saved by tests/auth.setup.ts so tests start already logged in as standard_user. */
export const STANDARD_STATE = '.auth/standard_user.json';

interface Pages {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
  /**
   * Opens the shop with the given products already in the cart.
   * It writes the cart straight into the browser's storage instead of clicking "Add to cart" for each product,
   * so setup takes milliseconds and the test only exercises what it is about. Tests of the Add button itself
   * (cart.spec.ts) still click.
   */
  shopWithCart: (...names: string[]) => Promise<void>;
  /** Starts from a seeded cart and completes the checkout through the real pages. Ends on the confirmation page. */
  completeOrder: (...names: string[]) => Promise<void>;
}

// Each fixture builds a page object only when a test asks for it.
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  productDetailPage: async ({ page }, use) => use(new ProductDetailPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInfoPage: async ({ page }, use) => use(new CheckoutInfoPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),
  shopWithCart: async ({ page, inventoryPage }, use) => {
    await use(async (...names: string[]) => {
      const ids = names.map((n) => byName(n).id);
      // Runs before the page's own scripts, once per tab (the guard stops later page loads from resetting the cart).
      await page.addInitScript((cart) => {
        if (!window.sessionStorage.getItem('cart-seeded')) {
          window.localStorage.setItem('cart-contents', JSON.stringify(cart));
          window.sessionStorage.setItem('cart-seeded', '1');
        }
      }, ids);
      await inventoryPage.goto();
    });
  },
  completeOrder: async ({ shopWithCart, inventoryPage, cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage }, use) => {
    await use(async (...names: string[]) => {
      await shopWithCart(...names);
      await inventoryPage.header.openCart();
      await cartPage.checkout();
      await checkoutInfoPage.submit(validInfo);
      await checkoutOverviewPage.finish();
      await checkoutCompletePage.expectOrderPlaced();
    });
  },
});

export { expect, catalog, validInfo };
