import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage, toPrice } from './BasePage';
import { HeaderMenu } from './components/HeaderMenu';

export class ProductDetailPage extends BasePage {
  readonly path = '/inventory-item.html';
  readonly header: HeaderMenu;
  readonly name: Locator;
  readonly description: Locator;
  private readonly price: Locator;
  private readonly addButton: Locator;
  private readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderMenu(page);
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    this.addButton = page.getByTestId('add-to-cart');
    this.backButton = page.getByTestId('back-to-products');
  }

  async priceValue(): Promise<number> {
    return toPrice(await this.price.innerText());
  }

  async addToCart(): Promise<void> {
    await this.addButton.click();
  }

  async backToProducts(): Promise<void> {
    await this.backButton.click();
  }

  async expectProduct(name: string, price: number): Promise<void> {
    await this.expectOnPage();
    await expect(this.backButton).toBeVisible(); // detail view is drawn; before this the list page's names also match
    await expect(this.name).toHaveText(name);
    expect(await this.priceValue()).toBe(price);
  }
}
