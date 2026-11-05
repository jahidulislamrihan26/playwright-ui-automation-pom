import { test as setup, expect } from '@playwright/test';
import { users } from '../data/users';
import { STANDARD_STATE } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

// Runs once before the other projects: log in and save the session to disk.
setup('log in as standard_user and save session', async ({ page }) => {
  await new LoginPage(page).open(users.standard);
  await new InventoryPage(page).expectOnPage();
  await expect(page.locator('.inventory_item').first()).toBeVisible();
  await page.context().storageState({ path: STANDARD_STATE });
});
