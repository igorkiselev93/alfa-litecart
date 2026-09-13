import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderComponent } from './components/HeaderComponent';

export class HomePage extends BasePage {
  protected readonly url = '/en/';

  readonly header: HeaderComponent;
  readonly recentlyViewedSection: Locator;
  readonly recentlyViewedItems: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.recentlyViewedSection = page.locator('#box-recently-viewed-products h3.title');
    this.recentlyViewedItems = page.locator('#box-recently-viewed-products ul li');
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

  async getRecentlyViewedCount(): Promise<number> {
    return this.recentlyViewedItems.count();
  }

  async isProductInRecentlyViewed(name: string): Promise<boolean> {
    const items = this.recentlyViewedItems;
    const count = await items.count();
    // Recently Viewed items contain only an image link — match by href slug
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    for (let i = 0; i < count; i++) {
      const href = await items.nth(i).locator('a').getAttribute('href');
      if (href?.includes(slug)) return true;
    }
    return false;
  }
}
