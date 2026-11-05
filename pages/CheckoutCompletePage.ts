import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderMenu } from './components/HeaderMenu';

export class CheckoutCompletePage extends BasePage {
  readonly path = '/checkout-complete.html';
  readonly header: HeaderMenu;
  readonly confirmation: Locator;
  private readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderMenu(page);
    this.confirmation = page.getByTestId('complete-header');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  async expectOrderPlaced(): Promise<void> {
    await expect(this.confirmation).toHaveText('Thank you for your order!');
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
