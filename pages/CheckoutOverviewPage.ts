import { type Locator, type Page } from '@playwright/test';
import { BasePage, toPrice } from './BasePage';

export class CheckoutOverviewPage extends BasePage {
  readonly path = '/checkout-step-two.html';
  private readonly subtotalLabel: Locator;
  private readonly taxLabel: Locator;
  private readonly totalLabel: Locator;
  private readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
  }

  async itemNames(): Promise<string[]> {
    return this.page.locator('.cart_item .inventory_item_name').allInnerTexts();
  }

  async subtotal(): Promise<number> {
    return toPrice(await this.subtotalLabel.innerText());
  }

  async tax(): Promise<number> {
    return toPrice(await this.taxLabel.innerText());
  }

  async total(): Promise<number> {
    return toPrice(await this.totalLabel.innerText());
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
