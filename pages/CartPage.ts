import { type Locator, type Page } from '@playwright/test';
import { BasePage, slug } from './BasePage';
import { HeaderMenu } from './components/HeaderMenu';

export class CartPage extends BasePage {
  readonly path = '/cart.html';
  readonly header: HeaderMenu;
  readonly items: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderMenu(page);
    this.items = page.locator('.cart_item');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueButton = page.getByTestId('continue-shopping');
  }

  async itemNames(): Promise<string[]> {
    return this.page.locator('.cart_item .inventory_item_name').allInnerTexts();
  }

  async remove(name: string): Promise<void> {
    await this.page.getByTestId(`remove-${slug(name)}`).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueButton.click();
  }
}
