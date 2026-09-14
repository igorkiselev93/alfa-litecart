import { Page, Locator } from '@playwright/test';
import { TransientPage } from './TransientPage';
import { OrderReceiptPage } from './OrderReceiptPage';

export class OrderSuccessPage extends TransientPage {
  readonly successHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.successHeading = page.locator('h1');
  }

  async isOrderConfirmed(): Promise<boolean> {
    return this.page.url().includes('order_success');
  }

  /** Extracts the printable order copy URL from the order_success page */
  async getPrintableOrderUrl(): Promise<string> {
    const link = this.page.locator('a[href*="printable_order_copy"]');
    return (await link.getAttribute('href')) ?? '';
  }

  /**
   * Navigates directly to the printable order copy URL.
   * The link uses Fancybox (class="fancybox") — clicking it opens a modal overlay,
   * not a real browser navigation. We extract the href and navigate directly instead.
   */
  async openOrderReceipt(): Promise<OrderReceiptPage> {
    const url = await this.getPrintableOrderUrl();
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
    return new OrderReceiptPage(this.page);
  }
}
