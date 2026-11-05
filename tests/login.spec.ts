import { test, expect } from '../fixtures';
import { users } from '../data/users';

// Login tests start logged out. [TC-nnn] in a title links the test to a case in the manual test suite.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test('[TC-001] valid user reaches the products page @smoke @regression', async ({ loginPage, inventoryPage }) => {
    await loginPage.open(users.standard);
    await inventoryPage.expectOnPage();
    await expect(inventoryPage.heading).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(6);
  });

  const rejected = [
    { tc: 'TC-002', title: 'locked out user', user: users.lockedOut.username, pass: users.lockedOut.password, error: 'locked out' },
    { tc: 'TC-003', title: 'wrong password', user: users.standard.username, pass: 'wrong_password', error: 'do not match' },
    { tc: '', title: 'unknown user', user: 'nobody', pass: 'secret_sauce', error: 'do not match' },
    { tc: 'TC-004', title: 'empty username', user: '', pass: 'secret_sauce', error: 'Username is required' },
    { tc: 'TC-005', title: 'empty password', user: 'standard_user', pass: '', error: 'Password is required' },
    { tc: 'TC-006', title: 'both fields empty', user: '', pass: '', error: 'Username is required' },
    { tc: 'TC-007', title: 'username in wrong case', user: 'Standard_User', pass: 'secret_sauce', error: 'do not match' },
    { tc: 'TC-008', title: 'username with leading space', user: ' standard_user', pass: 'secret_sauce', error: 'do not match' },
    { tc: 'TC-009', title: 'SQL injection text', user: "' OR 1=1 --", pass: 'x', error: 'do not match' },
  ];
  for (const c of rejected) {
    test(`${c.tc ? `[${c.tc}] ` : ''}is rejected: ${c.title} @regression`, async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.login(c.user, c.pass);
      await loginPage.expectError(c.error);
      await expect(page).toHaveURL(/\/$/);
    });
  }

  test('[TC-010] password field masks what is typed @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });

  test('[TC-012] error banner can be dismissed @regression', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('', '');
    await expect(loginPage.error).toBeVisible();
    await loginPage.dismissError();
    await expect(loginPage.error).toHaveCount(0);
  });

  test('[TC-011] Enter key submits the form @regression', async ({ loginPage, inventoryPage }) => {
    await loginPage.goto();
    await loginPage.username.fill(users.standard.username);
    await loginPage.password.fill(users.standard.password);
    await loginPage.password.press('Enter');
    await inventoryPage.expectOnPage();
  });

  test('[TC-013] Tab moves from username to password to the Login button @a11y @regression', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.username.focus();
    await page.keyboard.press('Tab');
    await expect(loginPage.password).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(loginPage.loginButton).toBeFocused();
  });
});

test.describe('Session and access control', () => {
  for (const path of ['/inventory.html', '/cart.html', '/checkout-step-one.html']) {
    test(`[TC-015] ${path} is blocked without login @smoke @regression`, async ({ page, loginPage }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/$/);
      await loginPage.expectError(/You can only access/);
    });
  }

  test('[TC-017] logout returns to the login page @smoke @regression', async ({ loginPage, inventoryPage }) => {
    await loginPage.open(users.standard);
    await inventoryPage.header.logout();
    await loginPage.expectVisible();
  });

  test('[TC-016] Back button after logout does not reopen the shop @regression', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.open(users.standard);
    await inventoryPage.header.logout();
    await page.goBack();
    await loginPage.expectError(/You can only access/);
    await expect(inventoryPage.items).toHaveCount(0);
  });

  // Documents current behaviour (an open product question in the manual test plan): the cart survives logout and login.
  test('[TC-018] the cart is kept after logout and login (current behaviour) @regression', async ({ loginPage, inventoryPage }) => {
    await loginPage.open(users.standard);
    await inventoryPage.addToCart('Sauce Labs Backpack');
    await inventoryPage.header.logout();
    await loginPage.open(users.standard);
    await inventoryPage.header.expectCartCount(1);
  });
});
