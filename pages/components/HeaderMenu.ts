import { expect, type Locator, type Page } from '@playwright/test';

/** The top bar and side menu that appear on every page after login. */
export class HeaderMenu {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  private readonly menuButton: Locator;
  private readonly logoutLink: Locator;
  private readonly resetLink: Locator;
  private readonly allItemsLink: Locator;

  constructor(private readonly page: Page) {
    this.cartLink = page.locator('.shopping_cart_link');
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.resetLink = page.locator('#reset_sidebar_link');
    this.allItemsLink = page.locator('#inventory_sidebar_link');
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click();
    await expect(this.logoutLink).toBeVisible();
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetLink.click();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  /** Number in the cart badge; 0 when the badge is not shown. */
  async cartCount(): Promise<number> {
    return (await this.cartBadge.count()) === 0 ? 0 : Number(await this.cartBadge.innerText());
  }

  async expectCartCount(n: number): Promise<void> {
    if (n === 0) await expect(this.cartBadge).toHaveCount(0);
    else await expect(this.cartBadge).toHaveText(String(n));
  }

  get allItems(): Locator {
    return this.allItemsLink;
  }

  /** Where the "About" link points (the link exists in the page even while the menu is closed). */
  async aboutHref(): Promise<string | null> {
    return this.page.locator('#about_sidebar_link').getAttribute('href');
  }

  /** Addresses of the social links in the page footer. */
  async footerLinks(): Promise<string[]> {
    return this.page.locator('footer a').evaluateAll((a) => a.map((x) => (x as HTMLAnchorElement).href));
  }
}
