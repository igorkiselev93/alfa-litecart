import { Page, Locator } from '@playwright/test';

export class HeaderComponent {
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    this.cartLink = page.locator('#cart a.content');
  }

  async getCartText(): Promise<string> {
    return (await this.cartLink.textContent()) ?? '';
  }

  async getCartItemCount(): Promise<number> {
    const text = await this.getCartText();
    // Parse "Cart: 3 item(s) - $60" → 3
    const match = text.match(/(\d+)\s+item/);
    return match ? parseInt(match[1], 10) : 0;
  }

  async getCartTotal(): Promise<number> {
    const text = await this.getCartText();
    // Parse "Cart: 3 item(s) - $60" → 60
    const match = text.match(/\$(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}