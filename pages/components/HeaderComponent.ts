import { Page, Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export class HeaderComponent extends BaseComponent {
  private readonly cartLink: Locator;

  constructor(page: Page) {
    super(page, page.locator('#header'));
    this.cartLink = this.root.locator('#cart a.content');
  }

  async getCartText(): Promise<string> {
    const text = await this.cartLink.textContent();
    if (text === null) {
      throw new Error(
        'Cart link element found but returned no text content.'
      );
    }
    return text;
  }

  async getCartItemCount(): Promise<number> {
    const text = await this.getCartText();
    // Parse "Cart: 3 item(s) - $60" → 3
    const match = text.match(/(\d+)\s+item/);
    if (!match) {
      throw new Error(
        `Failed to parse item count from cart text: "${text}"`
      );
    }
    return parseInt(match[1], 10);
  }

  async getCartTotal(): Promise<number> {
    const text = await this.getCartText();
    // Parse "Cart: 3 item(s) - $59.99" → 59.99
    const match = text.match(/- [$€](\d+(?:\.\d+)?)/);
    if (!match) {
      throw new Error(
        `Failed to parse total price from cart text: "${text}"`
      );
    }
    return parseFloat(match[1]);
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  /** Waits until cart item count exceeds prevCount (polls via Playwright locator) */
  async waitForCartCountAbove(prevCount: number, timeout = 15_000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const current = await this.getCartItemCount().catch(() => prevCount);
      if (current > prevCount) return;
      await this.cartLink.page().waitForTimeout(300);
    }
    throw new Error(
      `Cart item count did not exceed ${prevCount} within ${timeout}ms`,
    );
  }
}