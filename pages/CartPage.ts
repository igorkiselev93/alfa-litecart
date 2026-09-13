import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartItems: Locator;
  readonly confirmOrderButton: Locator;
  readonly paymentDueRow: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = page.locator('#box-checkout-cart ul.shortcuts li');
    this.confirmOrderButton = page.locator('button[name="confirm_order"]');
    this.paymentDueRow = page.locator(
      'xpath=//tr[.//strong[contains(text(),"Payment Due")]]//strong[last()]'
    );
  }

  async goto(): Promise<void> {
    await super.goto('/en/checkout');
  }

  async getCartItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async getPaymentDueText(): Promise<string> {
    return (await this.paymentDueRow.textContent()) ?? '';
  }

  /** Parse dollar amount from payment due cell */
  parseTotal(text: string): number {
    const match = text.match(/\$(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async getPaymentDueValue(): Promise<number> {
    const text = await this.getPaymentDueText();
    return this.parseTotal(text);
  }

  async confirmOrder(): Promise<void> {
    await this.confirmOrderButton.click();
    await this.page.waitForURL(/order_confirmation|checkout/, { timeout: 15_000 });
  }
}
