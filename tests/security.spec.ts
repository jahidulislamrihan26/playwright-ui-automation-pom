import { test, expect } from '../fixtures';
import { users } from '../data/users';

// Security checks found by the second round of manual testing (manual-testing project, charter 4).
// "Known defect" tests state the CORRECT behaviour and are marked test.fail().
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Session and transport @security', () => {
  test('[TC-065] a session cannot be forged by setting a cookie [BUG-013] @known-bug', async ({ browser, baseURL }) => {
    test.fail(true, 'BUG-013: the cookie session-username=standard_user opens the shop without a password');
    const context = await browser.newContext();
    await context.addCookies([{ name: 'session-username', value: 'standard_user', url: baseURL }]);
    const page = await context.newPage();
    await page.goto('/inventory.html');
    // Correct behaviour: back at the login page, no products.
    await expect(page.getByTestId('login-button')).toBeVisible({ timeout: 3000 });
    await context.close();
  });

  test('[TC-066] the session cookie is HttpOnly and Secure [BUG-013] @known-bug', async ({ context, loginPage, inventoryPage }) => {
    test.fail(true, 'BUG-013: the cookie holds the plain username and has neither HttpOnly nor Secure');
    await loginPage.open(users.standard);
    await inventoryPage.expectOnPage();
    const cookie = (await context.cookies()).find((c) => c.name === 'session-username');
    expect(cookie, 'session cookie exists').toBeDefined();
    expect(cookie?.httpOnly, 'HttpOnly').toBe(true);
    expect(cookie?.secure, 'Secure').toBe(true);
  });

  test('[TC-067] the session cookie expires after a limited time @regression', async ({ context, loginPage, inventoryPage }) => {
    await loginPage.open(users.standard);
    await inventoryPage.expectOnPage();
    const cookie = (await context.cookies()).find((c) => c.name === 'session-username');
    expect(cookie?.expires, 'has an expiry').toBeGreaterThan(Date.now() / 1000);
    expect(cookie?.expires, 'expires within an hour').toBeLessThan(Date.now() / 1000 + 3600);
  });

  test('[TC-068] plain HTTP is redirected to HTTPS @regression', async ({ request }) => {
    const response = await request.get('http://www.saucedemo.com/', { maxRedirects: 0 });
    expect([301, 308]).toContain(response.status());
    expect(response.headers()['location']).toMatch(/^https:\/\//);
  });

  test('[TC-069] standard security headers are sent [BUG-018] @known-bug', async ({ request }) => {
    test.fail(true, 'BUG-018: none of the five standard security headers are sent');
    const headers = (await request.get('/')).headers();
    for (const h of ['strict-transport-security', 'content-security-policy', 'x-content-type-options', 'referrer-policy']) {
      expect(headers[h], h).toBeDefined();
    }
  });
});

test.describe('Injection @security', () => {
  test('[TC-070] script text in a product address is not executed @regression', async ({ loginPage, page, inventoryPage }) => {
    await loginPage.open(users.standard);
    await inventoryPage.expectOnPage();
    const dialogs: string[] = [];
    page.on('dialog', (d) => { dialogs.push(d.message()); void d.dismiss(); });
    await page.goto('/inventory-item.html?id=<script>alert(1)</script>');
    await expect(page.getByTestId('inventory-item-name')).toHaveText('ITEM NOT FOUND');
    expect(dialogs).toEqual([]);
  });
});
