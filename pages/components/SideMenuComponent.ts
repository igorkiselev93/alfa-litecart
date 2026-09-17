import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class SideMenuComponent extends BaseComponent {
  private readonly logoutLink: Locator;
  private readonly recentlyViewedItems: Locator;

  constructor(page: Page) {
    super(page, page.locator('aside#navigation'));
    this.logoutLink = this.root.locator('a[href*="logout"]');
    this.recentlyViewedItems = this.root.locator('#box-recently-viewed-products ul li');
  }

  isLoggedIn(): Locator {
    return this.logoutLink;
  }

  /** Waits until the logout link appears — confirms successful login/registration */
  async waitForLoginConfirmation(timeout?: number): Promise<void> {
    await this.logoutLink.waitFor({ state: 'visible', timeout });
  }

  async getRecentlyViewedCount(): Promise<number> {
    return this.recentlyViewedItems.count();
  }

  /** Returns a locator for a specific product in the Recently Viewed block, matched by URL slug */
  getRecentlyViewedItem(name: string): Locator {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    return this.recentlyViewedItems.locator(`a[href*="${slug}"]`);
  }
}
