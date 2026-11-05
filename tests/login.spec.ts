import { test, expect } from '../fixtures';
import { users } from '../data/users';

// Login tests start logged out.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test('valid user reaches the products page @smoke @regression', async ({ loginPage, inventoryPage }) => {
    await loginPage.open(users.standard);
    await inventoryPage.expectOnPage();
    await expect(inventoryPage.heading).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(6);
  });

  const rejected = [
    { title: 'locked out user', user: users.lockedOut.username, pass: users.lockedOut.password, error: 'locked out' },
    { title: 'wrong password', user: users.standard.username, pass: 'wrong_password', error: 'do not match' },
    { title: 'unknown user', user: 'nobody', pass: 'secret_sauce', error: 'do not match' },
    { title: 'empty username', user: '', pass: 'secret_sauce', error: 'Username is required' },
    { title: 'empty password', user: 'standard_user', pass: '', error: 'Password is required' },
    { title: 'both fields empty', user: '', pass: '', error: 'Username is required' },
    { title: 'username in wrong case', user: 'Standard_User', pass: 'secret_sauce', error: 'do not match' },
    { title: 'username with leading space', user: ' standard_user', pass: 'secret_sauce', error: 'do not match' },
    { title: 'SQL injection text', user: "' OR 1=1 --", pass: 'x', error: 'do not match' },
  ];
  for (const c of rejected) {
    test(`is rejected: ${c.title} @regression`, async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.login(c.user, c.pass);
      await loginPage.expectError(c.error);
      await expect(page).toHaveURL(/\/$/);
    });
  }

  test('password field masks what is typed @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });

  test('error banner can be dismissed @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', '');
    await expect(loginPage.error).toBeVisible();
    await loginPage.dismissError();
    await expect(loginPage.error).toHaveCount(0);
  });

  test('Enter key submits the form @regression', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.username.fill(users.standard.username);
    await loginPage.password.fill(users.standard.password);
    await loginPage.password.press('Enter');
    await inventoryPage.expectOnPage();
  });

});

test.describe('Session and access control', () => {
  for (const path of ['/inventory.html', '/cart.html', '/checkout-step-one.html']) {
    test(`${path} is blocked without login @smoke @regression`, async ({ page, loginPage }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/$/);
      await loginPage.expectError(/You can only access/);
    });
  }

  test('logout returns to the login page @smoke @regression', async ({ loginPage, inventoryPage }) => {
    await loginPage.open(users.standard);
    await inventoryPage.header.logout();
    await loginPage.expectVisible();
  });

  test('Back button after logout does not reopen the shop @regression', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.open(users.standard);
    await inventoryPage.header.logout();
    await page.goBack();
    await loginPage.expectError(/You can only access/);
    await expect(inventoryPage.items).toHaveCount(0);
  });
});
