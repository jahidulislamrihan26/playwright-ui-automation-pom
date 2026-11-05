import { expect, type Locator, type Page } from '@playwright/test';
import type { User } from '../data/users';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly path = '/';
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;
  private readonly errorClose: Locator;

  constructor(page: Page) {
    super(page);
    this.username = page.getByTestId('username');
    this.password = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
    this.errorClose = page.getByTestId('error-button');
  }

  async login(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  async loginAs(user: User): Promise<void> {
    await this.login(user.username, user.password);
  }

  /** Opens the login page and signs in. */
  async open(user: User): Promise<void> {
    await this.goto();
    await this.loginAs(user);
  }

  async expectError(text: string | RegExp): Promise<void> {
    await expect(this.error).toContainText(text);
  }

  async dismissError(): Promise<void> {
    await this.errorClose.click();
  }

  async expectVisible(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
  }
}
