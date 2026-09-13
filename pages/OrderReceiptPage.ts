import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class OrderReceiptPage extends BasePage {
  // Navigated to directly via dynamic URL from CartPage, no fixed URL
  protected readonly url = '';

  readonly orderNumberText: Locator;
  readonly grandTotal: Locator;
  readonly orderItemRows: Locator;

  constructor(page: Page) {
    super(page);
    // "Order #714" text node
    // XPath: order number div inside header table (e.g. 'Order #714')
    this.orderNumberText = page.locator(
      'xpath=//header//td[last()]//div[contains(text(),"Order #")]',
    );
    // Grand Total strong inside the totals table
    this.grandTotal = page.locator(
      'xpath=//td[.//strong[text()="Grand Total"]]/following-sibling::td//strong',
    );
    // Data rows in the items table (skip header row)
    this.orderItemRows = page.locator('xpath=//table[.//th[text()="Item"]]//tr[not(.//th)]');
  }

  /** Returns the order number string, e.g. "Order #714" */
  async getOrderNumber(): Promise<string> {
    return (await this.orderNumberText.textContent()) ?? '';
  }

  /** Parses Grand Total dollar amount */
  parseAmount(text: string): number {
    const match = text.match(/\$(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async getGrandTotalValue(): Promise<number> {
    const text = (await this.grandTotal.textContent()) ?? '';
    return this.parseAmount(text);
  }

  async getGrandTotalText(): Promise<string> {
    return (await this.grandTotal.textContent()) ?? '';
  }

  /** Returns all item rows as parsed objects */
  async getOrderItems(): Promise<
    Array<{ qty: number; item: string; sku: string; unitPrice: number; sum: number }>
  > {
    const count = await this.orderItemRows.count();
    const items = [];
    for (let i = 0; i < count; i++) {
      const row = this.orderItemRows.nth(i);
      const cells = row.locator('td');
      const qty = parseInt((await cells.nth(0).textContent()) ?? '0', 10);
      const item = ((await cells.nth(1).textContent()) ?? '').trim();
      const sku = ((await cells.nth(2).textContent()) ?? '').trim();
      const unitPrice = this.parseAmount((await cells.nth(3).textContent()) ?? '');
      const sum = this.parseAmount((await cells.nth(5).textContent()) ?? '');
      items.push({ qty, item, sku, unitPrice, sum });
    }
    return items;
  }
}
