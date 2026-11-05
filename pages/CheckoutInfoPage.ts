import { expect, type Locator, type Page } from '@playwright/test';
import type { CheckoutInfo } from '../data/checkout';
import { BasePage } from './BasePage';

export class CheckoutInfoPage extends BasePage {
  readonly path = '/checkout-step-one.html';
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly error: Locator;
  private readonly continueButton: Locator;
  private readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId('firstName');
    this.lastName = page.getByTestId('lastName');
    this.postalCode = page.getByTestId('postalCode');
    this.error = page.getByTestId('error');
    this.continueButton = page.getByTestId('continue');
    this.cancelButton = page.getByTestId('cancel');
  }

  async fill(info: CheckoutInfo): Promise<void> {
    await this.firstName.fill(info.firstName);
    await this.lastName.fill(info.lastName);
    await this.postalCode.fill(info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async submit(info: CheckoutInfo): Promise<void> {
    await this.fill(info);
    await this.continue();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectError(text: string): Promise<void> {
    await expect(this.error).toContainText(text);
  }
}
