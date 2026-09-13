import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';

export class HomePage extends BasePage {
  readonly header: HeaderComponent;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
  }

  /** Find a product card link by its exact name */
  getProductLink(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(name, 'i') }).first();
  }

  /** Returns locator for campaign/sale product (has "Sale" badge) */
  getSaleProductLink(name: string): Locator {
    return this.page
      .locator(`li:has(em.sticker) a[href*="${name.toLowerCase().replace(' ', '-')}"]`)
      .first();
  }
}
