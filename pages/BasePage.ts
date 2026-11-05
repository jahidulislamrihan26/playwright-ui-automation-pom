import { expect, type Locator, type Page } from '@playwright/test';

/** Parent of every page object: holds the Page and what all pages share. */
export abstract class BasePage {
  /** Path of the page, used by goto() and expectOnPage(). */
  abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  /** Page heading such as "Products" or "Your Cart". */
  get heading(): Locator {
    return this.page.getByTestId('title');
  }

  /** Identifies the element that currently has keyboard focus: its data-test, else its id, else its tag. */
  async focusedKey(): Promise<string> {
    return this.page.evaluate(() => {
      const e = document.activeElement;
      return (e && (e.getAttribute('data-test') || e.id || e.tagName)) || 'none';
    });
  }

  async expectOnPage(): Promise<void> {
    const escaped = this.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(this.page).toHaveURL(new RegExp(`${escaped}(\\?.*)?$`)); // allow a query string such as ?id=4
  }
}

export const toPrice = (text: string): number => Number(text.replace(/[^0-9.]/g, ''));
export const slug = (name: string): string => name.toLowerCase().replace(/ /g, '-');
