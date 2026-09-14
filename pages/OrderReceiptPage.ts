import { Page, Locator } from '@playwright/test';
import { TransientPage } from './TransientPage';
import { parseCurrencyAmount } from '../utils/price-utils';
import { requireText } from '../utils/element-utils';

export class OrderReceiptPage extends TransientPage {
  readonly orderNumberText: Locator;
  readonly grandTotal: Locator;
  readonly orderItemRows: Locator;

  constructor(page: Page) {
    super(page);
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
    return requireText(this.orderNumberText);
  }

  async getGrandTotalText(): Promise<string> {
    return requireText(this.grandTotal);
  }

  async getGrandTotalValue(): Promise<number> {
    return parseCurrencyAmount(await this.getGrandTotalText());
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
      const qty = parseInt(await requireText(cells.nth(0)), 10);
      const item = (await requireText(cells.nth(1))).trim();
      const sku = (await requireText(cells.nth(2))).trim();
      const unitPrice = parseCurrencyAmount(await requireText(cells.nth(3)));
      const sum = parseCurrencyAmount(await requireText(cells.nth(5)));
      items.push({ qty, item, sku, unitPrice, sum });
    }
    return items;
  }
}
