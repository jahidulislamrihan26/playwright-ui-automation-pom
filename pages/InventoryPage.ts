import { type Locator, type Page } from '@playwright/test';
import { BasePage, slug, toPrice } from './BasePage';
import { HeaderMenu } from './components/HeaderMenu';

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export class InventoryPage extends BasePage {
  readonly path = '/inventory.html';
  readonly header: HeaderMenu;
  readonly items: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderMenu(page);
    this.items = page.locator('.inventory_item');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  async productNames(): Promise<string[]> {
    return this.page.locator('.inventory_item_name').allInnerTexts();
  }

  async productPrices(): Promise<number[]> {
    return (await this.page.locator('.inventory_item_price').allInnerTexts()).map(toPrice);
  }

  async imageSources(): Promise<string[]> {
    return this.page.locator('.inventory_item_img img').evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).getAttribute('src') ?? ''));
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  addButton(name: string): Locator {
    return this.page.getByTestId(`add-to-cart-${slug(name)}`);
  }

  removeButton(name: string): Locator {
    return this.page.getByTestId(`remove-${slug(name)}`);
  }

  async addToCart(...names: string[]): Promise<void> {
    for (const n of names) await this.addButton(n).click();
  }

  async removeFromCart(name: string): Promise<void> {
    await this.removeButton(name).click();
  }

  async openProduct(name: string): Promise<void> {
    await this.page.locator('.inventory_item_name', { hasText: name }).click();
  }
}
