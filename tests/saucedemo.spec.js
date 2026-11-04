const { test, expect } = require('@playwright/test');

async function login(page, user = 'standard_user', pass = 'secret_sauce') {
  await page.goto('/');
  await page.locator('[data-test="username"]').fill(user);
  await page.locator('[data-test="password"]').fill(pass);
  await page.locator('[data-test="login-button"]').click();
}

test.describe('Login', () => {
  test('valid user reaches products page', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test('locked out user sees error', async ({ page }) => {
    await login(page, 'locked_out_user');
    await expect(page.locator('[data-test="error"]')).toContainText('locked out');
  });

  test('wrong password sees error', async ({ page }) => {
    await login(page, 'standard_user', 'wrong');
    await expect(page.locator('[data-test="error"]')).toContainText('do not match');
  });

  test('empty username sees error', async ({ page }) => {
    await login(page, '', 'secret_sauce');
    await expect(page.locator('[data-test="error"]')).toContainText('Username is required');
  });
});

test.describe('Products and cart', () => {
  test('sort by price low to high', async ({ page }) => {
    await login(page);
    await page.locator('[data-test="product-sort-container"]').selectOption('lohi');
    const prices = (await page.locator('.inventory_item_price').allTextContents())
      .map((p) => parseFloat(p.replace('$', '')));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('add and remove item updates cart badge', async ({ page }) => {
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();
    await expect(page.locator('.shopping_cart_badge')).toHaveCount(0);
  });
});

test.describe('Checkout', () => {
  test('complete purchase', async ({ page }) => {
    await login(page);
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill('Test');
    await page.locator('[data-test="lastName"]').fill('User');
    await page.locator('[data-test="postalCode"]').fill('12345');
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });

  test('missing first name shows error', async ({ page }) => {
    await login(page);
    await page.locator('.shopping_cart_link').click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="error"]')).toContainText('First Name is required');
  });

  test('logout returns to login page', async ({ page }) => {
    await login(page);
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('[data-test="logout-sidebar-link"]').click();
    await expect(page.locator('[data-test="login-button"]')).toBeVisible();
  });
});
